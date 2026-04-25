// Package startup — hook yang jalan saat ws-api boot.
// Saat ini: auto-sync /system/routes ke man_akses.ws_endpoint supaya
// authorization middleware + halaman manajemen akses selalu in-sync.
package startup

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

// SyncEndpointsConfig konfigurasi untuk sync process.
type SyncEndpointsConfig struct {
	AppID string // UUID dari man_akses.aplikasi (env WS_AUTH_APP_ID)
	DB    *sqlx.DB
	App   *fiber.App
}

// Route represents one HTTP route sebagai row ws_endpoint.
type Route struct {
	Method    string
	Path      string
	NmGroup   string
	NmEndpoint string
}

// SyncEndpointsAsync fire-and-forget goroutine: wait beberapa detik supaya app
// siap menerima traffic, lalu trigger sync ke DB. Non-blocking untuk startup.
//
// Behavior:
//   - Kalau AppID kosong atau DB nil → skip (log warning)
//   - Untuk setiap route, UPSERT ke man_akses.ws_endpoint
//   - Soft-deleted row di-reactivate kalau ketemu lagi
//   - Row yang tidak ada di /system/routes TIDAK dihapus (passive)
//   - Return stats: inserted, updated, reactivated
func SyncEndpointsAsync(cfg SyncEndpointsConfig) {
	if cfg.AppID == "" {
		log.Println("⚠️  [startup] WS_AUTH_APP_ID kosong — skip endpoint sync")
		return
	}
	if cfg.DB == nil || cfg.App == nil {
		log.Println("⚠️  [startup] DB atau App nil — skip endpoint sync")
		return
	}

	go func() {
		// Wait supaya app fully booted + siap listen.
		time.Sleep(3 * time.Second)

		routes := collectRoutes(cfg.App)
		if len(routes) == 0 {
			log.Println("⚠️  [startup] tidak ada route untuk disinkron")
			return
		}

		stats, err := syncRoutesToDB(context.Background(), cfg.DB, cfg.AppID, routes)
		if err != nil {
			log.Printf("❌ [startup] endpoint sync error: %v", err)
			return
		}
		log.Printf("✅ [startup] endpoint sync done — %d total, %d inserted, %d updated, %d reactivated (app=%s)",
			len(routes), stats.Inserted, stats.Updated, stats.Reactivated, cfg.AppID)
	}()
}

type syncStats struct {
	Inserted    int
	Updated     int
	Reactivated int
}

// collectRoutes walk semua registered routes dari fiber.App, filter:
//   - internal path (/system, /health, /docs, /)
//   - group-root middleware artifacts (fiber.GetRoutes() return entry untuk
//     setiap method pada .Group().Use() — path cuma /v1/<group> tanpa segment
//     berikutnya. Itu bukan endpoint aktual, skip).
func collectRoutes(app *fiber.App) []Route {
	seen := make(map[string]bool)
	var result []Route
	valid := map[string]bool{"GET": true, "POST": true, "PUT": true, "DELETE": true, "PATCH": true}

	for _, r := range app.GetRoutes() {
		if !valid[r.Method] {
			continue
		}
		// Skip internal/system/docs routes.
		if r.Path == "/" || r.Path == "/health" {
			continue
		}
		if strings.HasPrefix(r.Path, "/system") || strings.HasPrefix(r.Path, "/docs") {
			continue
		}
		// Skip DEPRECATED /v1/pdrd/* — masih ke-register untuk backward compat
		// tapi jangan masuk ws_endpoint supaya user tidak grant akses ke alias
		// lama (gantinya: /v1/mahasiswa, /v1/sdm, /v1/pegawai, /v1/penelitian).
		if strings.HasPrefix(r.Path, "/v1/pdrd") {
			continue
		}
		// Skip group-root middleware artifacts: path /v1/<group> tanpa segment
		// endpoint di belakangnya. Minimal harus ada 3 segment setelah split "/"
		// (empty, "v1", "<group>", "<endpoint>" → len 4).
		if IsGroupRootPath(r.Path) {
			continue
		}

		key := r.Method + ":" + r.Path
		if seen[key] {
			continue
		}
		seen[key] = true

		result = append(result, Route{
			Method:     r.Method,
			Path:       r.Path,
			NmGroup:    deriveGroup(r.Path),
			NmEndpoint: deriveEndpointName(r.Path),
		})
	}
	return result
}

// IsGroupRootPath true untuk path yang hanya terdiri dari prefix + 1 group
// (contoh: /v1/siakadu, /v1/mbkm). fiber auto-register method route ke path
// ini saat Group().Use() dipakai untuk middleware.
func IsGroupRootPath(path string) bool {
	// Split /v1/siakadu → ["", "v1", "siakadu"] len=3
	parts := strings.Split(path, "/")
	return len(parts) == 3 && parts[0] == "" && parts[1] == "v1"
}

// deriveGroup: /v1/mahasiswa/list_mahasiswa → "mahasiswa"
func deriveGroup(path string) string {
	trimmed := strings.TrimPrefix(path, "/v1/")
	parts := strings.SplitN(trimmed, "/", 2)
	if len(parts) > 0 && parts[0] != "" {
		return parts[0]
	}
	return "uncategorized"
}

// deriveEndpointName: /v1/mahasiswa/list_mahasiswa → "list_mahasiswa"
// Untuk URL dgn param (:id), drop param part.
func deriveEndpointName(path string) string {
	trimmed := strings.TrimPrefix(path, "/v1/")
	parts := strings.Split(trimmed, "/")
	if len(parts) >= 2 {
		// Ambil segment terakhir yang bukan parameter
		for i := len(parts) - 1; i >= 0; i-- {
			seg := parts[i]
			if seg != "" && !strings.HasPrefix(seg, ":") {
				return seg
			}
		}
	}
	return "root"
}

// syncRoutesToDB upsert semua routes ke man_akses.ws_endpoint.
func syncRoutesToDB(ctx context.Context, db *sqlx.DB, appID string, routes []Route) (syncStats, error) {
	var stats syncStats

	for _, rt := range routes {
		st, err := upsertOne(ctx, db, appID, rt)
		if err != nil {
			log.Printf("  ⚠️  upsert %s %s: %v", rt.Method, rt.Path, err)
			continue // best-effort: lanjut ke next row
		}
		switch st {
		case "inserted":
			stats.Inserted++
		case "updated":
			stats.Updated++
		case "reactivated":
			stats.Reactivated++
		}
	}
	return stats, nil
}

// upsertOne cari existing row + handle 3 case: reactivate, update, insert.
func upsertOne(ctx context.Context, db *sqlx.DB, appID string, rt Route) (string, error) {
	var existing struct {
		ID         string  `db:"id_ws_endpoint"`
		NmGroup    string  `db:"nm_group"`
		NmEndpoint *string `db:"nm_endpoint"`
		SoftDelete *int    `db:"soft_delete"`
		AActive    int     `db:"a_active"`
	}

	q := `SELECT id_ws_endpoint, nm_group, nm_endpoint, soft_delete, a_active
		FROM man_akses.ws_endpoint
		WHERE id_aplikasi = @p1 AND nm_method = @p2 AND path_url = @p3`

	err := db.QueryRowxContext(ctx, q, appID, rt.Method, rt.Path).StructScan(&existing)
	if err == sql.ErrNoRows {
		return "inserted", insertNew(ctx, db, appID, rt)
	}
	if err != nil {
		return "", fmt.Errorf("lookup: %w", err)
	}

	// Existing row: reactivate kalau soft-deleted, atau update kalau berubah.
	softDeleted := existing.SoftDelete != nil && *existing.SoftDelete == 1
	needUpdate := softDeleted ||
		existing.NmGroup != rt.NmGroup ||
		(existing.NmEndpoint == nil || *existing.NmEndpoint != rt.NmEndpoint) ||
		existing.AActive == 0

	if !needUpdate {
		return "noop", nil
	}

	_, err = db.ExecContext(ctx, `
		UPDATE man_akses.ws_endpoint
		SET nm_group = @p1, nm_endpoint = @p2,
		    soft_delete = 0, a_active = 1,
		    updated_at = GETDATE(), last_sync = GETDATE()
		WHERE id_ws_endpoint = @p3`,
		rt.NmGroup, rt.NmEndpoint, existing.ID)
	if err != nil {
		return "", fmt.Errorf("update: %w", err)
	}
	if softDeleted {
		return "reactivated", nil
	}
	return "updated", nil
}

func insertNew(ctx context.Context, db *sqlx.DB, appID string, rt Route) error {
	_, err := db.ExecContext(ctx, `
		INSERT INTO man_akses.ws_endpoint (
			id_ws_endpoint, id_aplikasi, nm_group, nm_method, nm_endpoint, path_url,
			a_active, soft_delete, created_at, updated_at, last_sync
		) VALUES (
			@p1, @p2, @p3, @p4, @p5, @p6,
			1, 0, GETDATE(), GETDATE(), GETDATE()
		)`,
		uuid.New().String(), appID, rt.NmGroup, rt.Method, rt.NmEndpoint, rt.Path)
	return err
}

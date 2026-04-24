package kontribusi

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"

	"github.com/myunila/api-service/internal/response"
)

// ============================================================================
// Prestasi CRUD extension (Batch 15) — extend pdrd.prestasi dari GET-only ke full CRUD.
// Dipakai oleh aplikasi prestasi mahasiswa (sementara pakai tabel pdut).
// ============================================================================

var ErrNotFound = errors.New("kontribusi: record not found")

// ---------- DTO ----------

type PrestasiCreate struct {
	IDPrestasi      *string `json:"id_prestasi"` // optional auto-generate
	IDJenisPrestasi int     `json:"id_jenis_prestasi" validate:"required"`
	IDTktPrestasi   int     `json:"id_tkt_prestasi" validate:"required"`
	IDAktMhs        *string `json:"id_akt_mhs"`
	IDPd            string  `json:"id_pd" validate:"required"`
	IDSp            string  `json:"id_sp" validate:"required"`
	NmPrestasi      string  `json:"nm_prestasi" validate:"required"`
	ThnPrestasi     int     `json:"thn_prestasi" validate:"required"`
	Penyelenggara   *string `json:"penyelenggara"`
	Peringkat       *int    `json:"peringkat"`
	IDCreator       string  `json:"id_creator" validate:"required"`
}

type PrestasiUpdate struct {
	IDJenisPrestasi *int    `json:"id_jenis_prestasi"`
	IDTktPrestasi   *int    `json:"id_tkt_prestasi"`
	IDAktMhs        *string `json:"id_akt_mhs"`
	IDPd            *string `json:"id_pd"`
	IDSp            *string `json:"id_sp"`
	NmPrestasi      *string `json:"nm_prestasi"`
	ThnPrestasi     *int    `json:"thn_prestasi"`
	Penyelenggara   *string `json:"penyelenggara"`
	Peringkat       *int    `json:"peringkat"`
	IDUpdater       string  `json:"id_updater" validate:"required"`
}

type PrestasiDeleteBody struct {
	IDUpdater string `json:"id_updater" validate:"required"`
}

// ---------- Repository extensions ----------

// GetPrestasiByID mengambil detail prestasi berdasarkan id.
func (r *repository) GetPrestasiByID(ctx context.Context, id string) (*PrestasiMhs, error) {
	q := `SELECT p.id_prestasi,
		p.id_jenis_prestasi, jp.nm_jns_prestasi AS nm_jenis_prestasi,
		p.id_tkt_prestasi, tp.nm_tkt_prestasi,
		p.id_pd, pd.nm_pd, p.id_akt_mhs,
		p.nm_prestasi, p.thn_prestasi, p.penyelenggara, p.peringkat, p.last_sync
		FROM pdrd.prestasi p
		LEFT JOIN ref.jenis_prestasi jp ON jp.id_jns_prestasi = p.id_jenis_prestasi
		LEFT JOIN ref.tingkat_prestasi tp ON tp.id_tkt_prestasi = p.id_tkt_prestasi
		LEFT JOIN pdrd.peserta_didik pd ON pd.id_pd = p.id_pd
		WHERE p.id_prestasi = @p1 AND p.soft_delete = 0`

	var m PrestasiMhs
	err := r.db.QueryRowxContext(ctx, q, id).StructScan(&m)
	if err == sql.ErrNoRows {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *repository) CreatePrestasi(ctx context.Context, in PrestasiCreate) (string, error) {
	id := uuid.New().String()
	if in.IDPrestasi != nil && *in.IDPrestasi != "" {
		if _, err := uuid.Parse(*in.IDPrestasi); err == nil {
			id = *in.IDPrestasi
		}
	}
	q := `INSERT INTO pdrd.prestasi (
		id_prestasi, id_jenis_prestasi, id_akt_mhs, nm_prestasi, thn_prestasi,
		penyelenggara, peringkat, id_sp, id_pd, id_tkt_prestasi,
		create_date, id_creator, last_update, soft_delete, last_sync)
	VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7, @p8, @p9, @p10,
		@p11, @p12, @p13, 0, @p14)`
	now := time.Now()
	_, err := r.db.ExecContext(ctx, q,
		id, in.IDJenisPrestasi, in.IDAktMhs, in.NmPrestasi, in.ThnPrestasi,
		in.Penyelenggara, in.Peringkat, in.IDSp, in.IDPd, in.IDTktPrestasi,
		now, in.IDCreator, now, now)
	if err != nil {
		return "", err
	}
	return id, nil
}

func (r *repository) UpdatePrestasi(ctx context.Context, id string, in PrestasiUpdate) error {
	sets := []string{}
	args := []interface{}{}
	i := 1

	addInt := func(col string, v *int) {
		if v != nil {
			sets = append(sets, fmt.Sprintf("%s = @p%d", col, i))
			args = append(args, *v)
			i++
		}
	}
	addStr := func(col string, v *string) {
		if v != nil {
			sets = append(sets, fmt.Sprintf("%s = @p%d", col, i))
			args = append(args, *v)
			i++
		}
	}

	addInt("id_jenis_prestasi", in.IDJenisPrestasi)
	addInt("id_tkt_prestasi", in.IDTktPrestasi)
	addStr("id_akt_mhs", in.IDAktMhs)
	addStr("id_pd", in.IDPd)
	addStr("id_sp", in.IDSp)
	addStr("nm_prestasi", in.NmPrestasi)
	addInt("thn_prestasi", in.ThnPrestasi)
	addStr("penyelenggara", in.Penyelenggara)
	addInt("peringkat", in.Peringkat)

	sets = append(sets, fmt.Sprintf("last_update = @p%d", i))
	args = append(args, time.Now())
	i++
	sets = append(sets, fmt.Sprintf("id_updater = @p%d", i))
	args = append(args, in.IDUpdater)
	i++

	args = append(args, id)
	q := fmt.Sprintf(`UPDATE pdrd.prestasi SET %s
		WHERE id_prestasi = @p%d AND soft_delete = 0`, strings.Join(sets, ", "), i)

	res, err := r.db.ExecContext(ctx, q, args...)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *repository) DeletePrestasi(ctx context.Context, id, idUpdater string) error {
	q := `UPDATE pdrd.prestasi SET soft_delete = 1, last_update = @p1, id_updater = @p2
		WHERE id_prestasi = @p3 AND soft_delete = 0`
	res, err := r.db.ExecContext(ctx, q, time.Now(), idUpdater, id)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

// ---------- Service extensions ----------

func (s *service) GetPrestasiByID(ctx context.Context, id string) (*PrestasiMhs, error) {
	return s.repo.GetPrestasiByID(ctx, id)
}
func (s *service) CreatePrestasi(ctx context.Context, in PrestasiCreate) (string, error) {
	return s.repo.CreatePrestasi(ctx, in)
}
func (s *service) UpdatePrestasi(ctx context.Context, id string, in PrestasiUpdate) error {
	return s.repo.UpdatePrestasi(ctx, id, in)
}
func (s *service) DeletePrestasi(ctx context.Context, id, idUpdater string) error {
	return s.repo.DeletePrestasi(ctx, id, idUpdater)
}

// ---------- Handlers ----------

// GET /v1/kontribusi/prestasi/:id
func (h *Handler) GetPrestasiByID(c *fiber.Ctx) error {
	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	m, err := h.svc.GetPrestasiByID(c.Context(), id)
	if errors.Is(err, ErrNotFound) {
		return response.NotFound(c, "Prestasi tidak ditemukan")
	}
	if err != nil {
		log.Printf("get prestasi: %v", err)
		return response.InternalError(c, "Gagal mengambil detail prestasi")
	}
	return response.Success(c, "OK", m)
}

// POST /v1/kontribusi/prestasi
func (h *Handler) CreatePrestasi(c *fiber.Ctx) error {
	var in PrestasiCreate
	if err := c.BodyParser(&in); err != nil {
		return response.BadRequest(c, "Body JSON tidak valid", map[string]string{"error": err.Error()})
	}
	if in.IDPd == "" || in.IDSp == "" || in.NmPrestasi == "" || in.ThnPrestasi == 0 ||
		in.IDJenisPrestasi == 0 || in.IDTktPrestasi == 0 || in.IDCreator == "" {
		return response.BadRequest(c, "Field wajib kosong", map[string]string{
			"required": "id_pd, id_sp, nm_prestasi, thn_prestasi, id_jenis_prestasi, id_tkt_prestasi, id_creator",
		})
	}
	id, err := h.svc.CreatePrestasi(c.Context(), in)
	if err != nil {
		log.Printf("create prestasi: %v", err)
		return response.InternalError(c, "Gagal menyimpan prestasi")
	}
	c.Status(fiber.StatusCreated)
	return response.Success(c, "Prestasi berhasil disimpan", fiber.Map{"id_prestasi": id})
}

// PUT /v1/kontribusi/prestasi/:id
func (h *Handler) UpdatePrestasi(c *fiber.Ctx) error {
	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	var in PrestasiUpdate
	if err := c.BodyParser(&in); err != nil {
		return response.BadRequest(c, "Body JSON tidak valid", map[string]string{"error": err.Error()})
	}
	if in.IDUpdater == "" {
		return response.BadRequest(c, "Field id_updater wajib diisi", nil)
	}
	if err := h.svc.UpdatePrestasi(c.Context(), id, in); err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.NotFound(c, "Prestasi tidak ditemukan")
		}
		log.Printf("update prestasi: %v", err)
		return response.InternalError(c, "Gagal memperbarui prestasi")
	}
	return response.Success(c, "Prestasi berhasil diperbarui", fiber.Map{"id_prestasi": id})
}

// DELETE /v1/kontribusi/prestasi/:id
func (h *Handler) DeletePrestasi(c *fiber.Ctx) error {
	id := strings.TrimSpace(c.Params("id"))
	if id == "" {
		return response.BadRequest(c, "Parameter id wajib diisi", nil)
	}
	var body PrestasiDeleteBody
	_ = c.BodyParser(&body)
	idUpdater := body.IDUpdater
	if idUpdater == "" {
		idUpdater = strings.TrimSpace(c.Query("id_updater"))
	}
	if idUpdater == "" {
		return response.BadRequest(c, "id_updater wajib diisi", nil)
	}
	if err := h.svc.DeletePrestasi(c.Context(), id, idUpdater); err != nil {
		if errors.Is(err, ErrNotFound) {
			return response.NotFound(c, "Prestasi tidak ditemukan")
		}
		log.Printf("delete prestasi: %v", err)
		return response.InternalError(c, "Gagal menghapus prestasi")
	}
	return response.Success(c, "Prestasi berhasil dihapus (soft delete)", fiber.Map{"id_prestasi": id})
}

package dosen

import (
	"fmt"
	"log"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"sister-service/apps/monitoring"
)

// SyncDosenDokumenToMinIO fetches all dosen documents from SISTER API and uploads to MinIO.
// Files are stored at: documents/sdm/{id_sdm}/{id_jns_dok}/{id_dok}.{ext}
// Metadata is saved to dok.dokumen (url = MinIO path, file_dok = NULL) + dok.dok_sdm (junction).
func (s *service) SyncDosenDokumenToMinIO(syncedBy string) (*BatchDokumenSyncResult, error) {
	if s.minioClient == nil {
		return nil, fmt.Errorf("MinIO client not configured")
	}

	startTime := time.Now()

	monitorSvc := monitoring.GetInstance()
	syncID := monitorSvc.StartSync("Sync Dokumen Dosen", "dosen-dokumen", "batch", syncedBy, 0)

	dosenList, err := s.repo.GetAllActiveDosenIDs()
	if err != nil {
		monitorSvc.FailSync(syncID, fmt.Sprintf("Failed to get dosen list: %v", err))
		s.logSyncResult("Dokumen Dosen", "dosen-dokumen", "batch", syncedBy, 0, startTime, err)
		return nil, fmt.Errorf("failed to get dosen list: %w", err)
	}

	totalDosen := len(dosenList)
	monitorSvc.UpdateTotalRecords(syncID, totalDosen)
	log.Printf("📄 Starting dokumen sync for %d dosen...", totalDosen)

	// Worker pool: 3 workers, each job = one dosen
	numWorkers := 3
	jobs := make(chan DosenIDName, totalDosen)
	results := make(chan DokumenSyncResult, totalDosen)

	var wg sync.WaitGroup
	for w := 1; w <= numWorkers; w++ {
		wg.Add(1)
		go s.dokumenWorker(w, jobs, results, &wg)
	}

	for _, d := range dosenList {
		jobs <- d
	}
	close(jobs)

	go func() {
		wg.Wait()
		close(results)
	}()

	// Aggregate results
	totalDokumen := 0
	totalSuccess := 0
	totalSkipped := 0
	totalFailed := 0
	processedDosen := 0

	for result := range results {
		processedDosen++
		totalDokumen += result.Total
		totalSuccess += result.Success
		totalSkipped += result.Skipped
		totalFailed += result.Failed

		if processedDosen%50 == 0 || processedDosen == totalDosen {
			monitorSvc.UpdateProgress(syncID, processedDosen,
				fmt.Sprintf("Processed %d/%d dosen — docs: %d ok, %d skip, %d fail",
					processedDosen, totalDosen, totalSuccess, totalSkipped, totalFailed))
		}
	}

	duration := time.Since(startTime)

	monitorSvc.CompleteSync(syncID,
		fmt.Sprintf("Dokumen sync done: %d dosen, %d docs (%d ok/%d skip/%d fail) in %s",
			totalDosen, totalDokumen, totalSuccess, totalSkipped, totalFailed, duration.Round(time.Second)))

	s.logSyncResult("Dokumen Dosen", "dosen-dokumen", "batch", syncedBy, totalSuccess, startTime, nil)

	log.Printf("✅ Dokumen sync done: %d dosen, %d docs (%d ok, %d skip, %d fail) — %s",
		totalDosen, totalDokumen, totalSuccess, totalSkipped, totalFailed, duration.Round(time.Second))

	return &BatchDokumenSyncResult{
		TotalDosen:   totalDosen,
		TotalDokumen: totalDokumen,
		TotalSuccess: totalSuccess,
		TotalSkipped: totalSkipped,
		TotalFailed:  totalFailed,
		Duration:     duration.Round(time.Second).String(),
		SyncedBy:     syncedBy,
	}, nil
}

// dokumenWorker processes one dosen at a time, syncing all their documents
func (s *service) dokumenWorker(id int, jobs <-chan DosenIDName, results chan<- DokumenSyncResult, wg *sync.WaitGroup) {
	defer wg.Done()

	for dosen := range jobs {
		result := s.syncDosenDokumen(dosen)
		results <- result

		// Brief pause between dosen to avoid hammering SISTER API
		time.Sleep(300 * time.Millisecond)
	}
}

// syncDosenDokumen syncs all documents for a single dosen
func (s *service) syncDosenDokumen(dosen DosenIDName) DokumenSyncResult {
	result := DokumenSyncResult{IDSDM: dosen.IDSDM}

	// Fetch document list from SISTER API
	docs, err := s.sisterAPI.GetDosenDokumen(dosen.IDSDM)
	if err != nil {
		log.Printf("⚠️  Failed to get dokumen list for %s (%s): %v", dosen.Nama, dosen.IDSDM, err)
		return result
	}

	result.Total = len(docs)
	if result.Total == 0 {
		return result
	}

	for _, doc := range docs {
		ext := extractExtension(doc.NamaFile, doc.JenisFile)
		minioPath := fmt.Sprintf("documents/sdm/%s/%d/%s%s", dosen.IDSDM, doc.IDJenisDokumen, doc.ID, ext)

		// Skip if already in MinIO AND in DB
		if s.minioClient.ObjectExists(minioPath) {
			result.Skipped++
			continue
		}

		// Download binary from SISTER
		fileBytes, contentType, err := s.sisterAPI.GetDosenDokumenDownload(doc.ID)
		if err != nil {
			log.Printf("⚠️  Failed to download dokumen %s for %s: %v", doc.NamaFile, dosen.IDSDM, err)
			result.Failed++
			continue
		}

		// Upload to MinIO
		if err := s.minioClient.PutObject(minioPath, fileBytes, contentType); err != nil {
			log.Printf("⚠️  Failed to upload dokumen %s to MinIO: %v", minioPath, err)
			result.Failed++
			continue
		}

		// Build DB item
		nmDok := ""
		if doc.Nama != nil {
			nmDok = *doc.Nama
		}
		if nmDok == "" {
			nmDok = doc.NamaFile
		}

		keterangan := ""
		if doc.Keterangan != nil {
			keterangan = *doc.Keterangan
		}

		item := &DokumenSyncItem{
			IDSDM:      dosen.IDSDM,
			IDDok:      doc.ID,
			IDJnsDok:   doc.IDJenisDokumen,
			NmJnsDok:   doc.JenisDokumen,
			NmDok:      nmDok,
			NmFile:     doc.NamaFile,
			JenisFile:  contentType,
			Keterangan: keterangan,
			WktUnggah:  doc.TanggalUpload,
			MinioPath:  minioPath,
		}

		// Upsert metadata to DB
		if err := s.repo.UpsertDokumen(item); err != nil {
			log.Printf("⚠️  Failed to upsert dokumen metadata for %s/%s: %v", dosen.IDSDM, doc.ID, err)
			// File uploaded but DB failed — count as partial success
			result.Failed++
			continue
		}

		log.Printf("📄 Synced dokumen %s for %s — %d bytes → %s",
			doc.NamaFile, dosen.Nama, len(fileBytes), minioPath)
		result.Success++

		// Small delay between document downloads within same dosen
		time.Sleep(100 * time.Millisecond)
	}

	return result
}

// extractExtension determines the file extension from filename or MIME type
func extractExtension(namaFile, jenisFile string) string {
	// Try from filename first
	if ext := filepath.Ext(namaFile); ext != "" {
		return strings.ToLower(ext)
	}
	// Fallback: derive from MIME type
	switch strings.ToLower(jenisFile) {
	case "application/pdf":
		return ".pdf"
	case "image/jpeg", "image/jpg":
		return ".jpg"
	case "image/png":
		return ".png"
	case "image/gif":
		return ".gif"
	case "application/msword":
		return ".doc"
	case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
		return ".docx"
	default:
		return ".bin"
	}
}

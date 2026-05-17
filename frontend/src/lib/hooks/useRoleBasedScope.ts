/**
 * useRoleBasedScope
 *
 * Hook reusable untuk auto-scope filter Dashboard/Data Unila berdasarkan
 * level organisasi user yang sedang aktif.
 *
 * Konvensi level_organisasi (sesuai man_akses.unit_organisasi):
 *   3 = Universitas (Rektor)            → bebas lihat semua fakultas+prodi
 *   4 = Fakultas (Dekan)                → auto-scope ke fakultas-nya
 *   5 = Prodi (Kaprodi)                 → auto-scope ke prodi-nya
 *
 * Penggunaan di page:
 *   const { forcedFakultas, forcedProdi, canChangeFakultas, canChangeProdi } = useRoleBasedScope();
 *
 *   useEffect(() => {
 *     if (forcedFakultas) setSelectedFakultas(forcedFakultas);
 *     if (forcedProdi) setSelectedProdi(forcedProdi);
 *   }, [forcedFakultas, forcedProdi]);
 *
 *   <FilterPanel
 *     showFakultas={canChangeFakultas}
 *     showProdi={canChangeProdi}
 *     ...
 *   />
 */

import { useMemo } from 'react';
import { useUserContext } from '@/contexts/UserContextContext';

export type RoleScopeLevel = 'rektor' | 'dekan' | 'kajur' | 'kaprodi' | 'unknown';

export interface RoleBasedScope {
  /** Level user (3=Rektor, 4=Dekan, jurusan-role=Kajur, 5=Kaprodi) — semantic label */
  level: RoleScopeLevel;
  /** ID fakultas yg dipaksa terpilih (Dekan = id_organisasi, Kajur/Kaprodi = id_induk_organisasi) */
  forcedFakultas: string | null;
  /** ID jurusan yg dipaksa terpilih (Admin/Kepala Jurusan) */
  forcedJurusan: string | null;
  /** ID prodi yg dipaksa terpilih (hanya Kaprodi) */
  forcedProdi: string | null;
  /** Apakah user boleh ubah pilihan fakultas (false = scope dipaksa) */
  canChangeFakultas: boolean;
  /** Apakah user boleh ubah pilihan jurusan */
  canChangeJurusan: boolean;
  /** Apakah user boleh ubah pilihan prodi (false = scope dipaksa atau Dekan harus pilih) */
  canChangeProdi: boolean;
  /** Nama scope untuk badge UI (mis. "Fakultas Teknik") */
  scopeName: string | null;
  /** True kalau user lvl Universitas (Rektor) → bebas */
  isUniversityLevel: boolean;
}

// Regex untuk role-role yang scope-nya di level Jurusan
// (unit_organisasi tidak modelkan Jurusan, jadi kita deteksi via nama peran).
const JURUSAN_ROLE_RE = /admin\s*jurusan|kepala\s*jurusan|ketua\s*jurusan|kajur/i;

export function useRoleBasedScope(): RoleBasedScope {
  const { activeContext } = useUserContext();

  return useMemo<RoleBasedScope>(() => {
    if (!activeContext) {
      return {
        level: 'unknown',
        forcedFakultas: null,
        forcedJurusan: null,
        forcedProdi: null,
        canChangeFakultas: true,
        canChangeJurusan: true,
        canChangeProdi: true,
        scopeName: null,
        isUniversityLevel: true,
      };
    }

    const lvl = Number(activeContext.level_organisasi);
    const namaPeran = activeContext.nm_peran || '';
    const isJurusanRole = JURUSAN_ROLE_RE.test(namaPeran);

    // Admin / Kepala Jurusan — scope ke jurusan-nya (id_organisasi = id_sms jurusan,
    // id_induk_organisasi = id_fakultas). Unit_organisasi tidak modelkan jurusan,
    // jadi level_organisasi mungkin null untuk peran ini.
    if (isJurusanRole) {
      return {
        level: 'kajur',
        forcedFakultas: activeContext.id_induk_organisasi || null,
        forcedJurusan: activeContext.id_organisasi || null,
        forcedProdi: null,
        canChangeFakultas: false,
        canChangeJurusan: false,
        canChangeProdi: true,
        scopeName: activeContext.nm_organisasi || null,
        isUniversityLevel: false,
      };
    }

    // Rektor / Universitas — bebas (no scope)
    if (lvl <= 3 || isNaN(lvl)) {
      return {
        level: 'rektor',
        forcedFakultas: null,
        forcedJurusan: null,
        forcedProdi: null,
        canChangeFakultas: true,
        canChangeJurusan: true,
        canChangeProdi: true,
        scopeName: null,
        isUniversityLevel: true,
      };
    }

    // Dekan — scope ke fakultas-nya
    if (lvl === 4) {
      return {
        level: 'dekan',
        forcedFakultas: activeContext.id_organisasi || null,
        forcedJurusan: null,
        forcedProdi: null,
        canChangeFakultas: false,
        canChangeJurusan: true,
        canChangeProdi: true,
        scopeName: activeContext.nm_organisasi || null,
        isUniversityLevel: false,
      };
    }

    // Kaprodi — scope ke prodi-nya (parent = fakultas)
    if (lvl === 5) {
      return {
        level: 'kaprodi',
        forcedFakultas: activeContext.id_induk_organisasi || null,
        forcedJurusan: null,
        forcedProdi: activeContext.id_organisasi || null,
        canChangeFakultas: false,
        canChangeJurusan: false,
        canChangeProdi: false,
        scopeName: activeContext.nm_organisasi || null,
        isUniversityLevel: false,
      };
    }

    // Level lain (unit kerja non-akademik, dll) — treat as universal
    return {
      level: 'unknown',
      forcedFakultas: null,
      forcedJurusan: null,
      forcedProdi: null,
      canChangeFakultas: true,
      canChangeJurusan: true,
      canChangeProdi: true,
      scopeName: null,
      isUniversityLevel: true,
    };
  }, [activeContext]);
}

export default useRoleBasedScope;

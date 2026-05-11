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

export type RoleScopeLevel = 'rektor' | 'dekan' | 'kaprodi' | 'unknown';

export interface RoleBasedScope {
  /** Level user (3=Rektor, 4=Dekan, 5=Kaprodi) — semantic label */
  level: RoleScopeLevel;
  /** ID fakultas yg dipaksa terpilih (Dekan = id_organisasi, Kaprodi = id_induk_organisasi) */
  forcedFakultas: string | null;
  /** ID prodi yg dipaksa terpilih (hanya Kaprodi) */
  forcedProdi: string | null;
  /** Apakah user boleh ubah pilihan fakultas (false = scope dipaksa) */
  canChangeFakultas: boolean;
  /** Apakah user boleh ubah pilihan prodi (false = scope dipaksa atau Dekan harus pilih) */
  canChangeProdi: boolean;
  /** Nama scope untuk badge UI (mis. "Fakultas Teknik") */
  scopeName: string | null;
  /** True kalau user lvl Universitas (Rektor) → bebas */
  isUniversityLevel: boolean;
}

export function useRoleBasedScope(): RoleBasedScope {
  const { activeContext } = useUserContext();

  return useMemo<RoleBasedScope>(() => {
    if (!activeContext) {
      return {
        level: 'unknown',
        forcedFakultas: null,
        forcedProdi: null,
        canChangeFakultas: true,
        canChangeProdi: true,
        scopeName: null,
        isUniversityLevel: true,
      };
    }

    const lvl = Number(activeContext.level_organisasi);

    // Rektor / Universitas — bebas (no scope)
    if (lvl <= 3 || isNaN(lvl)) {
      return {
        level: 'rektor',
        forcedFakultas: null,
        forcedProdi: null,
        canChangeFakultas: true,
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
        forcedProdi: null,
        canChangeFakultas: false,
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
        forcedProdi: activeContext.id_organisasi || null,
        canChangeFakultas: false,
        canChangeProdi: false,
        scopeName: activeContext.nm_organisasi || null,
        isUniversityLevel: false,
      };
    }

    // Level lain (unit kerja non-akademik, dll) — treat as universal
    return {
      level: 'unknown',
      forcedFakultas: null,
      forcedProdi: null,
      canChangeFakultas: true,
      canChangeProdi: true,
      scopeName: null,
      isUniversityLevel: true,
    };
  }, [activeContext]);
}

export default useRoleBasedScope;

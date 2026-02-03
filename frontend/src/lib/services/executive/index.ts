/**
 * Executive Services Index
 *
 * Centralizes all Executive (Pimpinan Dashboard) service exports
 */

export { executiveAkreditasiService } from './akreditasiService';
export type {
  JenjangList,
  Fakultas as AkreditasiFakultas,
  Prodi as AkreditasiProdi,
  AkreditasiHistory,
  AkreditasiSummary,
  GetFakultasParams as GetAkreditasiFakultasParams,
  GetProdiParams as GetAkreditasiProdiParams,
} from './akreditasiService';

export { executiveRasioService } from './rasioService';
export type {
  TahunAjaran,
  Fakultas,
  Prodi,
  Mahasiswa,
  Dosen,
  PaginationResponse,
  GetFakultasParams,
  GetProdiParams,
  GetDataMahasiswaParams,
  GetDataDosenParams,
} from './rasioService';

export { executiveJabfungService } from './jabfungService';
export type {
  JabfungFakultas,
  JabfungProdi,
  Dosen as JabfungDosen,
  GetJabfungFakultasParams,
  GetJabfungProdiParams,
  GetDataDosenParams as GetJabfungDataDosenParams,
  GetProdiParams as GetJabfungProdiListParams,
} from './jabfungService';

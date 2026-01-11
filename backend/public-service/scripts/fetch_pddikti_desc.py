"""
PDDikti Deskripsi Fetcher - Get Description, Visi, Misi for All Prodi
Fetches detailed description data from PDDikti API
"""

import json
import sys
from datetime import datetime
from pathlib import Path

try:
    from pddiktipy import api
    from pddiktipy.exceptions import PDDIKTIError, APIConnectionError
except ImportError:
    print("ERROR: pddiktipy not installed")
    print("Please install: python -m pip install pddiktipy")
    sys.exit(1)


class PDDiktiDescFetcher:
    """Fetches description data for all Unila prodi"""

    def __init__(self):
        self.output_dir = Path(__file__).parent.parent / 'database' / 'data'
        self.input_file = self.output_dir / 'pddikti_prodi_akreditasi.json'
        self.output_file = self.output_dir / 'pddikti_prodi_deskripsi.json'
        self.prodi_data = []
        self.desc_data = []

    def load_prodi_data(self):
        """Load existing prodi data from JSON"""
        print("[LOAD] Loading prodi data from JSON...")

        if not self.input_file.exists():
            print(f"ERROR: Input file not found: {self.input_file}")
            print("Please run fetch_pddikti_all.py first")
            return False

        with open(self.input_file, 'r', encoding='utf-8') as f:
            self.prodi_data = json.load(f)

        print(f"OK: Loaded {len(self.prodi_data)} programs")
        return True

    def fetch_descriptions(self):
        """Fetch description data for all prodi"""
        print("\n[FETCH] Fetching description data from PDDikti...")

        with api() as client:
            for idx, prodi in enumerate(self.prodi_data, 1):
                prodi_id = prodi.get('id_sms')
                prodi_nama = prodi.get('nama_prodi', 'Unknown')

                print(f"  [{idx}/{len(self.prodi_data)}] {prodi_nama[:60]}...", end='', flush=True)

                if not prodi_id:
                    print(" SKIP: No ID")
                    continue

                try:
                    desc = client.get_desc_prodi(prodi_id)

                    if desc:
                        # Merge data
                        merged = {
                            'id_sms': prodi_id,
                            'kode_prodi': prodi.get('kode_prodi'),
                            'nama_prodi': prodi_nama,
                            'jenjang': prodi.get('jenjang_prodi'),
                            'status': prodi.get('status_prodi'),
                            # Deskripsi dari API
                            'deskripsi_singkat': desc.get('deskripsi_singkat'),
                            'visi': desc.get('visi'),
                            'misi': desc.get('misi'),
                            'kompetensi': desc.get('kompetensi'),
                            'capaian_belajar': desc.get('capaian_belajar'),
                            # Statistik tambahan
                            'jumlah_dosen': desc.get('jumlah_dosen'),
                            'jumlah_mahasiswa': desc.get('jumlah_mahasiswa'),
                            'rasio': desc.get('rasio'),
                            'akreditasi': desc.get('akreditasi'),
                            'rata_masa_studi': desc.get('rata_masa_studi'),
                            # Metadata
                            'fetched_at': datetime.now().isoformat(),
                            'source': 'pddikti_api_get_desc_prodi'
                        }

                        self.desc_data.append(merged)
                        print(" OK")
                    else:
                        print(" WARN: No desc data")

                except Exception as e:
                    print(f" ERROR: {str(e)[:40]}")

        print(f"\nOK: Successfully fetched {len(self.desc_data)} descriptions")
        return self.desc_data

    def export_to_json(self):
        """Export to JSON file"""
        print("\n[EXPORT] Exporting data...")

        if self.desc_data:
            with open(self.output_file, 'w', encoding='utf-8') as f:
                json.dump(self.desc_data, f, indent=2, ensure_ascii=False)

            file_size = self.output_file.stat().st_size / 1024
            print(f"OK: Data exported -> {self.output_file}")
            print(f"    Size: {file_size:.1f} KB")
            print(f"    Programs: {len(self.desc_data)}")

            # Statistics
            has_visi = sum(1 for p in self.desc_data if p.get('visi'))
            has_misi = sum(1 for p in self.desc_data if p.get('misi'))
            has_desc = sum(1 for p in self.desc_data if p.get('deskripsi_singkat'))

            print(f"\n[STATS]")
            print(f"  Programs with Visi: {has_visi}/{len(self.desc_data)}")
            print(f"  Programs with Misi: {has_misi}/{len(self.desc_data)}")
            print(f"  Programs with Deskripsi: {has_desc}/{len(self.desc_data)}")

    def run(self):
        """Main execution"""
        print("="*80)
        print("PDDikti Description Fetcher - Universitas Lampung")
        print("="*80)
        print()

        if not self.load_prodi_data():
            return 1

        self.fetch_descriptions()
        self.export_to_json()

        print("\n[SUCCESS] Data fetch completed!")
        print(f"[OUTPUT] File: {self.output_file}")
        return 0


if __name__ == '__main__':
    fetcher = PDDiktiDescFetcher()
    sys.exit(fetcher.run())

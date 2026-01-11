"""
PDDikti Deskripsi Fetcher - SAMPLE VERSION (10 prodi only for testing)
Quick test to fetch description for first 10 programs
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
    sys.exit(1)


def main():
    output_dir = Path(__file__).parent.parent / 'database' / 'data'
    input_file = output_dir / 'pddikti_prodi_akreditasi.json'
    output_file = output_dir / 'pddikti_prodi_deskripsi.json'

    print("="*80)
    print("PDDikti Description Fetcher - SAMPLE (10 programs)")
    print("="*80)
    print()

    # Load prodi data
    print("[LOAD] Loading prodi data...")
    with open(input_file, 'r', encoding='utf-8') as f:
        all_prodi = json.load(f)

    # Take only first 10 for testing
    sample_prodi = all_prodi[:10]
    print(f"OK: Testing with {len(sample_prodi)} programs (out of {len(all_prodi)} total)")
    print()

    # Fetch descriptions
    print("[FETCH] Fetching description data...")
    desc_data = []

    with api() as client:
        for idx, prodi in enumerate(sample_prodi, 1):
            prodi_id = prodi.get('id_sms')
            prodi_nama = prodi.get('nama_prodi', 'Unknown')

            print(f"  [{idx}/{len(sample_prodi)}] {prodi_nama[:60]}...", end='', flush=True)

            if not prodi_id:
                print(" SKIP: No ID")
                continue

            try:
                desc = client.get_desc_prodi(prodi_id)

                if desc:
                    merged = {
                        'id_sms': prodi_id,
                        'kode_prodi': prodi.get('kode_prodi'),
                        'nama_prodi': prodi_nama,
                        'jenjang': prodi.get('jenjang_prodi'),
                        'status': prodi.get('status_prodi'),
                        'deskripsi_singkat': desc.get('deskripsi_singkat'),
                        'visi': desc.get('visi'),
                        'misi': desc.get('misi'),
                        'kompetensi': desc.get('kompetensi'),
                        'capaian_belajar': desc.get('capaian_belajar'),
                        'jumlah_dosen': desc.get('jumlah_dosen'),
                        'jumlah_mahasiswa': desc.get('jumlah_mahasiswa'),
                        'rasio': desc.get('rasio'),
                        'akreditasi': desc.get('akreditasi'),
                        'rata_masa_studi': desc.get('rata_masa_studi'),
                        'fetched_at': datetime.now().isoformat(),
                        'source': 'pddikti_api_get_desc_prodi'
                    }

                    desc_data.append(merged)
                    print(" OK")
                else:
                    print(" WARN: No desc data")

            except Exception as e:
                print(f" ERROR: {str(e)[:40]}")

    print(f"\nOK: Successfully fetched {len(desc_data)} descriptions")
    print()

    # Export
    print("[EXPORT] Exporting data...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(desc_data, f, indent=2, ensure_ascii=False)

    file_size = output_file.stat().st_size / 1024
    print(f"OK: Data exported -> {output_file}")
    print(f"    Size: {file_size:.1f} KB")
    print(f"    Programs: {len(desc_data)}")

    # Statistics
    has_visi = sum(1 for p in desc_data if p.get('visi'))
    has_misi = sum(1 for p in desc_data if p.get('misi'))
    has_desc = sum(1 for p in desc_data if p.get('deskripsi_singkat'))

    print(f"\n[STATS]")
    print(f"  Programs with Visi: {has_visi}/{len(desc_data)}")
    print(f"  Programs with Misi: {has_misi}/{len(desc_data)}")
    print(f"  Programs with Deskripsi: {has_desc}/{len(desc_data)}")

    print("\n[SUCCESS] Sample fetch completed!")
    print(f"[OUTPUT] File: {output_file}")
    print()
    print("To fetch ALL programs, run: python fetch_pddikti_desc.py")


if __name__ == '__main__':
    main()

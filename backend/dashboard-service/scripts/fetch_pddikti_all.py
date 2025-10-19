"""
PDDikti All Programs Fetcher - Get ALL Unila Programs
Uses get_prodi_pt() method for complete data
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


class PDDiktiAllFetcher:
    """Fetches ALL prodi from Unila using get_prodi_pt"""

    def __init__(self):
        self.output_dir = Path(__file__).parent.parent / 'database' / 'data'
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.pt_id = None
        self.prodi_data = []

    def get_unila_pt_id(self):
        """Get Universitas Lampung PT ID"""
        print("[SEARCH] Getting Universitas Lampung ID...")

        try:
            with api() as client:
                pt_search = client.search_pt('Universitas Lampung')

                if not pt_search:
                    print("ERROR: No response from search_pt")
                    return None

                # Response is a list directly
                pt_list = pt_search if isinstance(pt_search, list) else [pt_search]

                if not pt_list:
                    print("ERROR: No universities found")
                    return None

                print(f"OK: Found {len(pt_list)} results")

                # Find exact match
                for pt in pt_list:
                    nama = pt.get('nama', '') or pt.get('text', '')
                    # Exact match: "UNIVERSITAS LAMPUNG" (uppercase)
                    if nama == 'UNIVERSITAS LAMPUNG':
                        self.pt_id = pt.get('id')
                        print(f"OK: Found Unila - {nama}")
                        print(f"    Kode PT: {pt.get('kode', 'N/A')}")
                        print(f"    PT ID: {self.pt_id[:30]}...")
                        return self.pt_id

                print("ERROR: Universitas Lampung not found in results")
                return None

        except Exception as e:
            print(f"ERROR: {e}")
            return None

    def fetch_all_prodi(self):
        """Fetch ALL prodi using get_prodi_pt"""
        if not self.pt_id:
            print("ERROR: PT ID not set")
            return []

        print("\n[FETCH] Getting ALL study programs from PDDikti...")

        # Use semester 20241 (known to have data)
        # PDDikti might not have current semester data yet
        tahun_semester = "20241"

        print(f"[INFO] Using semester: {tahun_semester}")

        try:
            with api() as client:
                result = client.get_prodi_pt(self.pt_id, tahun_semester)

                if not result:
                    print("ERROR: No data returned from API")
                    return []

                # Handle both direct list and dict with 'data' key
                prodi_list = result if isinstance(result, list) else result.get('data', [])

                if not prodi_list:
                    print("WARNING: No study programs found")
                    return []

                print(f"OK: Found {len(prodi_list)} study programs")

                # Fetch detailed info for each prodi
                detailed_prodi = []

                for idx, prodi in enumerate(prodi_list, 1):
                    prodi_id = prodi.get('id_sms') or prodi.get('id')
                    prodi_nama = prodi.get('nama_prodi', prodi.get('nama', 'Unknown'))

                    print(f"  [{idx}/{len(prodi_list)}] {prodi_nama[:60]}...", end='', flush=True)

                    if prodi_id:
                        try:
                            # Get detailed info
                            detail = client.get_detail_prodi(prodi_id)

                            # Merge data
                            merged_data = {
                                **prodi,
                                **detail,
                                'fetched_at': datetime.now().isoformat(),
                                'source': 'pddikti_api_get_prodi_pt'
                            }

                            detailed_prodi.append(merged_data)
                            print(" OK")

                        except Exception as e:
                            print(f" WARN: {str(e)[:40]}")
                            # Add basic data even if detail fails
                            prodi['fetched_at'] = datetime.now().isoformat()
                            prodi['source'] = 'pddikti_api_get_prodi_pt'
                            prodi['detail_error'] = str(e)
                            detailed_prodi.append(prodi)
                    else:
                        print(" WARN: No ID")
                        prodi['fetched_at'] = datetime.now().isoformat()
                        prodi['source'] = 'pddikti_api_get_prodi_pt'
                        detailed_prodi.append(prodi)

                self.prodi_data = detailed_prodi
                print(f"\nOK: Successfully fetched {len(detailed_prodi)} programs with details")
                return detailed_prodi

        except Exception as e:
            print(f"ERROR: {e}")
            import traceback
            traceback.print_exc()
            return []

    def export_to_json(self):
        """Export to JSON"""
        print("\n[EXPORT] Exporting data...")

        if self.prodi_data:
            # Full data
            prodi_file = self.output_dir / 'pddikti_prodi_akreditasi.json'
            with open(prodi_file, 'w', encoding='utf-8') as f:
                json.dump(self.prodi_data, f, indent=2, ensure_ascii=False)
            print(f"OK: Full data -> {prodi_file}")
            print(f"    Size: {prodi_file.stat().st_size / 1024:.1f} KB")

            # Summary
            summary = {
                'total_programs': len(self.prodi_data),
                'by_jenjang': {},
                'by_akreditasi': {},
                'by_status': {},
                'fetched_at': datetime.now().isoformat(),
                'semester': self.get_current_semester(),
            }

            for prodi in self.prodi_data:
                # Jenjang
                jenjang = prodi.get('jenjang_prodi') or prodi.get('jenj_didik') or prodi.get('jenjang', 'Unknown')
                summary['by_jenjang'][jenjang] = summary['by_jenjang'].get(jenjang, 0) + 1

                # Akreditasi
                akred = prodi.get('akreditasi', 'Unknown')
                if akred == '':
                    akred = 'Belum Akreditasi'
                summary['by_akreditasi'][akred] = summary['by_akreditasi'].get(akred, 0) + 1

                # Status
                status = prodi.get('status_prodi') or prodi.get('status', 'Unknown')
                summary['by_status'][status] = summary['by_status'].get(status, 0) + 1

            summary_file = self.output_dir / 'pddikti_summary.json'
            with open(summary_file, 'w', encoding='utf-8') as f:
                json.dump(summary, f, indent=2, ensure_ascii=False)
            print(f"OK: Summary -> {summary_file}")

    def get_current_semester(self):
        """Get current semester string"""
        now = datetime.now()
        semester = 1 if now.month <= 6 else 2
        return f"{now.year}{semester}"

    def print_summary(self):
        """Print summary"""
        print("\n" + "="*80)
        print("SUMMARY - ALL UNIVERSITAS LAMPUNG PROGRAMS")
        print("="*80)

        if self.prodi_data:
            print(f"\nTotal Programs: {len(self.prodi_data)}")

            # By Jenjang
            by_jenjang = {}
            for prodi in self.prodi_data:
                jenjang = prodi.get('jenjang_prodi') or prodi.get('jenj_didik') or prodi.get('jenjang', 'Unknown')
                by_jenjang[jenjang] = by_jenjang.get(jenjang, 0) + 1

            print(f"\nBy Level (Jenjang):")
            for jenjang in sorted(by_jenjang.keys()):
                print(f"  {jenjang:12} : {by_jenjang[jenjang]:3} programs")

            # By Akreditasi
            by_akred = {}
            for prodi in self.prodi_data:
                akred = prodi.get('akreditasi', 'Unknown')
                if akred == '':
                    akred = 'Belum Akreditasi'
                by_akred[akred] = by_akred.get(akred, 0) + 1

            print(f"\nBy Accreditation:")
            for akred in sorted(by_akred.keys(), reverse=True):
                print(f"  {akred:20} : {by_akred[akred]:3} programs")

            # By Status
            by_status = {}
            for prodi in self.prodi_data:
                status = prodi.get('status_prodi') or prodi.get('status', 'Unknown')
                by_status[status] = by_status.get(status, 0) + 1

            print(f"\nBy Status:")
            for status in sorted(by_status.keys()):
                print(f"  {status:20} : {by_status[status]:3} programs")

        print("\n" + "="*80)

    def run(self):
        """Main execution"""
        print("="*80)
        print("PDDikti ALL Programs Fetcher - Universitas Lampung")
        print("="*80)
        print()

        # Step 1: Get PT ID
        if not self.get_unila_pt_id():
            print("\n[FAILED] Could not get Unila PT ID")
            return

        # Step 2: Fetch all prodi
        self.fetch_all_prodi()

        # Step 3: Export
        self.export_to_json()

        # Step 4: Summary
        self.print_summary()

        print("\n[SUCCESS] Data fetch completed!")
        print(f"[OUTPUT] Directory: {self.output_dir}")


if __name__ == '__main__':
    fetcher = PDDiktiAllFetcher()
    fetcher.run()

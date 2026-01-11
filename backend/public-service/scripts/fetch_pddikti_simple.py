"""
PDDikti Data Fetcher - Simple Version (Windows Compatible)
No emoji, plain text output only
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


class PDDiktiDataFetcher:
    """Fetches and exports PDDikti data for Universitas Lampung"""

    def __init__(self):
        self.output_dir = Path(__file__).parent.parent / 'database' / 'data'
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.unila_data = None
        self.prodi_data = []

    def fetch_university_accreditation(self):
        """Fetch Universitas Lampung accreditation data"""
        print("[SEARCH] Searching for Universitas Lampung...")

        try:
            with api() as client:
                search_results = client.search_all('Universitas Lampung')

                if not search_results:
                    print("WARNING: No results found")
                    return None

                print(f"OK: Found {len(search_results)} results")

                # Find exact match
                unila = None
                for result in search_results:
                    if result.get('type') == 'pt' or result.get('kategori') == 'pt':
                        nama = result.get('text', result.get('nama', ''))
                        if 'Universitas Lampung' in nama and 'Kampus' not in nama:
                            unila = result
                            break

                if not unila:
                    print("WARNING: Exact match not found")
                    return None

                print(f"OK: Found - {unila.get('text', unila.get('nama', 'Unknown'))}")

                # Get detailed info
                pt_id = unila.get('id')
                if pt_id:
                    print(f"[FETCH] Getting details for PT ID: {pt_id}")
                    detail = client.get_detail_pt(pt_id)

                    self.unila_data = {
                        **unila,
                        **detail,
                        'fetched_at': datetime.now().isoformat(),
                        'source': 'pddikti_api'
                    }

                    print("OK: University data fetched successfully")
                    return self.unila_data

        except APIConnectionError as e:
            print(f"ERROR: API Connection - {e}")
        except PDDIKTIError as e:
            print(f"ERROR: PDDikti - {e}")
        except Exception as e:
            print(f"ERROR: Unexpected - {e}")

        return None

    def fetch_study_programs_accreditation(self):
        """Fetch all study programs"""
        print("\n[SEARCH] Searching for study programs...")

        try:
            with api() as client:
                prodi_results = client.search_prodi('Universitas Lampung')

                if not prodi_results:
                    print("WARNING: No study programs found")
                    return []

                print(f"OK: Found {len(prodi_results)} study programs")

                detailed_prodi = []

                for idx, prodi in enumerate(prodi_results, 1):
                    prodi_id = prodi.get('id')
                    prodi_nama = prodi.get('text', prodi.get('nama', 'Unknown'))

                    print(f"  [{idx}/{len(prodi_results)}] {prodi_nama[:50]}...", end='')

                    if prodi_id:
                        try:
                            detail = client.get_detail_prodi(prodi_id)
                            detailed_prodi.append({
                                **prodi,
                                **detail,
                                'fetched_at': datetime.now().isoformat(),
                                'source': 'pddikti_api'
                            })
                            print(" OK")
                        except Exception as e:
                            print(f" WARN: {str(e)[:30]}")
                            detailed_prodi.append({
                                **prodi,
                                'fetched_at': datetime.now().isoformat(),
                                'source': 'pddikti_api',
                                'detail_error': str(e)
                            })
                    else:
                        print(" WARN: No ID")
                        detailed_prodi.append(prodi)

                self.prodi_data = detailed_prodi
                print(f"\nOK: Successfully fetched {len(detailed_prodi)} programs")
                return detailed_prodi

        except Exception as e:
            print(f"ERROR: {e}")
            return []

    def export_to_json(self):
        """Export to JSON files"""
        print("\n[EXPORT] Exporting data to JSON...")

        if self.unila_data:
            unila_file = self.output_dir / 'pddikti_unila_akreditasi.json'
            with open(unila_file, 'w', encoding='utf-8') as f:
                json.dump(self.unila_data, f, indent=2, ensure_ascii=False)
            print(f"OK: University -> {unila_file}")

        if self.prodi_data:
            prodi_file = self.output_dir / 'pddikti_prodi_akreditasi.json'
            with open(prodi_file, 'w', encoding='utf-8') as f:
                json.dump(self.prodi_data, f, indent=2, ensure_ascii=False)
            print(f"OK: Programs -> {prodi_file}")

            # Summary
            summary = {
                'total_programs': len(self.prodi_data),
                'by_jenjang': {},
                'by_akreditasi': {},
                'fetched_at': datetime.now().isoformat(),
            }

            for prodi in self.prodi_data:
                jenjang = prodi.get('jenjang', 'Unknown')
                akreditasi = prodi.get('akreditasi', 'Unknown')
                summary['by_jenjang'][jenjang] = summary['by_jenjang'].get(jenjang, 0) + 1
                summary['by_akreditasi'][akreditasi] = summary['by_akreditasi'].get(akreditasi, 0) + 1

            summary_file = self.output_dir / 'pddikti_summary.json'
            with open(summary_file, 'w', encoding='utf-8') as f:
                json.dump(summary, f, indent=2, ensure_ascii=False)
            print(f"OK: Summary -> {summary_file}")

    def print_summary(self):
        """Print summary"""
        print("\n" + "="*70)
        print("SUMMARY")
        print("="*70)

        if self.unila_data:
            print(f"\n[UNIVERSITY] Universitas Lampung")
            print(f"  Nama: {self.unila_data.get('text', self.unila_data.get('nama', 'N/A'))}")
            print(f"  Akreditasi: {self.unila_data.get('akreditasi', 'N/A')}")
            print(f"  Status: {self.unila_data.get('status', 'N/A')}")

        if self.prodi_data:
            print(f"\n[PROGRAMS] Total: {len(self.prodi_data)}")

            by_akred = {}
            for prodi in self.prodi_data:
                akred = prodi.get('akreditasi', 'Unknown')
                by_akred[akred] = by_akred.get(akred, 0) + 1

            print(f"\n  By Accreditation:")
            for akred, count in sorted(by_akred.items()):
                print(f"    {akred}: {count}")

            by_jenjang = {}
            for prodi in self.prodi_data:
                jenjang = prodi.get('jenjang', 'Unknown')
                by_jenjang[jenjang] = by_jenjang.get(jenjang, 0) + 1

            print(f"\n  By Level:")
            for jenjang, count in sorted(by_jenjang.items()):
                print(f"    {jenjang}: {count}")

        print("\n" + "="*70)

    def run(self):
        """Main execution"""
        print("="*70)
        print("PDDikti Data Fetcher for Universitas Lampung")
        print("="*70)

        self.fetch_university_accreditation()
        self.fetch_study_programs_accreditation()
        self.export_to_json()
        self.print_summary()

        print("\n[SUCCESS] Data fetch completed!")
        print(f"[OUTPUT] Directory: {self.output_dir}")


if __name__ == '__main__':
    fetcher = PDDiktiDataFetcher()
    fetcher.run()

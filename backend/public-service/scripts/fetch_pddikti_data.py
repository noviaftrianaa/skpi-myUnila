"""
PDDikti Data Fetcher for Universitas Lampung
Fetches accreditation data for university and study programs from PDDikti API
Exports to JSON format for Laravel Seeder consumption

Requirements:
    pip install pddiktipy requests

Usage:
    python fetch_pddikti_data.py

Output:
    - database/data/pddikti_unila_akreditasi.json
    - database/data/pddikti_prodi_akreditasi.json
"""

import json
import os
import sys
from datetime import datetime
from typing import Dict, List, Optional
from pathlib import Path

try:
    from pddiktipy import api
    from pddiktipy.exceptions import PDDIKTIError, APIConnectionError, ValidationError
except ImportError:
    print("❌ Error: pddiktipy not installed")
    print("Please install: pip install pddiktipy")
    sys.exit(1)


class PDDiktiDataFetcher:
    """Fetches and exports PDDikti data for Universitas Lampung"""

    # Universitas Lampung identifiers
    UNILA_KEYWORDS = [
        'Universitas Lampung',
        'UNILA'
    ]

    # NPSN/Kode PT Unila (jika diketahui)
    UNILA_NPSN = '001026'

    def __init__(self):
        self.output_dir = Path(__file__).parent.parent / 'database' / 'data'
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.unila_data = None
        self.prodi_data = []

    def fetch_university_accreditation(self) -> Optional[Dict]:
        """Fetch Universitas Lampung accreditation data"""
        print("🔍 Searching for Universitas Lampung...")

        try:
            with api() as client:
                # Search for Universitas Lampung
                search_results = client.search_all('Universitas Lampung')

                if not search_results:
                    print("⚠️  No results found for Universitas Lampung")
                    return None

                print(f"✓ Found {len(search_results)} results")

                # Filter for exact match
                unila = None
                for result in search_results:
                    if result.get('type') == 'pt' or result.get('kategori') == 'pt':
                        # Check if it's the main Unila (not branch/subsidiary)
                        nama = result.get('text', result.get('nama', ''))
                        if 'Universitas Lampung' in nama and 'Kampus' not in nama:
                            unila = result
                            break

                if not unila:
                    print("⚠️  Exact match for Universitas Lampung not found")
                    print("Available results:")
                    for r in search_results[:5]:
                        print(f"  - {r.get('text', r.get('nama', 'Unknown'))}")
                    return None

                print(f"✓ Found: {unila.get('text', unila.get('nama', 'Unknown'))}")

                # Get detailed information
                pt_id = unila.get('id')
                if pt_id:
                    print(f"🔍 Fetching detailed data for PT ID: {pt_id}")
                    detail = client.detail_pt(pt_id)

                    # Merge data
                    self.unila_data = {
                        **unila,
                        **detail,
                        'fetched_at': datetime.now().isoformat(),
                        'source': 'pddikti_api'
                    }

                    print(f"✓ University data fetched successfully")
                    return self.unila_data
                else:
                    print("⚠️  PT ID not found in search results")
                    return unila

        except APIConnectionError as e:
            print(f"❌ API Connection Error: {e}")
            return None
        except PDDIKTIError as e:
            print(f"❌ PDDikti Error: {e}")
            return None
        except Exception as e:
            print(f"❌ Unexpected Error: {e}")
            return None

    def fetch_study_programs_accreditation(self) -> List[Dict]:
        """Fetch all study programs for Universitas Lampung"""
        print("\n🔍 Searching for Unila study programs...")

        try:
            with api() as client:
                # Search study programs
                prodi_results = client.search_prodi('Universitas Lampung')

                if not prodi_results:
                    print("⚠️  No study programs found")
                    return []

                print(f"✓ Found {len(prodi_results)} study programs")

                detailed_prodi = []

                # Get detailed info for each program
                for idx, prodi in enumerate(prodi_results, 1):
                    prodi_id = prodi.get('id')
                    prodi_nama = prodi.get('text', prodi.get('nama', 'Unknown'))

                    print(f"  [{idx}/{len(prodi_results)}] Fetching: {prodi_nama}...", end='')

                    if prodi_id:
                        try:
                            detail = client.detail_prodi(prodi_id)

                            detailed_prodi.append({
                                **prodi,
                                **detail,
                                'fetched_at': datetime.now().isoformat(),
                                'source': 'pddikti_api'
                            })
                            print(" ✓")
                        except Exception as e:
                            print(f" ⚠️  Error: {e}")
                            # Still add basic data
                            detailed_prodi.append({
                                **prodi,
                                'fetched_at': datetime.now().isoformat(),
                                'source': 'pddikti_api',
                                'detail_error': str(e)
                            })
                    else:
                        print(" ⚠️  No ID")
                        detailed_prodi.append(prodi)

                self.prodi_data = detailed_prodi
                print(f"\n✓ Successfully fetched {len(detailed_prodi)} study programs")
                return detailed_prodi

        except APIConnectionError as e:
            print(f"❌ API Connection Error: {e}")
            return []
        except PDDIKTIError as e:
            print(f"❌ PDDikti Error: {e}")
            return []
        except Exception as e:
            print(f"❌ Unexpected Error: {e}")
            return []

    def export_to_json(self):
        """Export fetched data to JSON files"""
        print("\n📝 Exporting data to JSON...")

        # Export university data
        if self.unila_data:
            unila_file = self.output_dir / 'pddikti_unila_akreditasi.json'
            with open(unila_file, 'w', encoding='utf-8') as f:
                json.dump(self.unila_data, f, indent=2, ensure_ascii=False)
            print(f"✓ University data exported to: {unila_file}")

        # Export study programs data
        if self.prodi_data:
            prodi_file = self.output_dir / 'pddikti_prodi_akreditasi.json'
            with open(prodi_file, 'w', encoding='utf-8') as f:
                json.dump(self.prodi_data, f, indent=2, ensure_ascii=False)
            print(f"✓ Study programs data exported to: {prodi_file}")

            # Also create summary
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
            print(f"✓ Summary exported to: {summary_file}")

    def print_summary(self):
        """Print summary of fetched data"""
        print("\n" + "="*60)
        print("📊 FETCH SUMMARY")
        print("="*60)

        if self.unila_data:
            print(f"\n🏛️  Universitas Lampung:")
            print(f"   Nama: {self.unila_data.get('text', self.unila_data.get('nama', 'N/A'))}")
            print(f"   Akreditasi: {self.unila_data.get('akreditasi', 'N/A')}")
            print(f"   Status: {self.unila_data.get('status', 'N/A')}")

        if self.prodi_data:
            print(f"\n📚 Study Programs: {len(self.prodi_data)}")

            # Group by accreditation
            by_akred = {}
            for prodi in self.prodi_data:
                akred = prodi.get('akreditasi', 'Unknown')
                by_akred[akred] = by_akred.get(akred, 0) + 1

            print(f"\n   By Accreditation:")
            for akred, count in sorted(by_akred.items()):
                print(f"   - {akred}: {count}")

            # Group by jenjang
            by_jenjang = {}
            for prodi in self.prodi_data:
                jenjang = prodi.get('jenjang', 'Unknown')
                by_jenjang[jenjang] = by_jenjang.get(jenjang, 0) + 1

            print(f"\n   By Level:")
            for jenjang, count in sorted(by_jenjang.items()):
                print(f"   - {jenjang}: {count}")

        print("\n" + "="*60)

    def run(self):
        """Main execution flow"""
        print("="*60)
        print("🚀 PDDikti Data Fetcher for Universitas Lampung")
        print("="*60)

        # Fetch university data
        self.fetch_university_accreditation()

        # Fetch study programs data
        self.fetch_study_programs_accreditation()

        # Export to JSON
        self.export_to_json()

        # Print summary
        self.print_summary()

        print("\n✅ Data fetch completed successfully!")
        print(f"📁 Output directory: {self.output_dir}")


if __name__ == '__main__':
    fetcher = PDDiktiDataFetcher()
    fetcher.run()

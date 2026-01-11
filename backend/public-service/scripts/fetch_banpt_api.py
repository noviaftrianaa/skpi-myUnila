"""
BANPT Akreditasi Fetcher - Direct JSON API
Fetches accreditation data from BANPT JSON API endpoint
Filters for Universitas Lampung only

Requirements:
    pip install requests

Usage:
    python fetch_banpt_api.py

Output:
    - database/data/banpt_akreditasi_unila.json
"""

import json
import os
import sys
import requests
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional

# Configuration
BANPT_API_URL = "https://banpt.or.id/direktori/model/dir_prodi/get_hasil_pencariannew.php"
TIMEOUT = 60  # seconds
UNIVERSITAS_KEYWORDS = [
    'UNIV LAMPUNG',
    'UNIVERSITAS LAMPUNG',
    'UNILA'
]

class BANPTApiFetcher:
    """Fetches BANPT accreditation data via JSON API"""

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': 'https://banpt.or.id/direktori/prodi/pencarian_prodi.php'
        })

        self.data_dir = Path(__file__).parent.parent / 'database' / 'data'
        self.data_dir.mkdir(parents=True, exist_ok=True)

        self.results = []
        self.stats = {
            'total_fetched': 0,
            'unila_only': 0,
            'by_jenjang': {},
            'by_akreditasi': {}
        }

    def is_unila(self, pt_name: str) -> bool:
        """Check if institution name is Universitas Lampung"""
        pt_upper = pt_name.upper().strip()

        # Exact matches
        for keyword in UNIVERSITAS_KEYWORDS:
            if keyword in pt_upper:
                # Make sure it's not another institution with "LAMPUNG" in name
                if 'LAMPUNG' in pt_upper and 'UNIV' in pt_upper:
                    # Exclude if it's clearly not Unila
                    exclude_keywords = ['TEKNOKRAT', 'MUHAMMADIYAH', 'BANDAR', 'INFORMATIKA']
                    if any(excl in pt_upper for excl in exclude_keywords):
                        return False
                    return True

        return False

    def fetch_all_data(self) -> List[Dict]:
        """Fetch all data from BANPT API"""
        print("Fetching data from BANPT API...")
        print(f"URL: {BANPT_API_URL}")

        try:
            # Add timestamp parameter to avoid caching
            params = {
                '_': str(int(datetime.now().timestamp() * 1000))
            }

            response = self.session.get(
                BANPT_API_URL,
                params=params,
                timeout=TIMEOUT
            )

            if response.status_code != 200:
                print(f"ERROR: HTTP {response.status_code}")
                return []

            # Parse JSON response
            data = response.json()

            if 'data' not in data:
                print("ERROR: Invalid response format")
                return []

            raw_data = data['data']
            self.stats['total_fetched'] = len(raw_data)

            print(f"OK: Fetched {len(raw_data)} total records from BANPT")

            return raw_data

        except requests.exceptions.Timeout:
            print("ERROR: Request timeout")
            return []
        except requests.exceptions.RequestException as e:
            print(f"ERROR: Request failed - {e}")
            return []
        except json.JSONDecodeError as e:
            print(f"ERROR: Invalid JSON response - {e}")
            return []
        except Exception as e:
            print(f"ERROR: Unexpected error - {e}")
            return []

    def filter_unila(self, raw_data: List) -> List[Dict]:
        """Filter only Universitas Lampung records"""
        print("\nFiltering for Universitas Lampung...")

        unila_records = []

        for row in raw_data:
            if len(row) < 9:
                continue

            # Parse row data
            # [0: PT, 1: Prodi, 2: Jenjang, 3: Wilayah, 4: No SK, 5: Tahun, 6: Akreditasi, 7: Kadaluarsa, 8: Status]
            pt_name = row[0]
            prodi_name = row[1]
            jenjang = row[2]
            wilayah = row[3]
            no_sk = row[4]
            tahun_sk = row[5]
            akreditasi = row[6]
            tanggal_kadaluarsa = row[7] if row[7] != '-' else None
            status = row[8]

            # Check if it's Unila
            if not self.is_unila(pt_name):
                continue

            # Create structured record
            record = {
                'perguruan_tinggi': pt_name,
                'nama_prodi': prodi_name,
                'jenjang': jenjang,
                'wilayah': wilayah,
                'no_sk': no_sk,
                'tahun_sk': tahun_sk,
                'akreditasi': akreditasi,
                'tanggal_kadaluarsa': tanggal_kadaluarsa,
                'status': status,
                'fetched_at': datetime.now().isoformat(),
                'source': 'banpt_api'
            }

            unila_records.append(record)

            # Update stats
            self.stats['by_jenjang'][jenjang] = self.stats['by_jenjang'].get(jenjang, 0) + 1
            self.stats['by_akreditasi'][akreditasi] = self.stats['by_akreditasi'].get(akreditasi, 0) + 1

        self.stats['unila_only'] = len(unila_records)
        print(f"OK: Found {len(unila_records)} Universitas Lampung records")

        return unila_records

    def export_to_json(self, records: List[Dict]):
        """Export filtered data to JSON"""
        output_file = self.data_dir / 'banpt_akreditasi_unila.json'

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(records, f, indent=2, ensure_ascii=False)

        print(f"\nOK: Exported to {output_file}")

        # Also export summary
        summary_file = self.data_dir / 'banpt_summary.json'
        summary = {
            'fetched_at': datetime.now().isoformat(),
            'statistics': self.stats,
            'source': 'banpt_api'
        }

        with open(summary_file, 'w', encoding='utf-8') as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)

        print(f"OK: Summary exported to {summary_file}")

    def print_summary(self):
        """Print fetch summary"""
        print("\n" + "="*80)
        print("FETCH SUMMARY")
        print("="*80)

        print(f"\nTotal records fetched from BANPT: {self.stats['total_fetched']}")
        print(f"Universitas Lampung only:         {self.stats['unila_only']}")

        if self.stats['by_jenjang']:
            print("\nBy Jenjang:")
            for jenjang, count in sorted(self.stats['by_jenjang'].items()):
                print(f"  - {jenjang}: {count}")

        if self.stats['by_akreditasi']:
            print("\nBy Akreditasi:")
            for akred, count in sorted(self.stats['by_akreditasi'].items()):
                print(f"  - {akred}: {count}")

        print("\n" + "="*80)

    def run(self):
        """Main execution"""
        print("="*80)
        print("BANPT Akreditasi Fetcher - Universitas Lampung")
        print("Source: BANPT JSON API")
        print("="*80)
        print()

        # Fetch all data
        raw_data = self.fetch_all_data()

        if not raw_data:
            print("\nERROR: No data fetched!")
            return

        # Filter for Unila only
        unila_records = self.filter_unila(raw_data)

        if not unila_records:
            print("\nWARNING: No Universitas Lampung records found!")
            return

        # Export to JSON
        self.export_to_json(unila_records)

        # Print summary
        self.print_summary()

        print("\nSUCCESS: Data fetch completed!")


if __name__ == '__main__':
    fetcher = BANPTApiFetcher()
    fetcher.run()

#!/usr/bin/env python3
"""
Remove bidang_pekerjaan endpoint from service.go
"""
import re

# Read service.go
with open('apps/referensi/service.go', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove from metadata list
content = re.sub(
    r'\t\t\{Key: "bidang_pekerjaan",[^\}]+\},\n',
    '\t\t// Bidang pekerjaan endpoint removed as per user request\n',
    content
)

# 2. Remove from GetAllReferensiMetadata switch case
pattern1 = r'\t\tcase "bidang_pekerjaan":\n\t\t\tlist, _ := s\.repo\.GetAllBidangPekerjaan\(\)\n\t\t\tmetadata\[i\]\.TotalRecords = len\(list\)\n\t\t\tif len\(list\) > 0 && list\[0\]\.LastSync != nil \{\n\t\t\t\tmetadata\[i\]\.LastSync = list\[0\]\.LastSync\n\t\t\t\tif list\[0\]\.SyncedBy != nil \{\n\t\t\t\t\tmetadata\[i\]\.SyncedBy = \*list\[0\]\.SyncedBy\n\t\t\t\t\}\n\t\t\t\}\n'

content = re.sub(pattern1, '\t\t// case "bidang_pekerjaan": removed\n', content)

# 3. Remove from BatchSyncFromSister switch case
pattern2 = r'\t\t\tcase "bidang_pekerjaan":\n\t\t\t\ttotalRecords, err = s\.SyncBidangPekerjaanFromSister\(syncedBy\)\n'

content = re.sub(pattern2, '\t\t\t// case "bidang_pekerjaan": removed\n', content)

# Write back
with open('apps/referensi/service.go', 'w', encoding='utf-8') as f:
    f.write(content)

print("OK Removed bidang_pekerjaan endpoint from service.go")
print("   - Removed from metadata list")
print("   - Removed from GetAllReferensiMetadata switch")
print("   - Removed from BatchSyncFromSister switch")

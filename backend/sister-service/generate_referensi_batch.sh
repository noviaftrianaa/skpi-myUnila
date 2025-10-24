#!/bin/bash
# Generator script untuk batch implementation referensi endpoints
# This script generates backend files for multiple referensi endpoints

cat > /tmp/referensi_config.txt << 'EOF'
# Format: EntityName|TableName|IDField|IDType|NameField
JenjangPendidikan|jenjang_pendidikan|id_jenjang_didik|int|nm_jenjang_didik
GelarAkademik|gelar_akademik|id_gelar_akademik|int|nm_gelar_akademik
Semester|semester|id_smt|string|nm_smt
EOF

echo "✅ Referensi configuration created"
echo "📝 Next: Manually create repository, service, controller files for each entity"
echo "Pattern sudah ada di Negara implementation"

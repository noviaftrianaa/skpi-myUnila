#!/bin/bash

echo "⚠️  TEMPORARY DISABLE JWT for Sister Service (Development Only)"
echo "================================================================"
echo ""

# Disable JWT plugin
PLUGIN_ID="8ad4de4f-13de-4a2c-a975-d18b742d28ba"

echo "Disabling JWT plugin..."
curl -X PATCH http://localhost:9801/plugins/$PLUGIN_ID \
  -H 'Content-Type: application/json' \
  -d '{"enabled": false}'

echo ""
echo ""
echo "✅ JWT plugin disabled for Sister Service"
echo ""
echo "Now test: http://localhost:3001/dashboard/sister-integrator/referensi/agama"
echo ""
echo "⚠️  REMEMBER TO RE-ENABLE BEFORE PRODUCTION!"
echo "To re-enable, run:"
echo ""
echo "  curl -X PATCH http://localhost:9801/plugins/$PLUGIN_ID \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"enabled\": true}'"
echo ""

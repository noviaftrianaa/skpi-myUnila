#!/bin/bash
# Automated PDDikti Akreditasi Update Script
# Usage: ./scripts/update_pddikti.sh

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "============================================================"
echo "🚀 PDDikti Akreditasi Automated Update"
echo "============================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check Python dependencies
echo "📋 Checking Python dependencies..."
if ! command -v python &> /dev/null; then
    echo -e "${RED}❌ Python not found!${NC}"
    echo "Please install Python 3.7+"
    exit 1
fi

if ! python -c "import pddiktipy" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  pddiktipy not installed${NC}"
    echo "Installing dependencies..."
    pip install -r "$SCRIPT_DIR/requirements.txt"
fi

echo -e "${GREEN}✓ Python dependencies OK${NC}"
echo ""

# Step 2: Fetch data from PDDikti
echo "🌐 Fetching data from PDDikti API..."
cd "$PROJECT_DIR"

python "$SCRIPT_DIR/fetch_pddikti_data.py"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to fetch PDDikti data!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Data fetched successfully${NC}"
echo ""

# Step 3: Verify JSON files exist
echo "🔍 Verifying JSON files..."

UNILA_JSON="$PROJECT_DIR/database/data/pddikti_unila_akreditasi.json"
PRODI_JSON="$PROJECT_DIR/database/data/pddikti_prodi_akreditasi.json"

if [ ! -f "$UNILA_JSON" ]; then
    echo -e "${RED}❌ University data file not found!${NC}"
    exit 1
fi

if [ ! -f "$PRODI_JSON" ]; then
    echo -e "${RED}❌ Study programs data file not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ JSON files verified${NC}"
echo ""

# Step 4: Show summary
echo "📊 Data Summary:"
if command -v jq &> /dev/null; then
    echo "University:"
    jq -r '"\(.text // .nama) - Akreditasi: \(.akreditasi)"' "$UNILA_JSON"
    echo ""
    echo "Study Programs:"
    TOTAL=$(jq 'length' "$PRODI_JSON")
    echo "Total: $TOTAL programs"
else
    echo "(Install 'jq' for detailed summary)"
fi
echo ""

# Step 5: Run Laravel Seeder
echo "💾 Running Laravel Seeder..."

if command -v docker &> /dev/null && docker ps | grep -q myunila-public-service; then
    # Using Docker
    echo "Using Docker container..."
    docker exec myunila-public-service php artisan db:seed --class=PDDiktiAkreditasiSeeder
else
    # Direct PHP
    echo "Using direct PHP..."
    php artisan db:seed --class=PDDiktiAkreditasiSeeder
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Seeder failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Seeder completed successfully${NC}"
echo ""

# Step 6: Clear cache
echo "🧹 Clearing cache..."

if command -v docker &> /dev/null && docker ps | grep -q myunila-public-service; then
    docker exec myunila-public-service php artisan cache:clear
else
    php artisan cache:clear
fi

echo -e "${GREEN}✓ Cache cleared${NC}"
echo ""

# Step 7: Final summary
echo "============================================================"
echo -e "${GREEN}✅ PDDikti Akreditasi Update Completed Successfully!${NC}"
echo "============================================================"
echo ""
echo "Next steps:"
echo "1. Verify data in database"
echo "2. Check frontend displays updated accreditation"
echo "3. Review logs if any warnings were shown"
echo ""
echo "Last update: $(date)"
echo ""

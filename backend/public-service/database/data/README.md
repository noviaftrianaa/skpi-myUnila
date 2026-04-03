# Ranking Data Management Guide

## 📋 Overview

This folder contains CSV files for managing university ranking data. You can easily update ranking data by editing the CSV file in Excel or any spreadsheet software, then running the Laravel seeder to import the data into the database.

## 📂 Files

- **`rankings.csv`** - Main data file (edit this to update rankings)
- **`rankings.csv.example`** - Template and documentation
- **`README.md`** - This file

## 🚀 Quick Start

### 1. Edit Data in Excel

1. Open `rankings.csv` in Microsoft Excel, Google Sheets, or LibreOffice Calc
2. Edit the data as needed:
   - Update existing rows to modify rankings
   - Add new rows to insert new rankings
   - Leave cells empty for NULL values
3. Save the file (keep it as CSV format)

### 2. Run the Seeder

**From your local machine (Windows):**
```bash
cd E:\laragon\www\my-unila\backend\dashboard-service
docker exec myunila-dashboard-service php artisan db:seed --class=RankingSeeder
```

**From inside the Docker container:**
```bash
docker exec -it myunila-dashboard-service bash
php artisan db:seed --class=RankingSeeder
exit
```

### 3. Verify Changes

Check the seeder output - it will show:
- ✓ Inserted: New records added
- ↻ Updated: Existing records updated
- ⊘ Skipped: Invalid/empty rows
- ✗ Errors: Errors encountered

The seeder automatically clears the cache, so changes are immediately visible in the API.

## 📊 CSV Structure

### Required Columns (Do NOT change header names)

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `category_code` | Text | Category identifier | `greenmetric`, `qs`, `the`, `webometrics` |
| `year` | Integer | Ranking year | `2024`, `2025` |
| `period` | Text | Period (optional) | `Annual`, `January`, `July` |
| `world_rank` | Text | Displayed world rank | `1500`, `1401+`, `TBD` |
| `world_rank_numeric` | Integer | Numeric rank for sorting | `1500`, `1401` (empty if TBD) |
| `national_rank` | Integer | Indonesia rank | `13`, `16`, `17` |
| `regional_rank` | Integer | Regional rank (optional) | `50` (Asia/ASEAN) |
| `overall_score` | Decimal | Score (optional) | `75.5`, `82.3` |
| `rank_change` | Integer | Change from previous | `-10` (improved), `+5` (dropped) |
| `trend` | Text | Trend indicator | `up`, `down`, `stable`, `new` |
| `source_url` | Text | Verification URL | Full URL to source |
| `notes` | Text | Additional info | Any notes/description |

### Important Rules

1. **Unique Constraint**: `category_code` + `year` + `period` must be unique
   - If a record exists → it will be **UPDATED**
   - If not exists → it will be **INSERTED**

2. **Category Codes**: Must be one of:
   - `greenmetric` - UI GreenMetric World University Rankings
   - `qs` - QS World University Rankings
   - `the` - Times Higher Education
   - `webometrics` - Ranking Web of Universities

3. **Empty Values**: Leave cell empty (not "NULL" or "0") for NULL values

4. **Text with Commas**: Wrap in quotes if contains comma
   - ✓ `"Top 1,500 from 1,904 universities"`
   - ✗ `Top 1,500 from 1,904 universities` (will break CSV)

## 💡 Usage Examples

### Example 1: Add New 2026 Data

Add a new row at the end of the CSV:

```csv
qs,2026,Annual,1350,1350,,,,,stable,https://www.topuniversities.com/universities/university-lampung,"QS World University Rankings 2026 - Improved ranking"
```

### Example 2: Update Existing Data

Find the row and modify values. For example, update GreenMetric 2024 when world rank is announced:

**Before:**
```csv
greenmetric,2024,Annual,TBD,,13,...
```

**After:**
```csv
greenmetric,2024,Annual,550,550,13,...
```

### Example 3: Add Multiple Periods

Webometrics has January and July editions:

```csv
webometrics,2025,January,1588,1588,17,,,-10,down,...
webometrics,2025,July,1560,1560,16,,,28,up,...
```

### Example 4: Complex Notes with Commas

Use quotes for text containing commas:

```csv
the,2025,Annual,1450,1450,15,,,,"up",https://..., "Top 1,500 from 2,000 universities in 110 countries. Significant improvement in research citations."
```

## 🔧 Advanced Features

### Bulk Update

1. Export current data:
   ```bash
   docker exec myunila-dashboard-service php artisan tinker
   DB::table('ranking.university_rankings')->get(); // View current data
   ```

2. Edit multiple rows in Excel

3. Run seeder - it will update all matching records

### Clear All Data and Re-seed

```bash
# Delete all rankings (careful!)
docker exec myunila-dashboard-service php artisan tinker
DB::table('ranking.university_rankings')->truncate();

# Re-seed from CSV
docker exec myunila-dashboard-service php artisan db:seed --class=RankingSeeder
```

### Validate Before Seeding

Check CSV format is correct:
```bash
# On Windows
type database\data\rankings.csv | head -5

# Or open in Notepad++ to check for errors
```

## 📝 Best Practices

### 1. Backup Before Major Changes

```bash
# Export current data to backup
docker exec myunila-dashboard-service php artisan tinker
$data = DB::table('ranking.university_rankings')->get();
file_put_contents('backup_rankings_' . date('Y-m-d') . '.json', $data->toJson());
```

### 2. Version Control

Keep copies of your CSV files with dates:
- `rankings_2024-01-15.csv`
- `rankings_2024-06-20.csv`

### 3. Data Sources

Always include `source_url` for verification:
- GreenMetric: https://greenmetric.ui.ac.id/
- QS: https://www.topuniversities.com/
- THE: https://www.timeshighereducation.com/
- Webometrics: https://www.webometrics.info/

### 4. Regular Updates

Update ranking data when new rankings are released:
- **GreenMetric**: Usually December each year
- **QS**: Usually June each year
- **THE**: Usually September-October each year
- **Webometrics**: January and July each year

### 5. Cache Clearing

The seeder automatically clears cache. But if needed manually:
```bash
docker exec myunila-dashboard-service php artisan cache:clear
```

## 🐛 Troubleshooting

### Error: "CSV file not found"

**Solution**: Make sure `rankings.csv` exists in `database/data/` folder

### Error: "Missing required column"

**Solution**: Do not modify or delete header row. Keep all column names exactly as in template.

### Error: "Unknown category"

**Solution**: Use only valid category codes: `greenmetric`, `qs`, `the`, `webometrics`

### Error: "Duplicate entry"

**Solution**: Check for duplicate rows with same `category_code + year + period`. Only one record per combination is allowed.

### Warning: "Skipped rows"

**Cause**: Empty `category_code` or invalid data

**Solution**: Check those rows in CSV, ensure all required fields are filled

## 📞 Support

For questions or issues with ranking data management:
1. Check this README first
2. Review the example file: `rankings.csv.example`
3. Check seeder code: `database/seeders/RankingSeeder.php`
4. Contact: mizar.zulmi@staff.unila.ac.id

## 📚 Related Files

- Seeder: `database/seeders/RankingSeeder.php`
- API Service: `app/Services/RankingService.php`
- API Controller: `app/Http/Controllers/RankingController.php`
- Frontend Component: `frontend/src/shared/components/statistik/WorldClassRanking.tsx`

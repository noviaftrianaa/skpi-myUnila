# Update Sister Services to Use sisterClient

## Problem
Semua Sister service (`dosenService.ts`, `publikasiService.ts`, dll) menggunakan `axios` langsung tanpa token refresh mechanism, menyebabkan user logout saat operasi panjang (20-30 menit).

## Solution
Gunakan `sisterClient` yang sudah include auto token refresh.

## Files to Update

### ✅ Already Updated:
- `dosenService.ts` - DONE

### ⏳ Need to Update:
1. `publikasiService.ts`
2. `penelitianService.ts`
3. `pengabdianService.ts`
4. `penugasanService.ts`
5. `riwayatPekerjaanService.ts`
6. `pendidikanService.ts`
7. `schedulerService.ts`
8. `sisterService.ts`

## How to Update Each File

### Step 1: Import sisterClient
```typescript
// BEFORE:
import axios from 'axios';

// AFTER:
import axios from 'axios';
import { sisterClient } from '@/lib/api/sisterClient';
```

### Step 2: Replace axios calls to SISTER_API_URL
```typescript
// BEFORE:
const response = await axios.post(`${SISTER_API_URL}/publikasi/sync`, ...);

// AFTER:
const response = await sisterClient.post(`/publikasi/sync`, ...);
```

**Important:**
- Remove `${SISTER_API_URL}` prefix (sisterClient already has baseURL)
- Change `axios` to `sisterClient`
- Keep other axios calls (non-SISTER) as is

### Step 3: Check for all axios.<method> patterns

Search for:
- `axios.get(${SISTER_API_URL}`
- `axios.post(${SISTER_API_URL}`
- `axios.put(${SISTER_API_URL}`
- `axios.delete(${SISTER_API_URL}`
- `axios.patch(${SISTER_API_URL}`

Replace with:
- `sisterClient.get(`
- `sisterClient.post(`
- `sisterClient.put(`
- `sisterClient.delete(`
- `sisterClient.patch(`

## Example: publikasiService.ts

```typescript
// BEFORE:
import axios from 'axios';

const SISTER_API_URL = process.env.NEXT_PUBLIC_SISTER_API_URL || 'http://localhost:8083/public';

export const sisterPublikasiService = {
  async syncFromSister(syncedBy: string): Promise<SisterPublikasiSyncResult> {
    const response = await axios.post<SisterApiResponse<SisterPublikasiSyncResult>>(
      `${SISTER_API_URL}/publikasi/sync`,
      null,
      { params: { synced_by: syncedBy } }
    );
    return response.data.data;
  },
};

// AFTER:
import axios from 'axios';
import { sisterClient } from '@/lib/api/sisterClient';

const SISTER_API_URL = process.env.NEXT_PUBLIC_SISTER_API_URL || 'http://localhost:8083/public';

export const sisterPublikasiService = {
  async syncFromSister(syncedBy: string): Promise<SisterPublikasiSyncResult> {
    const response = await sisterClient.post<SisterApiResponse<SisterPublikasiSyncResult>>(
      `/publikasi/sync`,  // ✅ Remove ${SISTER_API_URL} prefix
      null,
      { params: { synced_by: syncedBy } }
    );
    return response.data.data;
  },
};
```

## Quick Sed Commands (Optional)

For each file in `frontend/src/lib/services/`:

```bash
# Add import (manual - di line setelah import axios)
# Replace axios calls to SISTER
sed -i 's/axios\.post(`${SISTER_API_URL}/sisterClient.post(`/g' *.ts
sed -i 's/axios\.get(`${SISTER_API_URL}/sisterClient.get(`/g' *.ts
sed -i 's/axios\.put(`${SISTER_API_URL}/sisterClient.put(`/g' *.ts
sed -i 's/axios\.delete(`${SISTER_API_URL}/sisterClient.delete(`/g' *.ts
sed -i 's/axios\.patch(`${SISTER_API_URL}/sisterClient.patch(`/g' *.ts
```

## Testing After Update

1. Login ke portal
2. Buka Sister Integrator
3. Trigger sync data (mis: Dosen, Publikasi)
4. Biarkan sync berjalan 20-30 menit
5. **Expected:** User tetap login, sync selesai tanpa error "Sesi berakhir"

## Monitor Logs

Browser Console should show:
```
🚀 Sister API Request: POST /dosen/sync
🔄 Sister API: Access token expired, refreshing with refresh_token...
✅ Sister API: Tokens refreshed and rotated successfully
🚀 Sister API Request: POST /dosen/sync (retry)
✅ Sister API Response: 200
```

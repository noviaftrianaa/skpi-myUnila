# Implementation Plan: Referensi Endpoints

## Progress

### ✅ Completed
1. **Agama** - DONE
   - Backend: Entity, Repository, Service, Controller, Routes ✅
   - Frontend: Page dengan DataTable, Cards, Sync ✅

### 🔄 In Progress
2. **Negara** - Backend in progress
   - Entity: ✅ Done
   - Repository: ✅ Done
   - Service: 🔄 Next
   - Controller: ⏳ Pending
   - Routes: ⏳ Pending
   - Frontend: ⏳ Pending

### ⏳ Pending
3. **Jenjang Pendidikan**
4. **Gelar Akademik**
5. **Semester**

## File Structure

```
sister-service/
├── apps/referensi/
│   ├── entity.go           # All entities (Agama, Negara, etc)
│   ├── repository.go       # All repository methods
│   ├── service.go          # All business logic
│   ├── controller.go       # All HTTP handlers
│   └── router.go           # All routes registration
```

## Implementation Strategy

Each endpoint follows the same pattern:
1. Add entity struct (DONE for Negara)
2. Add repository methods (DONE for Negara)
3. Add service methods
4. Add controller handlers
5. Register routes
6. Add Sister API client method
7. Create frontend page

## Next Steps
- Continue with Service layer for Negara
- Then Controller, Routes
- Then Sister API client
- Finally Frontend implementation

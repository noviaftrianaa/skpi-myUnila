# Dashboard Service - Architecture Documentation

## 📐 3-Layer Architecture

Dashboard Service mengikuti **3-Layer Architecture** yang sama dengan Auth Service:

```
Controller Layer (HTTP)
    ↓
Service Layer (Business Logic)
    ↓
Repository Layer (Data Access)
```

---

## 🏗️ Directory Structure

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Controller.php              # Base controller
│   │   ├── UniversityProfileController.php  # HTTP request handler
│   │   └── OpenApiInfo.php             # Swagger documentation metadata
│   └── Middleware/
│       └── Cors.php                    # CORS middleware for public API
│
├── Services/
│   └── UniversityProfileService.php    # Business logic layer
│
├── Repositories/
│   └── UniversityProfileRepository.php # Data access layer
│
├── Traits/
│   └── ApiResponse.php                 # Standardized API responses
│
└── Providers/
    └── AppServiceProvider.php          # Service container bindings
```

---

## 📦 Layer Responsibilities

### 1. Controller Layer (HTTP Handler)

**File:** `app/Http/Controllers/UniversityProfileController.php`

**Responsibilities:**
- ✅ Handle HTTP requests and responses
- ✅ Validate incoming requests (via Form Requests)
- ✅ Call appropriate Service methods
- ✅ Format responses using ApiResponse trait
- ✅ Handle exceptions and error responses
- ❌ NO business logic
- ❌ NO data access

**Example:**
```php
public function index(): JsonResponse
{
    try {
        $profile = $this->service->getCompleteProfile();
        return $this->successResponse($profile, 'University profile retrieved successfully');
    } catch (\Exception $e) {
        return $this->errorResponse('Failed to retrieve university profile: ' . $e->getMessage(), 500);
    }
}
```

---

### 2. Service Layer (Business Logic)

**File:** `app/Services/UniversityProfileService.php`

**Responsibilities:**
- ✅ Implement business logic
- ✅ Orchestrate multiple repository calls
- ✅ Transform and combine data
- ✅ Apply business rules
- ✅ Handle complex operations (search, filtering, aggregation)
- ❌ NO direct HTTP handling
- ❌ NO direct database access

**Example:**
```php
public function getCompleteProfile(): array
{
    // Orchestrate multiple data sources
    $profile = $this->repository->getProfile();
    $profile['faculties'] = $this->repository->getFaculties();
    $profile['statistics'] = $this->repository->getStatistics();
    $profile['social_media'] = $this->repository->getSocialMedia();
    $profile['colors'] = $this->repository->getColors();

    return $profile;
}
```

**Available Methods:**
- `getCompleteProfile()` - Get full university profile
- `getQuickFacts()` - Get 6 fact cards for homepage
- `getContactInfo()` - Get contact information
- `getStatistics()` - Get university statistics
- `getFaculties()` - Get faculties list
- `getSocialMedia()` - Get social media links
- `getBrandColors()` - Get brand colors
- `search($query)` - Search university data
- `getHeroData()` - Get data for hero section

---

### 3. Repository Layer (Data Access)

**File:** `app/Repositories/UniversityProfileRepository.php`

**Responsibilities:**
- ✅ Access data sources (database, API, static data)
- ✅ Return raw data
- ✅ Handle database queries (in future)
- ✅ Cache management (in future)
- ❌ NO business logic
- ❌ NO data transformation

**Example:**
```php
public function getProfile(): array
{
    return [
        'name' => 'Universitas Lampung',
        'short_name' => 'UNILA',
        'tagline' => 'Universitas Terkemuka di Sumatera',
        // ... more fields
    ];
}
```

**Available Methods:**
- `getProfile()` - Get basic university profile
- `getFaculties()` - Get list of faculties
- `getStatistics()` - Get statistics data
- `getSocialMedia()` - Get social media links
- `getColors()` - Get brand colors
- `getQuickFacts()` - Get quick facts data
- `getContactInfo()` - Get contact information

---

## 🔄 Request Flow

### Example: GET /api/v1/university-profile

```
1. HTTP Request
   ↓
2. UniversityProfileController::index()
   ├─ Receives request
   └─ Calls: $this->service->getCompleteProfile()
      ↓
3. UniversityProfileService::getCompleteProfile()
   ├─ Calls: $this->repository->getProfile()
   ├─ Calls: $this->repository->getFaculties()
   ├─ Calls: $this->repository->getStatistics()
   ├─ Calls: $this->repository->getSocialMedia()
   ├─ Calls: $this->repository->getColors()
   └─ Combines all data
      ↓
4. UniversityProfileRepository::getProfile() etc.
   └─ Returns raw data (currently static)
      ↓
5. Service Layer
   └─ Combines and transforms data
      ↓
6. Controller Layer
   └─ Formats response using ApiResponse trait
      ↓
7. HTTP Response (JSON)
```

---

## 🔧 Dependency Injection

### AppServiceProvider Configuration

**File:** `app/Providers/AppServiceProvider.php`

```php
public function register(): void
{
    // Register Repository Layer
    $this->app->singleton(
        \App\Repositories\UniversityProfileRepository::class,
        \App\Repositories\UniversityProfileRepository::class
    );

    // Register Service Layer (with Repository Dependency Injection)
    $this->app->singleton(
        \App\Services\UniversityProfileService::class,
        function ($app) {
            return new \App\Services\UniversityProfileService(
                $app->make(\App\Repositories\UniversityProfileRepository::class)
            );
        }
    );
}
```

### Controller Constructor Injection

```php
protected UniversityProfileService $service;

public function __construct(UniversityProfileService $service)
{
    $this->service = $service;
}
```

---

## 📊 Benefits of This Architecture

### 1. **Separation of Concerns**
- Each layer has clear, single responsibility
- Easy to understand and maintain

### 2. **Testability**
- Each layer can be unit tested independently
- Easy to mock dependencies

### 3. **Reusability**
- Service methods can be called from multiple controllers
- Repository methods can be used by multiple services

### 4. **Flexibility**
- Easy to switch data sources (static → database → API)
- Business logic changes don't affect data access

### 5. **Maintainability**
- Changes are isolated to specific layers
- Easier to debug and troubleshoot

---

## 🧪 Testing Strategy

### Unit Tests

```php
// Test Repository (Data Access)
public function test_repository_returns_profile_data()
{
    $repo = new UniversityProfileRepository();
    $profile = $repo->getProfile();

    $this->assertArrayHasKey('name', $profile);
    $this->assertEquals('Universitas Lampung', $profile['name']);
}

// Test Service (Business Logic)
public function test_service_combines_profile_data()
{
    $mockRepo = Mockery::mock(UniversityProfileRepository::class);
    $mockRepo->shouldReceive('getProfile')->andReturn([...]);
    $mockRepo->shouldReceive('getFaculties')->andReturn([...]);

    $service = new UniversityProfileService($mockRepo);
    $result = $service->getCompleteProfile();

    $this->assertArrayHasKey('faculties', $result);
}

// Test Controller (HTTP)
public function test_index_returns_successful_response()
{
    $response = $this->get('/api/v1/university-profile');

    $response->assertStatus(200);
    $response->assertJsonStructure([
        'success',
        'message',
        'data' => ['name', 'faculties', 'statistics']
    ]);
}
```

---

## 🔮 Future Enhancements

### 1. Database Integration

Currently using static data. Future implementation with database:

```php
// Repository with Eloquent
public function getProfile(): array
{
    $university = University::first();
    return $university->toArray();
}

public function getFaculties(): array
{
    return Faculty::with('programs')->get()->toArray();
}
```

### 2. Caching

Add cache layer in Repository:

```php
public function getProfile(): array
{
    return Cache::remember('university_profile', 3600, function () {
        return University::first()->toArray();
    });
}
```

### 3. External API Integration

Fetch data from external sources:

```php
public function getStatistics(): array
{
    // Fetch from PDDIKTI API or SIAKAD
    $response = Http::get('https://api.unila.ac.id/statistics');
    return $response->json();
}
```

### 4. Request Validation

Add Form Request classes:

```php
// app/Http/Requests/SearchUniversityRequest.php
public function rules(): array
{
    return [
        'query' => 'required|string|min:3|max:100',
        'type' => 'in:faculty,program,all'
    ];
}
```

### 5. API Versioning

Support multiple API versions:

```php
// v1: Current implementation
Route::prefix('v1')->group(function () {
    Route::get('/university-profile', [UniversityProfileController::class, 'index']);
});

// v2: Future enhanced version
Route::prefix('v2')->group(function () {
    Route::get('/university-profile', [UniversityProfileV2Controller::class, 'index']);
});
```

---

## 📚 Comparison with Auth Service

| Aspect | Auth Service | Dashboard Service |
|--------|--------------|-------------------|
| **Controllers** | AuthController, SsoController | UniversityProfileController |
| **Services** | AuthService, TokenService, SsoService | UniversityProfileService |
| **Repositories** | UserRepository, TokenRepository | UniversityProfileRepository |
| **Middleware** | JwtAuthenticate (required) | Cors (public API) |
| **Data Source** | SQL Server database | Static data (future: database) |
| **Authentication** | Required (JWT) | Public (no auth) |

---

## 🎯 Best Practices

### 1. Keep Controllers Thin
```php
// ❌ BAD: Business logic in controller
public function index()
{
    $profile = [
        'name' => 'Universitas Lampung',
        // ... 100 lines of data
    ];
    return response()->json($profile);
}

// ✅ GOOD: Delegate to service
public function index()
{
    $profile = $this->service->getCompleteProfile();
    return $this->successResponse($profile, 'Success');
}
```

### 2. Service Layer for Business Logic
```php
// ❌ BAD: Complex logic in repository
public function getCompleteProfile()
{
    // Complex aggregation, transformation
    return $data;
}

// ✅ GOOD: Repository returns raw data, Service handles logic
// Repository:
public function getProfile() { return $rawData; }

// Service:
public function getCompleteProfile()
{
    $profile = $this->repository->getProfile();
    $profile['calculated_field'] = $this->calculateSomething($profile);
    return $profile;
}
```

### 3. Use Dependency Injection
```php
// ❌ BAD: Direct instantiation
$repo = new UniversityProfileRepository();
$service = new UniversityProfileService($repo);

// ✅ GOOD: DI via constructor
public function __construct(UniversityProfileService $service)
{
    $this->service = $service;
}
```

---

## 📖 References

- [Laravel Service Container](https://laravel.com/docs/11.x/container)
- [Laravel Repository Pattern](https://dev.to/carlomigueldy/getting-started-with-repository-pattern-in-laravel-using-inheritance-and-dependency-injection-2ohe)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

**Last Updated:** October 16, 2025
**Version:** 1.0.0
**Maintainer:** MyUnila Backend Team

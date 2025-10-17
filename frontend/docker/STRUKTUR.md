# Struktur Folder Docker

```
my-unila-portal/
├── docker/                        # 📁 Folder Docker (semua file Docker disini)
│   ├── Dockerfile                 # 🐳 Multi-stage build configuration
│   ├── docker-compose.yml         # 🎭 Orchestration container
│   ├── .dockerignore              # 🚫 File yang diabaikan saat build
│   ├── README.md                  # 📖 Dokumentasi lengkap Docker
│   ├── start-production.bat       # ▶️  Windows script - Production
│   ├── start-development.bat      # ▶️  Windows script - Development
│   ├── start-production.sh        # ▶️  Linux/Mac script - Production
│   └── start-development.sh       # ▶️  Linux/Mac script - Development
│
├── docker-start.bat               # 🔗 Shortcut Windows - Production (dari root)
├── docker-start-dev.bat           # 🔗 Shortcut Windows - Development (dari root)
├── docker-start.sh                # 🔗 Shortcut Linux/Mac - Production (dari root)
├── docker-start-dev.sh            # 🔗 Shortcut Linux/Mac - Development (dari root)
│
├── .env.example                   # 📝 Template environment variables
├── next.config.ts                 # ⚙️  Next.js config (standalone output enabled)
└── ... (other project files)
```

## Cara Penggunaan

### Opsi 1: Dari Root Project (Termudah)
```bash
# Windows
.\docker-start.bat              # Production
.\docker-start-dev.bat          # Development

# Linux/Mac
./docker-start.sh               # Production
./docker-start-dev.sh           # Development
```

### Opsi 2: Dari Folder Docker
```bash
cd docker

# Windows
.\start-production.bat          # Production
.\start-development.bat         # Development

# Linux/Mac
./start-production.sh           # Production
./start-development.sh          # Development
```

### Opsi 3: Manual Docker Compose
```bash
cd docker
docker-compose up -d --build frontend
```

## Build Context

- **Context Root**: Root project (`..` dari folder docker)
- **Dockerfile Location**: `docker/Dockerfile`
- **Docker Compose**: Harus dijalankan dari folder `docker/`
- **Environment**: `.env` tetap di root project

## Keuntungan Struktur Ini

✅ **Terorganisir**: Semua file Docker di satu folder
✅ **Mudah Diakses**: Shortcut scripts di root untuk kemudahan
✅ **Clean Root**: Root project tetap bersih dan rapi
✅ **Flexible**: Bisa dijalankan dari mana saja (root atau docker folder)
✅ **Git Friendly**: Mudah di-ignore jika perlu

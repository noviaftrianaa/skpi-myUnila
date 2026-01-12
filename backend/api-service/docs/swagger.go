package docs

// SwaggerInfo holds exported Swagger Info
var SwaggerInfo = &swaggerInfo{
	Version:     "1.0",
	Host:        "localhost:8085",
	BasePath:    "/",
	Schemes:     []string{"http", "https"},
	Title:       "MyUnila API Service",
	Description: "API untuk integrasi data antar sistem di Universitas Lampung. Menyediakan akses ke data referensi, publikasi, penelitian, mahasiswa, SDM, dan lainnya.",
}

type swaggerInfo struct {
	Version     string
	Host        string
	BasePath    string
	Schemes     []string
	Title       string
	Description string
}

// ReadDoc returns the embedded swagger spec
func (s *swaggerInfo) ReadDoc() string {
	return docTemplate
}

var docTemplate = `{
    "openapi": "3.0.0",
    "info": {
        "title": "MyUnila API Service",
        "description": "Layanan API untuk integrasi data antar sistem di lingkungan Universitas Lampung. Untuk permintaan penambahan endpoint atau kustomisasi API, silakan hubungi tim pengembang melalui email tertera.",
        "version": "1.0.0",
        "contact": {
            "name": "dev@unila.ac.id",
            "email": "dev@unila.ac.id"
        }
    },
    "servers": [
        {
            "url": "http://localhost:8085",
            "description": "Local Server"
        },
        {
            "url": "https://my.unila.ac.id/gateway/api-service",
            "description": "Production Server"
        }
    ],
    "tags": [
        {
            "name": "Auth",
            "description": "Autentikasi dan manajemen token"
        }
    ],
    "paths": {
        "/v1/auth/login": {
            "post": {
                "tags": ["Auth"],
                "summary": "Login untuk mendapatkan access token",
                "description": "Autentikasi pengguna dengan id_aplikasi, username, dan password untuk mendapatkan JWT token",
                "operationId": "login",
                "requestBody": {
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/LoginRequest"
                            },
                            "example": {
                                "id_aplikasi": "your-app-uuid-here",
                                "username": "your-username",
                                "password": "your-password"
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Login berhasil",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/LoginSuccessResponse"
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Bad request - validasi gagal",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ErrorResponse"
                                }
                            }
                        }
                    },
                    "401": {
                        "description": "Unauthorized - kredensial salah",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ErrorResponse"
                                }
                            }
                        }
                    },
                    "403": {
                        "description": "Forbidden - pengguna tidak terdaftar di aplikasi",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ErrorResponse"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/v1/auth/check-token": {
            "post": {
                "tags": ["Auth"],
                "summary": "Cek validitas token",
                "description": "Memvalidasi JWT token dan mengembalikan informasi token serta user",
                "operationId": "checkToken",
                "requestBody": {
                    "required": true,
                    "content": {
                        "application/json": {
                            "schema": {
                                "$ref": "#/components/schemas/CheckTokenRequest"
                            }
                        }
                    }
                },
                "responses": {
                    "200": {
                        "description": "Token info",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/CheckTokenSuccessResponse"
                                }
                            }
                        }
                    },
                    "400": {
                        "description": "Bad request - validasi gagal",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/ErrorResponse"
                                }
                            }
                        }
                    }
                }
            }
        },
        "/health": {
            "get": {
                "tags": ["System"],
                "summary": "Health check",
                "description": "Mengecek status kesehatan service",
                "operationId": "healthCheck",
                "responses": {
                    "200": {
                        "description": "Service healthy",
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "status": {"type": "string", "example": "ok"},
                                        "service": {"type": "string", "example": "MyUnila API Service"},
                                        "version": {"type": "string", "example": "1.0.0"}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    "components": {
        "schemas": {
            "LoginRequest": {
                "type": "object",
                "required": ["id_aplikasi", "username", "password"],
                "properties": {
                    "id_aplikasi": {
                        "type": "string",
                        "format": "uuid",
                        "description": "ID Aplikasi yang terdaftar"
                    },
                    "username": {
                        "type": "string",
                        "description": "Username pengguna"
                    },
                    "password": {
                        "type": "string",
                        "format": "password",
                        "description": "Password pengguna"
                    }
                }
            },
            "CheckTokenRequest": {
                "type": "object",
                "required": ["token_bearer"],
                "properties": {
                    "token_bearer": {
                        "type": "string",
                        "description": "JWT token yang akan dicek"
                    }
                }
            },
            "LoginSuccessResponse": {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": true},
                    "message": {"type": "string", "example": "Berhasil Otentikasi"},
                    "data": {
                        "type": "object",
                        "properties": {
                            "token_status": {"type": "string", "example": "Baru"},
                            "token_dibuat": {"type": "string", "example": "2026-01-12 10:00:00"},
                            "token_kadarluwasa": {"type": "string", "example": "2026-01-12 11:00:00"},
                            "access_token": {"type": "string", "example": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."},
                            "token_type": {"type": "string", "example": "Bearer"},
                            "expires_in": {"type": "integer", "example": 3600}
                        }
                    },
                    "timestamp": {"type": "string", "format": "date-time"}
                }
            },
            "CheckTokenSuccessResponse": {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": true},
                    "message": {"type": "string", "example": "Token valid"},
                    "data": {
                        "type": "object",
                        "properties": {
                            "token_status": {"type": "string", "example": "Aktif"},
                            "token_dibuat": {"type": "string", "example": "2026-01-12 10:00:00"},
                            "token_kadarluwasa": {"type": "string", "example": "2026-01-12 11:00:00"},
                            "user": {
                                "type": "object",
                                "properties": {
                                    "id_pengguna": {"type": "string"},
                                    "username": {"type": "string"},
                                    "email": {"type": "string"},
                                    "nm_pengguna": {"type": "string"},
                                    "peran": {"type": "string"},
                                    "id_aplikasi": {"type": "string"}
                                }
                            }
                        }
                    },
                    "timestamp": {"type": "string", "format": "date-time"}
                }
            },
            "ErrorResponse": {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": false},
                    "message": {"type": "string", "example": "Gagal Otentikasi"},
                    "error": {
                        "type": "object",
                        "properties": {
                            "code": {"type": "string", "example": "UNAUTHORIZED"},
                            "details": {"type": "object"}
                        }
                    },
                    "timestamp": {"type": "string", "format": "date-time"}
                }
            }
        },
        "securitySchemes": {
            "BearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
                "description": "Masukkan JWT token"
            }
        }
    }
}`

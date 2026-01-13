package docs

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gofiber/fiber/v2"
	"github.com/myunila/api-service/docs/openapi"
	"gopkg.in/yaml.v3"
)

var (
	compiledSpec     []byte
	compiledSpecJSON []byte
	specOnce         sync.Once
	specErr          error
)

// loadCompiledSpec loads and compiles the OpenAPI spec from YAML files
func loadCompiledSpec() error {
	specOnce.Do(func() {
		spec, err := openapi.LoadSpec()
		if err != nil {
			log.Printf("Error: Failed to load OpenAPI YAML spec: %v", err)
			specErr = err
			return
		}
		compiledSpec = spec.GetYAML()

		// Convert to JSON for Scalar UI
		var yamlData interface{}
		if err := yaml.Unmarshal(compiledSpec, &yamlData); err != nil {
			specErr = err
			return
		}
		compiledSpecJSON, specErr = json.Marshal(convertYAMLToJSON(yamlData))
	})
	return specErr
}

// convertYAMLToJSON converts YAML maps to JSON-compatible maps
func convertYAMLToJSON(i interface{}) interface{} {
	switch x := i.(type) {
	case map[string]interface{}:
		m := make(map[string]interface{})
		for k, v := range x {
			m[k] = convertYAMLToJSON(v)
		}
		return m
	case map[interface{}]interface{}:
		m := make(map[string]interface{})
		for k, v := range x {
			m[k.(string)] = convertYAMLToJSON(v)
		}
		return m
	case []interface{}:
		for i, v := range x {
			x[i] = convertYAMLToJSON(v)
		}
	}
	return i
}

// SetupSwagger mendaftarkan endpoint untuk API documentation
func SetupSwagger(app *fiber.App) {
	// Serve OpenAPI JSON spec
	app.Get("/docs/openapi.json", func(c *fiber.Ctx) error {
		c.Set("Content-Type", "application/json")

		if err := loadCompiledSpec(); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to load OpenAPI spec: " + err.Error(),
			})
		}

		return c.Send(compiledSpecJSON)
	})

	// Serve OpenAPI YAML spec
	app.Get("/docs/openapi.yaml", func(c *fiber.Ctx) error {
		c.Set("Content-Type", "text/yaml")

		if err := loadCompiledSpec(); err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString("Failed to load OpenAPI spec: " + err.Error())
		}

		return c.Send(compiledSpec)
	})

	// Serve Scalar UI
	app.Get("/docs", func(c *fiber.Ctx) error {
		c.Set("Content-Type", "text/html")
		return c.SendString(scalarHTML)
	})

	// Serve favicon (logo Unila)
	app.Get("/docs/favicon.png", func(c *fiber.Ctx) error {
		c.Set("Content-Type", "image/png")
		c.Set("Cache-Control", "public, max-age=31536000")
		return c.SendFile("./docs/logo-unila.png")
	})
}

// Scalar UI HTML template
var scalarHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MyUnila API Documentation</title>
    <link rel="icon" type="image/png" href="/docs/favicon.png">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; }
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .loading-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            transition: opacity 0.5s ease;
        }
        .loading-screen.hidden {
            opacity: 0;
            pointer-events: none;
        }
        .loading-logo {
            margin-bottom: 1.5rem;
            animation: pulse 2s ease-in-out infinite;
        }
        .loading-logo svg {
            width: 280px;
            height: auto;
        }
        .loading-subtext {
            color: #a0a0a0;
            font-size: 0.9rem;
            margin-top: 0.5rem;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(0.98); }
        }
    </style>
</head>
<body>
    <div class="loading-screen" id="loading">
        <div class="loading-logo">
            <svg width="280" height="80" viewBox="0 0 1360 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Poppins, sans-serif" font-weight="700" font-size="280" fill="#0B5EA8">myUnila</text>
            </svg>
        </div>
        <div class="loading-subtext">Loading API Documentation...</div>
    </div>

    <script id="api-reference" data-url="/docs/openapi.json"></script>
    <script>
        var configuration = {
            theme: 'purple',
            layout: 'modern',
            darkMode: true,
            defaultHttpClient: {
                targetKey: 'go',
                clientKey: 'native',
            },
            hiddenClients: [
                'c',
                'clojure',
                'csharp',
                'dart',
                'http',
                'java',
                'kotlin',
                'objc',
                'ocaml',
                'powershell',
                'r',
                'ruby',
                'shell',
                'swift',
                'unirest',
            ],
            searchHotKey: 'k',
            showSidebar: true,
            hideModels: false,
            hideDownloadButton: false,
            hideDarkModeToggle: false,
            withDefaultFonts: true,
            metaData: {
                title: 'MyUnila API',
                description: 'API untuk integrasi data antar sistem di Universitas Lampung',
                ogDescription: 'MyUnila API Documentation - Universitas Lampung',
                ogTitle: 'MyUnila API Docs',
            },
            customCss: ` + "`" + `
                /* Hide Scalar branding */
                .darklight-reference-promo { display: none !important; }
                .sidebar-search-container { margin-bottom: 12px; }

                /* Hide "Powered by Scalar" footer */
                .powered-by-scalar,
                .scalar-api-reference__footer,
                a[href*="scalar.com"] {
                    display: none !important;
                }

                /* Hide header toolbar (Developer Tools, Share, Generate SDKs, Configure) */
                .api-reference-toolbar,
                header[aria-label="Developer Tools"] {
                    display: none !important;
                }

                /* Light mode - default white theme */
                .light-mode {
                    --scalar-background-1: #ffffff !important;
                    --scalar-background-2: #f8f9fa !important;
                    --scalar-background-3: #e9ecef !important;
                    --scalar-color-accent: #2563eb !important;
                    --scalar-button-1: #16213e !important;
                    --scalar-button-1-hover: #0f3460 !important;
                    --scalar-sidebar-color-active: #2563eb !important;
                }

                /* Dark mode - custom dark blue theme */
                .dark-mode {
                    --scalar-background-1: #1a1a2e !important;
                    --scalar-background-2: #16213e !important;
                    --scalar-background-3: #0f3460 !important;
                    --scalar-color-accent: #60a5fa !important;
                    --scalar-button-1: #60a5fa !important;
                    --scalar-button-1-hover: #93c5fd !important;
                    --scalar-sidebar-color-active: #60a5fa !important;
                }

                /* Sidebar active menu styling */
                .sidebar-item.active,
                .sidebar-item[data-active="true"],
                .sidebar-item:focus {
                    background-color: rgba(96, 165, 250, 0.15) !important;
                }
                .light-mode .sidebar-item.active,
                .light-mode .sidebar-item[data-active="true"] {
                    background-color: rgba(37, 99, 235, 0.1) !important;
                }
                .sidebar-item.active > span,
                .sidebar-item[data-active="true"] > span {
                    color: inherit !important;
                }

                /* Better mobile responsiveness */
                @media (max-width: 768px) {
                    .scalar-app .layout-sidebar {
                        width: 100% !important;
                    }
                }

                /* Request/Response styling */
                .scalar-app pre {
                    border-radius: 8px;
                }

                /* Custom footer credit */
                .myunila-credit {
                    position: fixed;
                    bottom: 12px;
                    left: 60px;
                    font-size: 11px;
                    color: #888;
                    z-index: 100;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                .dark-mode .myunila-credit {
                    color: #666;
                }
            ` + "`" + `,
        }
        document.getElementById('api-reference').dataset.configuration = JSON.stringify(configuration)

        // Hide loading screen when Scalar is ready
        window.addEventListener('load', function() {
            setTimeout(function() {
                document.getElementById('loading').classList.add('hidden');
            }, 800);

            // Add custom credit and hide unwanted elements
            setTimeout(function() {
                // Hide "Powered by Scalar" links
                document.querySelectorAll('a').forEach(function(el) {
                    if (el.href && el.href.includes('scalar.com')) {
                        el.style.display = 'none';
                    }
                });

                // Add credit text with link
                var credit = document.createElement('div');
                credit.className = 'myunila-credit';
                credit.innerHTML = 'Developed by Tim <a href="https://my.unila.ac.id/tentang" target="_blank" style="color: inherit; text-decoration: underline;">myUnila</a>';
                document.body.appendChild(credit);
            }, 1500);
        });
    </script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>`

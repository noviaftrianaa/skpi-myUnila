package docs

import (
	"github.com/gofiber/fiber/v2"
)

// SetupSwagger mendaftarkan endpoint untuk API documentation
func SetupSwagger(app *fiber.App) {
	// Serve OpenAPI JSON spec
	app.Get("/docs/openapi.json", func(c *fiber.Ctx) error {
		c.Set("Content-Type", "application/json")
		return c.SendString(SwaggerInfo.ReadDoc())
	})

	// Serve Scalar UI
	app.Get("/docs", func(c *fiber.Ctx) error {
		c.Set("Content-Type", "text/html")
		return c.SendString(scalarHTML)
	})
}

// Scalar UI HTML template
var scalarHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MyUnila API Documentation</title>
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>">
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
            font-size: 4rem;
            margin-bottom: 1.5rem;
            animation: bounce 1s ease infinite;
        }
        .loading-text {
            color: #e94560;
            font-size: 1.5rem;
            font-weight: 600;
            letter-spacing: 0.1em;
        }
        .loading-subtext {
            color: #a0a0a0;
            font-size: 0.9rem;
            margin-top: 0.5rem;
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
    </style>
</head>
<body>
    <div class="loading-screen" id="loading">
        <div class="loading-logo">🚀</div>
        <div class="loading-text">MyUnila API</div>
        <div class="loading-subtext">Loading documentation...</div>
    </div>

    <script id="api-reference" data-url="/docs/openapi.json"></script>
    <script>
        var configuration = {
            theme: 'purple',
            layout: 'modern',
            darkMode: true,
            hiddenClients: ['unirest'],
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
                    --scalar-color-accent: #16213e !important;
                    --scalar-button-1: #16213e !important;
                    --scalar-button-1-hover: #0f3460 !important;
                }

                /* Dark mode - custom dark blue theme */
                .dark-mode {
                    --scalar-background-1: #1a1a2e !important;
                    --scalar-background-2: #16213e !important;
                    --scalar-background-3: #0f3460 !important;
                    --scalar-color-accent: #e94560 !important;
                    --scalar-button-1: #e94560 !important;
                    --scalar-button-1-hover: #ff6b6b !important;
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

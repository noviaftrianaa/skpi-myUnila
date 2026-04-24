package docs

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"
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

// loadCompiledSpec loads + compile OpenAPI spec (order-preserving) +
// filter `servers` sesuai APP_ENV.
func loadCompiledSpec() error {
	specOnce.Do(func() {
		spec, err := openapi.LoadSpec()
		if err != nil {
			log.Printf("Error: Failed to load OpenAPI YAML spec: %v", err)
			specErr = err
			return
		}

		// Filter servers + return filtered YAML (order preserved via yaml.Node).
		filteredYAML, err := filterServersInYAMLBytes(spec.GetYAML())
		if err != nil {
			log.Printf("Warning: filter servers failed, using unfiltered: %v", err)
			filteredYAML = spec.GetYAML()
		}
		compiledSpec = filteredYAML

		// Convert YAML bytes → JSON bytes preserving key order.
		compiledSpecJSON, specErr = yamlBytesToOrderedJSON(filteredYAML)
	})
	return specErr
}

// filterServersInYAMLBytes parse spec YAML (preserve order), iterate node
// `servers`, keep entry yang cocok dengan APP_ENV current, drop yang lain.
//
// Matching:
//   - APP_ENV=production → keep server yang url mengandung
//     "my.unila.ac.id" atau "gateway"
//   - other (staging/development/dev) → keep yang sebaliknya (internal)
func filterServersInYAMLBytes(in []byte) ([]byte, error) {
	var root yaml.Node
	if err := yaml.Unmarshal(in, &root); err != nil {
		return nil, err
	}
	mapping := rootMapping(&root)
	if mapping == nil {
		return in, nil
	}

	// find `servers` key
	serversIdx := -1
	for i := 0; i < len(mapping.Content); i += 2 {
		if mapping.Content[i].Value == "servers" {
			serversIdx = i + 1
			break
		}
	}
	if serversIdx < 0 {
		return in, nil
	}
	seq := mapping.Content[serversIdx]
	if seq.Kind != yaml.SequenceNode || len(seq.Content) < 2 {
		return in, nil
	}

	env := strings.ToLower(os.Getenv("APP_ENV"))
	isProd := env == "production" || env == "prod"

	kept := make([]*yaml.Node, 0, len(seq.Content))
	for _, srv := range seq.Content {
		if srv.Kind != yaml.MappingNode {
			continue
		}
		url := ""
		for i := 0; i < len(srv.Content); i += 2 {
			if srv.Content[i].Value == "url" {
				url = srv.Content[i+1].Value
				break
			}
		}
		isProdServer := strings.Contains(url, "my.unila.ac.id") ||
			strings.Contains(strings.ToLower(url), "gateway")
		if isProd == isProdServer {
			kept = append(kept, srv)
		}
	}
	if len(kept) > 0 {
		seq.Content = kept
	}

	return yaml.Marshal(&root)
}

// rootMapping returns top-level mapping node of a parsed document.
func rootMapping(root *yaml.Node) *yaml.Node {
	if root.Kind == yaml.DocumentNode && len(root.Content) > 0 {
		return root.Content[0]
	}
	if root.Kind == yaml.MappingNode {
		return root
	}
	return nil
}

// yamlBytesToOrderedJSON parses YAML bytes into yaml.Node then serializes to
// JSON preserving key order. Walk tree manually; for mapping, build JSON
// bytes directly (json.Marshal di Go sort key map alphabetis).
func yamlBytesToOrderedJSON(in []byte) ([]byte, error) {
	var root yaml.Node
	if err := yaml.Unmarshal(in, &root); err != nil {
		return nil, err
	}
	entry := &root
	if root.Kind == yaml.DocumentNode && len(root.Content) > 0 {
		entry = root.Content[0]
	}
	var buf strings.Builder
	if err := writeNodeJSON(entry, &buf); err != nil {
		return nil, err
	}
	return []byte(buf.String()), nil
}

func writeNodeJSON(n *yaml.Node, buf *strings.Builder) error {
	if n == nil {
		buf.WriteString("null")
		return nil
	}
	switch n.Kind {
	case yaml.ScalarNode:
		b, err := json.Marshal(scalarValue(n))
		if err != nil {
			return err
		}
		buf.Write(b)
	case yaml.SequenceNode:
		buf.WriteByte('[')
		for i, c := range n.Content {
			if i > 0 {
				buf.WriteByte(',')
			}
			if err := writeNodeJSON(c, buf); err != nil {
				return err
			}
		}
		buf.WriteByte(']')
	case yaml.MappingNode:
		buf.WriteByte('{')
		for i := 0; i < len(n.Content); i += 2 {
			if i > 0 {
				buf.WriteByte(',')
			}
			kb, err := json.Marshal(n.Content[i].Value)
			if err != nil {
				return err
			}
			buf.Write(kb)
			buf.WriteByte(':')
			if err := writeNodeJSON(n.Content[i+1], buf); err != nil {
				return err
			}
		}
		buf.WriteByte('}')
	case yaml.DocumentNode:
		if len(n.Content) > 0 {
			return writeNodeJSON(n.Content[0], buf)
		}
		buf.WriteString("null")
	case yaml.AliasNode:
		return writeNodeJSON(n.Alias, buf)
	}
	return nil
}

// scalarValue preserves scalar type (bool/int/float/null/string).
func scalarValue(n *yaml.Node) interface{} {
	switch n.Tag {
	case "!!bool":
		return n.Value == "true"
	case "!!int":
		var i int64
		_, _ = fmt.Sscanf(n.Value, "%d", &i)
		return i
	case "!!float":
		var f float64
		_, _ = fmt.Sscanf(n.Value, "%g", &f)
		return f
	case "!!null":
		return nil
	}
	return n.Value
}

// SetupSwagger mendaftarkan endpoint untuk API documentation
// Docs page adalah public — semua endpoint data tetap dilindungi JWTAuth per-group
// Spec files (openapi.json, openapi.yaml, favicon) juga public
func SetupSwagger(app *fiber.App) {
	// Serve Scalar UI (main docs page) - public (no auth required)
	// Endpoint data tetap dilindungi JWTAuth per-group
	app.Get("/docs", func(c *fiber.Ctx) error {
		c.Set("Content-Type", "text/html")
		return c.SendString(scalarHTML)
	})

	// middleware.KongAuth(),
	// Serve OpenAPI JSON spec - public (no auth required)
	// This allows Scalar UI to fetch spec without cookie/auth issues
	app.Get("/docs/openapi.json", func(c *fiber.Ctx) error {
		c.Set("Content-Type", "application/json")
		c.Set("Cache-Control", "public, max-age=60") // Cache for 1 minute

		if err := loadCompiledSpec(); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to load OpenAPI spec: " + err.Error(),
			})
		}

		return c.Send(compiledSpecJSON)
	})

	// Serve OpenAPI YAML spec - public (no auth required)
	app.Get("/docs/openapi.yaml", func(c *fiber.Ctx) error {
		c.Set("Content-Type", "text/yaml")
		c.Set("Cache-Control", "public, max-age=60")

		if err := loadCompiledSpec(); err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString("Failed to load OpenAPI spec: " + err.Error())
		}

		return c.Send(compiledSpec)
	})

	// Serve favicon (no auth required for static assets)
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
    <title>myUnila API Web Service Documentation</title>
    <link rel="icon" type="image/png" href="favicon.png">
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
        <div class="loading-subtext">Loading myUnila API Web Service Documentation...</div>
    </div>

    <script id="api-reference" data-url="docs/openapi.yaml"></script>
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
                title: 'myUnila API Web Service',
                description: 'API Web Service untuk platform myUnila - Universitas Lampung',
                ogDescription: 'myUnila API Web Service Documentation - Universitas Lampung',
                ogTitle: 'myUnila API Web Service Docs',
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

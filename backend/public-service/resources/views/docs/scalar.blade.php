<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Public Service API Documentation</title>
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
        <div class="loading-subtext">Loading Public Service API Documentation...</div>
    </div>

    <script id="api-reference" data-url="docs/openapi.json"></script>
    <script>
        var configuration = {
            theme: 'purple',
            layout: 'modern',
            darkMode: true,
            defaultHttpClient: {
                targetKey: 'php',
                clientKey: 'guzzle',
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
                title: 'Public Service API',
                description: 'API untuk data publik Universitas Lampung',
                ogDescription: 'Public Service API Documentation - Universitas Lampung',
                ogTitle: 'Public Service API Docs',
            },
            customCss: `
                /* Hide Scalar branding */
                .darklight-reference-promo { display: none !important; }
                .sidebar-search-container { margin-bottom: 12px; }

                /* Hide "Powered by Scalar" footer */
                .powered-by-scalar,
                .scalar-api-reference__footer,
                a[href*="scalar.com"] {
                    display: none !important;
                }

                /* Hide header toolbar */
                .api-reference-toolbar,
                header[aria-label="Developer Tools"] {
                    display: none !important;
                }

                /* Light mode */
                .light-mode {
                    --scalar-background-1: #ffffff !important;
                    --scalar-background-2: #f8f9fa !important;
                    --scalar-background-3: #e9ecef !important;
                    --scalar-color-accent: #2563eb !important;
                    --scalar-button-1: #16213e !important;
                    --scalar-button-1-hover: #0f3460 !important;
                    --scalar-sidebar-color-active: #2563eb !important;
                }

                /* Dark mode */
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
            `,
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
</html>

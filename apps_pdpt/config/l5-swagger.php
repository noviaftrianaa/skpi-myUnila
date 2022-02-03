<?php

return [
    'legacy' => true,
    'documentations' => [
        'sandbox' => [
            'api' => [
                'title' => 'ONE DATA Web Service Sandbox 0.1',
            ],
            'routes' => [
                'api' => 'api/sandbox/0.1',
                'docs' => 'sandbox',
                'oauth2_callback' => 'api/sandbox/oauth2-callback',
                'middleware' => [
                    'api' => ['openapi_sandbox'],
                    'asset' => [],
                    'docs' => [],
                    'oauth2_callback' => [],
                ],
            ],
            'paths' => [
                'docs' => storage_path('api-docs'),
                'views' => base_path('resources/views/api/template_docs'),
                'base' => env('L5_SWAGGER_BASE_PATH', null),
                'swagger_ui_assets_path' => env('L5_SWAGGER_UI_ASSETS_PATH', 'vendor/swagger-api/swagger-ui/dist/'),
                'use_absolute_path' => env('L5_SWAGGER_USE_ABSOLUTE_PATH', true),
                'docs_json' => 'api-docs-sandbox.json',
                'format_to_use_for_docs' => env('L5_FORMAT_TO_USE_FOR_DOCS', 'json'),
                'annotations' => [
                    base_path('app') . '/Http/Controllers/SandboxController.php',
                    base_path('app/Anotations')
                ],
            ],
            'generate_always' => false,
            'validator_url' => null,
            'persist_authorization' => true,
            'constants' => [
                'L5_SWAGGER_CONST_HOST_SANDBOX' => env('L5_SWAGGER_CONST_HOST_SANDBOX'),
            ]
        ],
        'live' => [
            'api' => [
                'title' => 'ONEDATA Web Service Live 0.1',
            ],
            'routes' => [
                'api' => 'api/live/0.1',
                'docs' => 'live',
                'oauth2_callback' => 'api/live/oauth2-callback',
                'middleware' => [
                    'api' => ['openapi_live'],
                    'asset' => [],
                    'docs' => [],
                    'oauth2_callback' => [],
                ],
            ],
            'paths' => [
                'docs' => storage_path('api-docs'),
                'views' => base_path('resources/views/api/template_docs'),
                'base' => env('L5_SWAGGER_BASE_PATH', null),
                'swagger_ui_assets_path' => env('L5_SWAGGER_UI_ASSETS_PATH', 'vendor/swagger-api/swagger-ui/dist/'),
                'use_absolute_path' => env('L5_SWAGGER_USE_ABSOLUTE_PATH', true),
                'docs_json' => 'api-docs-live.json',
                'format_to_use_for_docs' => env('L5_FORMAT_TO_USE_FOR_DOCS', 'json'),
                'annotations' => [
                    base_path('app') . '/Http/Controllers/LiveController.php',
                    base_path('app/Anotations')
                ],
            ],
            'generate_always' => false,
            'validator_url' => null,
            'persist_authorization' => true,
            'constants' => [
                'L5_SWAGGER_CONST_HOST_LIVE' => env('L5_SWAGGER_CONST_HOST_LIVE', 'http://onedata.unila.ac.id'),
            ]
        ],
    ]
];

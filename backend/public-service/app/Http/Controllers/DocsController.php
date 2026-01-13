<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DocsController extends Controller
{
    /**
     * Serve Scalar UI documentation page
     */
    public function index()
    {
        return view('docs.scalar');
    }

    /**
     * Serve OpenAPI JSON spec
     */
    public function openApiJson()
    {
        $path = storage_path('api-docs/api-docs.json');

        if (!file_exists($path)) {
            // Try to generate if not exists
            \Artisan::call('l5-swagger:generate');

            if (!file_exists($path)) {
                return response()->json([
                    'error' => 'OpenAPI spec not found. Run: php artisan l5-swagger:generate'
                ], 404);
            }
        }

        return response()->file($path, [
            'Content-Type' => 'application/json',
            'Cache-Control' => 'no-cache'
        ]);
    }

    /**
     * Serve favicon
     */
    public function favicon()
    {
        $path = public_path('images/logo-unila.png');

        if (!file_exists($path)) {
            abort(404);
        }

        return response()->file($path, [
            'Content-Type' => 'image/png',
            'Cache-Control' => 'public, max-age=31536000'
        ]);
    }
}

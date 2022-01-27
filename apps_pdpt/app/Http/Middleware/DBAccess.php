<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class DBAccess
{
    public function handle(Request $request, Closure $next)
    {
        $url = $request->url();
        $urls = explode('/', $url);

        $preventAccess = [
            'create',
            'add',
            'tambah',
            'hapus',
            'update',
            'delete',
            'edit'
        ];

        $checkServerIs = false;
        $checkUrlRequest = [];

        if (in_array('live', $urls)) {
            $checkServerIs = true;
        }

        foreach ($preventAccess as $value) {
            if (in_array($value, $urls)) {
                $checkUrlRequest[] = true;
            } else {
                foreach ($urls as $url) {
                    if (strpos($url, $value)) {
                        $checkUrlRequest[] = true;
                    } else {
                        $checkUrlRequest[] = false;
                    }
                }
            }
        }

        if ($checkServerIs && in_array(true, $checkUrlRequest)) {
            return WrapResponse([], 'tidak dapat memproses masukkan, akses tidak diizinkan', FALSE);
        }

        return $next($request);
    }
}

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
            'edit',
            'ubah'
        ];

        $checkServerIs = FALSE;
        $checkUrlRequest = [];

        if (in_array('live', $urls)) {
            $checkServerIs = TRUE;
        }

        foreach ($preventAccess as $value) {
            if (in_array($value, $urls)) {
                $checkUrlRequest[] = TRUE;
            } else {
                foreach ($urls as $url) {
                    if (strpos($url, $value) > -1) {
                        $checkUrlRequest[] = TRUE;
                    } else {
                        $checkUrlRequest[] = FALSE;
                    }
                }
            }
        }

        if ($checkServerIs && in_array(TRUE, $checkUrlRequest)) {
            return WrapResponse([], 'tidak dapat memproses masukkan, akses tidak diizinkan', FALSE);
        }

        return $next($request);
    }
}

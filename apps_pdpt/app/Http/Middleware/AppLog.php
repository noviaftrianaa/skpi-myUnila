<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AppLog
{
    public function handle(Request $request, Closure $next)
    {
        app_request_id(uniqid());

        app_log("User Request " . $request->method() . " /" . $request->path() . " " . $request->getClientIp() . " " . ((json_encode($request->input()))));

        $response = $next($request);

        if (strpos($response->headers->get('CONTENT_TYPE', '', true), 'json') !== false) {

            $content = json_decode($response->getContent(), true);
            $content = (isset($content['status']) && $content['status'] ? 'Success ' : 'Failed ') . base64_encode(gzdeflate($response->getContent()));
        } else{
            $content = $response->getStatusCode();
        }

        app_log("User Response $content");

        return $response;
    }
}

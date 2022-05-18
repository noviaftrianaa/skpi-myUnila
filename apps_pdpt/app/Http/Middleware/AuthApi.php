<?php

namespace App\Http\Middleware;

use Closure;
use Exception;

class AuthApi
{
    public function handle($request, Closure $next)
    {
        try {
            if (!$token = $this->parseToken($request)) {
                return WrapResponse(['data' => ['errors' => 'Token kosong!']], 'Otorisasi gagal!', FALSE);
            }
            $id_pengguna = $this->getIdPengguna($token);
            $decodedToken = $this->decodedToken($token);

            // simpan token ke database
            // .............
            // .............
            // .............
            // .............

        } catch (Exception $e) {
            return WrapResponse(['data' => ['errors' => $e->getMessage()]], 'Otorisasi gagal!', FALSE);
        }
        return $next($request);
    }

    public function parseToken($request, $method = 'bearer', $header = 'authorization', $query = 'token')
    {
        if (!$token = $this->parseAuthHeader($request, $header, $method)) {
            if (!$token = $request->query($query, false)) {
                throw new Exception('Token tidak ditemukan', 400);
            }
        }
        return $token;
    }

    protected function parseAuthHeader($request, $header = 'authorization', $method = 'bearer')
    {
        $header = $request->headers->get($header);
        if (!starts_with(strtolower($header), $method)) {
            return false;
        }
        return trim(str_ireplace($method, '', $header));
    }

    function getIdPengguna($token)
    {
        list($header, $payload, $signature) = explode(".", $token);
        $payload_decoded = json_decode(base64_decode($payload));
        return $payload_decoded->sub;
    }

    function decodedToken($jwt)
    {
        $secret = env('JWT_SECRET', 'secret');
        $tokenParts = explode('.', $jwt);
        $header = base64_decode($tokenParts[0]);
        $payload = base64_decode($tokenParts[1]);
        $signature_provided = $tokenParts[2];
        $payload_decoded = json_decode($payload);

        $requred_claims = ['sub', 'role', 'iss', 'iat', 'exp'];
        foreach ($requred_claims as $req) {
            if (!property_exists($payload_decoded, $req)) {
                throw new Exception("Token tidak valid", 1);
            }
        }

        $expiration = $payload_decoded->exp;
        $is_token_expired = ($expiration - time()) < 0;
        if ($is_token_expired) {
            throw new Exception("Token kadarluwasa", 1);
        }

        $base64_url_header = base64url_encode($header);
        $base64_url_payload = base64url_encode($payload);
        $signature = hash_hmac('SHA256', $base64_url_header . "." . $base64_url_payload, $secret, true);
        $base64_url_signature = base64url_encode($signature);
        $is_signature_valid = ($base64_url_signature === $signature_provided);

        if (!$is_signature_valid) {
            throw new Exception("Tanda tangan token tidak sah", 1);
        }

        return $payload_decoded;
    }
}

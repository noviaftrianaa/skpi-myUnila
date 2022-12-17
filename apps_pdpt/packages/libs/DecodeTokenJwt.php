<?php
if (!function_exists('decode_token_jwt')) {
    function decode_token_jwt($jwt = null)
    {
        if (empty($jwt)) {
            $token_bearer = str_replace("Bearer ", "", request()->headers->get('authorization'));
        } else {
            $token_bearer = $jwt;
        }

        if (empty($token_bearer)) {
            return WrapResponse([
                'error' => ['token_bearer' => 'Harus Diisi'],
                'data' => null,
            ], 'Gagal Otentikasi', false);
        }

        $secret = env('JWT_SECRET', '00501aa4b3fb4d61a440a707fb8b7443');
        $tokenParts = explode('.', $token_bearer);

        if (empty($tokenParts[0]) || empty($tokenParts[1]) || empty($tokenParts[2])) {
            return WrapResponse([
                'data' => [
                    'token_status' => 'Tidak Valid',
                    'token_dibuat' => null,
                    'token_kadarluwasa' => null,
                    'token_bearer' => $token_bearer,
                ]
            ], 'Gagal Otentikasi', false);
        }

        $header = base64_decode($tokenParts[0]);
        $payload = base64_decode($tokenParts[1]);
        $signature_provided = $tokenParts[2];
        $payload_decoded = json_decode($payload);

        $requred_claims = [
            'id_log_jwt',
            'id_aplikasi',
            'url_aplikasi',
            'id_pengguna',
            'peran_pengguna',
            'token_dibuat',
            'token_kadarluwasa',
            'asal_domain',
            'ip_address',
        ];

        foreach ($requred_claims as $req) {
            if (!property_exists($payload_decoded, $req)) {
                return WrapResponse([
                    'data' => [
                        'token_status' => 'Tidak Valid',
                        'token_dibuat' => null,
                        'token_kadarluwasa' => null,
                        'token_bearer' => $token_bearer,
                    ]
                ], 'Gagal Otentikasi', false);
            }
        }

        $expiration = $payload_decoded->token_kadarluwasa;
        $is_token_expired = ($expiration - time()) < 0;
        if ($is_token_expired) {
            return WrapResponse([
                'data' => [
                    'token_status' => 'Kadarluwasa',
                    'token_dibuat' => null,
                    'token_kadarluwasa' => null,
                    'token_bearer' => $token_bearer,
                ]
            ], 'Gagal Otentikasi', false);
        }

        $base64_url_header = base64url_encode($header);
        $base64_url_payload = base64url_encode($payload);
        $signature = hash_hmac('SHA256', $base64_url_header . "." . $base64_url_payload, $secret, true);
        $base64_url_signature = base64url_encode($signature);
        $is_signature_valid = ($base64_url_signature === $signature_provided);

        if (!$is_signature_valid) {
            return WrapResponse([
                'data' => [
                    'token_status' => 'Tidak Terdaftar',
                    'token_dibuat' => null,
                    'token_kadarluwasa' => null,
                    'token_bearer' => $token_bearer,
                ]
            ], 'Gagal Otentikasi', false);
        }

        return $payload_decoded;
    }
}

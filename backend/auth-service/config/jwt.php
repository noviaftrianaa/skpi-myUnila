<?php

return [

    /*
    |--------------------------------------------------------------------------
    | JWT Authentication Secret
    |--------------------------------------------------------------------------
    |
    | This is the secret key used to sign the JWT tokens. Make sure this is
    | set to a random string in production.
    |
    */

    'secret' => env('JWT_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | JWT time to live
    |--------------------------------------------------------------------------
    |
    | Specify the length of time (in minutes) that the token will be valid for.
    | Defaults to 15 minutes for access tokens.
    |
    */

    'ttl' => env('JWT_ACCESS_TOKEN_TTL', 60),

    /*
    |--------------------------------------------------------------------------
    | Refresh time to live
    |--------------------------------------------------------------------------
    |
    | Specify the length of time (in minutes) that the token can be refreshed.
    | Defaults to 7 days (10080 minutes) for refresh tokens.
    |
    */

    'refresh_ttl' => env('JWT_REFRESH_TOKEN_TTL', 10080),

    /*
    |--------------------------------------------------------------------------
    | MFA Temporary Token TTL
    |--------------------------------------------------------------------------
    |
    | Time to live for temporary tokens issued before MFA verification.
    | Defaults to 5 minutes.
    |
    */

    'mfa_temp_ttl' => env('JWT_MFA_TEMP_TTL', 5),

    /*
    |--------------------------------------------------------------------------
    | JWT Hashing Algorithm
    |--------------------------------------------------------------------------
    |
    | Specify the hashing algorithm that will be used to sign the token.
    |
    */

    'algo' => env('JWT_ALGO', 'HS256'),

    /*
    |--------------------------------------------------------------------------
    | Required Claims
    |--------------------------------------------------------------------------
    |
    | Specify the required claims that must be present in any token.
    |
    */

    'required_claims' => [
        'iss',
        'iat',
        'exp',
        'nbf',
        'sub',
        'jti',
    ],

    /*
    |--------------------------------------------------------------------------
    | Persistent Claims
    |--------------------------------------------------------------------------
    |
    | Specify the claim keys to be persisted when refreshing a token.
    |
    */

    'persistent_claims' => [
        // Add claims that should persist through refresh
    ],

    /*
    |--------------------------------------------------------------------------
    | Lock Subject
    |--------------------------------------------------------------------------
    |
    | This will determine whether the `prv` claim is automatically added to
    | the token. The purpose of this is to ensure that if the user model
    | implementation changes, tokens will be invalidated automatically.
    |
    */

    'lock_subject' => true,

    /*
    |--------------------------------------------------------------------------
    | Leeway
    |--------------------------------------------------------------------------
    |
    | This property gives the JWT validation some "leeway" when checking time-
    | based claims (nbf, iat, exp). A few seconds of clock skew can cause
    | validation to fail when it shouldn't. Leeway in seconds.
    |
    */

    'leeway' => env('JWT_LEEWAY', 0),

    /*
    |--------------------------------------------------------------------------
    | Blacklist Enabled
    |--------------------------------------------------------------------------
    |
    | In order to invalidate tokens, you must have the blacklist enabled.
    | If you do not want or need this functionality, set this to false.
    |
    */

    'blacklist_enabled' => env('JWT_BLACKLIST_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Blacklist Grace Period
    |--------------------------------------------------------------------------
    |
    | When multiple concurrent requests are made with the same JWT, it is
    | possible that some of them fail. The grace period is in seconds.
    |
    */

    'blacklist_grace_period' => env('JWT_BLACKLIST_GRACE_PERIOD', 0),

    /*
    |--------------------------------------------------------------------------
    | Show blacklisted token exception
    |--------------------------------------------------------------------------
    |
    | Specify whether to throw an exception or return null on blacklisted token.
    |
    */

    'show_black_list_exception' => true,

    /*
    |--------------------------------------------------------------------------
    | Cookies encryption
    |--------------------------------------------------------------------------
    |
    | By default Laravel encrypts cookies for security. If you want to decrypt
    | cookies, set this to false.
    |
    */

    'decrypt_cookies' => false,

    /*
    |--------------------------------------------------------------------------
    | Token Header
    |--------------------------------------------------------------------------
    |
    | The header name used to send the token in the request.
    |
    */

    'header' => env('JWT_HEADER', 'Authorization'),

    /*
    |--------------------------------------------------------------------------
    | Token Query String
    |--------------------------------------------------------------------------
    |
    | Some frameworks such as Lumen may only accept query string tokens.
    |
    */

    'query_string_key' => env('JWT_QUERY_STRING_KEY', 'token'),

];

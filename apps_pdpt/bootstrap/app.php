<?php
ini_set('display_errors', FALSE);
ini_set('error_reporting', 0);
ini_set('max_execution_time', 0);

$app_log_file = '';
$app_log_id   = '';
if (!function_exists('app_log')) {
    function app_log($message = '')
    {
        if (!$GLOBALS['app_log_id']) {
            $GLOBALS['app_log_id'] = uniqid();
        }

        if (!$GLOBALS['app_log_file']) {
            if (!file_exists(storage_path('/logs/user'))) {
                mkdir(storage_path() . '/logs/user');
            }

            $GLOBALS['app_log_file'] = storage_path() . '/logs/user/' . date('Y-m-d') . '.log';
        }

        if (!is_string($message)) {
            $message = json_encode($message);
        }

        $message = str_replace(array("\r\n", "\r", "\n"), array("\n", "\n", "\r\n\t"), $message);

        $microtime = explode(' ', microtime());
        file_put_contents(
            $GLOBALS['app_log_file'],
            date('H:i:s') . substr($microtime[0], 1) . " $GLOBALS[app_log_id].$GLOBALS[app_request_id] $message\r\n",
            FILE_APPEND
        );
    }
}

$app_request_id = '';
if (!function_exists('app_id')) {
    function app_request_id($new_id = '')
    {
        if ($new_id) {
            $GLOBALS['app_request_id'] = $new_id;
        }

        return $GLOBALS['app_request_id'];
    }
}

/*
|--------------------------------------------------------------------------
| Create The Application
|--------------------------------------------------------------------------
|
| The first thing we will do is create a new Laravel application instance
| which serves as the "glue" for all the components of Laravel, and is
| the IoC container for the system binding all of the various parts.
|
*/

$app = new Illuminate\Foundation\Application(
    $_ENV['APP_BASE_PATH'] ?? dirname(__DIR__)
);

/*
|--------------------------------------------------------------------------
| Bind Important Interfaces
|--------------------------------------------------------------------------
|
| Next, we need to bind some important interfaces into the container so
| we will be able to resolve them when needed. The kernels serve the
| incoming requests to this application from both the web and CLI.
|
*/

$app->singleton(
    Illuminate\Contracts\Http\Kernel::class,
    App\Http\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Console\Kernel::class,
    App\Console\Kernel::class
);

$app->singleton(
    Illuminate\Contracts\Debug\ExceptionHandler::class,
    App\Exceptions\Handler::class
);

/*
|--------------------------------------------------------------------------
| Return The Application
|--------------------------------------------------------------------------
|
| This script returns the application instance. The instance is given to
| the calling script so we can separate the building of the instances
| from the actual running of the application and sending responses.
|
*/

return $app;

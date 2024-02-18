<?php
if (!function_exists('buttonBack')) {
    function buttonBack($route)
    {
        $url = $route;
        return view('_partials.__partial.button.button_back', [
            'url' => $url,
        ]);
    }
}

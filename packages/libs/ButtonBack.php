<?php
if( !function_exists('buttonBack') ){
    function buttonBack($route){
        $url = $route;
        return view('__partial.button.button_back', [
            'url'       => $url
        ]);
    }
}
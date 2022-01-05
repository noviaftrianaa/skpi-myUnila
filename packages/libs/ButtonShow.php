<?php
if( !function_exists('buttonShow') ){
    function buttonShow($route, $wild_card, $title, $params = '', $attr = false){
        if(check_akses($route)) {
            $url = route($route,$wild_card);
            $attr = (array)$attr;
            $all_attr = false;
            foreach ($attr as $key => $val) $all_attr .= " {$key}='{$val}' ";

            return view('__partial.button.button_detail', [
                'url'       => $url.$params,
                'all_attr'  => $all_attr,
                'title'     => $title,
                'icon'      => config('view.button_show.icon'),
            ]);
        }
    }
}

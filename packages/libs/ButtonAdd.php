<?php
if( !function_exists('buttonAdd') ){
    function buttonAdd($route, $label, $attr = false){
        if(check_akses($route)) {
            $url = route($route);
            $attr = (array)$attr;
            $all_attr = false;
            foreach ($attr as $key => $val) $all_attr .= " {$key}='{$val}' ";

            return view('__partial.button.add', [
                'url'       => $url,
                'all_attr'  => $all_attr,
                'label'     => $label
            ]);
        }
    }
}

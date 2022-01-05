<?php
if( !function_exists('buttonAddMultipleId') ){
    function buttonAddMultipleId($route, $label, $wild_card=array(), $attr = false){
        if(check_akses($route)) {
            if(count($wild_card)==0) {
                $url = route($route);
            } elseif(count($wild_card)<=1) {
                $url = route($route,$wild_card);
            } else {
                $url = route($route,($wild_card));
            }
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
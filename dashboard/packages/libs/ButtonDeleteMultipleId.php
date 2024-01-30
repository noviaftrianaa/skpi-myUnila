<?php

if( !function_exists('buttonDeleteMultipleId') ){
    function buttonDeleteMultipleId($route, $title, $wild_card=array(), $attr = false){
        if(check_akses($route)){
            if(count($wild_card)<=1) {
                $url = route($route,$wild_card);
            } else {
                $url = route($route,($wild_card));
            }
            $attr = (array)$attr;
            $all_attr = false;
            foreach ($attr as $key => $val) $all_attr .= " {$key}='{$val}' ";

            $label = isset($attr['label']) ? $attr['label'] : @$attr[0];

            return view('__partial.button.button_delete', [
                'url' => $url,
                'all_attr' => $all_attr,
                'label' => $label,
                'title' => $title
            ]);
        }
    }
}
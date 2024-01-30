<?php

if( !function_exists('buttonDelete') ){
    function buttonDelete($route, $wild_card, $title, $attr = false){
        if(check_akses($route)){
            $url = route($route,$wild_card);
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
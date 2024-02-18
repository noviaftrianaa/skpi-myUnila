<?php
if (!function_exists('buttonEdit')) {
    function buttonEdit($route, $wild_card, $title, $params = '', $attr = false)
    {
        if (check_akses($route)) {
            $url = route($route, $wild_card);
            $attr = (array) $attr;
            $all_attr = false;
            foreach ($attr as $key => $val) {
                $all_attr .= " {$key}='{$val}' ";
            }

            return view('_partials.__partial.button.button_edit', [
                'url' => $url . $params,
                'all_attr' => $all_attr,
                'title' => $title,
                'icon' => config('view.button_edit.icon'),
            ]);
        }
    }
}

<?php

if( !function_exists('FormInputStatic') ){
    function FormInputStatic($label, $data){
        return view('__partial.form.form_text_static', [
            'label'     => $label,
            'data'      => $data
        ]);
    }
}

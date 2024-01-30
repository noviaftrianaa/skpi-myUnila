<?php
if( !function_exists('FormInputTextarea') ){
    function FormInputTextarea($fieldname, $label, $required=false, $data = null, $attr = null){
        return view('__partial.form.form_input_textarea', [
            'fieldname' => $fieldname,
            'label'     => $label,
            'required'  => $required,
            'data'      => $data,
            'attr'      => $attr
        ]);
    }
}
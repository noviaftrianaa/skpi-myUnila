<?php
if( !function_exists('FormInputTextareaCKeditor') ){
    function FormInputTextareaCKeditor($fieldname, $label, $required=false, $data = null, $attr = null){
        return view('__partial.form.form_input_textarea_ckeditor', [
            'fieldname' => $fieldname,
            'label'     => $label,
            'required'  => $required,
            'data'      => $data,
            'attr'      => $attr
        ]);
    }
}
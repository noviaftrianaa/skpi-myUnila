<?php

if( !function_exists('FormInputText') ){
    function FormInputText($fieldname, $label, $type, $data = null, $etc=[]){
        return view('__partial.form.form_input_text', [
            'fieldname' => $fieldname,
            'label'     => $label,
            'type'      => $type,
            'required'  => isset($etc['required'])?true:false,
            'readonly'  => isset($etc['readonly'])?true:false,
            'data'      => $data,
            'attr'      => isset($etc['attributes']) ?$etc['attributes']:null,
            'placeholder'=> isset($etc['placeholder']) ?$etc['placeholder']:$label,
            'prop'      => isset($etc['properties']) ?$etc['properties']:null,
            'class'     => isset($etc['class']) ?$etc['class']:null,
            'id'        => isset($etc['id']) ?$etc['id']:null,
            'column'    => isset($etc['column']) ?$etc['column']:null,
            'helper'    => isset($etc['helper']) ?$etc['helper']:null,
        ]);
    }
}

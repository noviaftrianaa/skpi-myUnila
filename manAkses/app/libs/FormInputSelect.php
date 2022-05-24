<?php

if( !function_exists('FormInputSelect') ){

    function FormInputSelect($fieldname, $label, $list, $required=false, $with_default_select=true, $data=null, $attr='', $etc=[]){

        return view('__partial.form.form_input_select', [

            'fieldname' => $fieldname,

            'label'     => $label,

            'required'  => $required,

            'list'      => $list,

            'data'      => $data,

            'default'   => $with_default_select,

            'attr'      => $attr,

            'helper'    => isset($etc['helper']) ?$etc['helper']:null,

            'column'    => isset($etc['column']) ?$etc['column']:null,

        ]);

    }

}


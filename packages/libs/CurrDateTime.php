<?php

if( !function_exists( 'currDateTime' ) ){
  function currDateTime()
  {
      return date('Y-m-d H:i:s');
  }
}
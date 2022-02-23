<?php

namespace App\Traits;

trait ApiTrait
{
    public function setRequest($request)
    {
        $this->request = $request;
    }

    public function sanitizeRequest()
    {
        if ($data = $this->request->all()) {
            $reformat = [];
            foreach ($data as $key => $value) {
                $data_r = str_replace(array("\r\n", "\r", "\n"), '', $value);
                if (ini_get('magic_quotes_gpc')) $data_r = stripslashes($data_r);
                $reformat[$key] = $data_r;
            }

            $this->request->merge($reformat);
        }
    }
}

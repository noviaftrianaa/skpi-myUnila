{!! FormInputStatic('Nama Grup Sync',$data_induk->enpoint) !!}
{!! FormInputStatic('Nama Tabel Sync',$data->tabel_app->tabel_alias.' ('.$data->tabel_app->skema_tbl.'.'.$data->tabel_app->nm_tbl.') <strong>PK:</strong> '.$data->tabel_app->kode_primary) !!}
{!! FormInputText('url','URL','url',$data->url,['required'=>true]) !!}
{!! FormInputText('method','Method','text',$data->method,['required'=>true]) !!}
{!! FormInputText('enpoint','End Point','text',$data->enpoint,['required'=>true]) !!}

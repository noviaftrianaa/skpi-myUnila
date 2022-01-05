<?php

if( !function_exists('GetProdiIndividu')) {
    function GetProdiIndividu()
    {
        return \DB::table('pdrd.sms AS tprodi')
            ->join('ref.jenjang_pendidikan AS tjenj','tjenj.id_jenj_didik','=','tprodi.id_jenj_didik')
            ->join('pdrd.satuan_pendidikan AS tsp','tsp.id_sp','=','tprodi.id_sp')
            ->join('pdrd.sms AS tfak','tfak.id_sms','=','tprodi.id_induk_sms')
            ->select('tprodi.id_sms','tprodi.id_induk_sms','tprodi.nm_lemb AS fakultas','tprodi.id_sp',\DB::RAW("CONCAT(tprodi.nm_lemb,' (',tjenj.nm_jenj_didik,')') AS prodi"),'tsp.nm_lemb AS asal_pt')
            ->where('tprodi.soft_delete',0)->where('tprodi.id_sms',session()->get('login.peran.id_organisasi'))
            ->first();
    }
}

<?php
if( !function_exists('MenuRole')){
    /**
     *
     * Digunakan untuk memanggil menu role
     *
     * @return  string
     */
    function MenuRole() {
        if(\Session::has('login.menu')) {
            \Session::forget('login.menu');
        }
        $data = \DB::SELECT("
            SELECT
                menu.nm_menu,
                menu.nm_file,
                menu.icon,
                mrole.a_boleh_insert,
                mrole.a_boleh_show,
                mrole.a_boleh_delete,
                mrole.a_boleh_update,
                mrole.a_boleh_sanggah
            FROM
                man_akses.menu
                JOIN man_akses.menu_role AS mrole ON mrole.id_menu=menu.id_menu
            WHERE
                mrole.id_peran='".\Session::get('login.role')->id_peran."'
                AND menu.id_aplikasi='".env('APP_ID')."'
                AND menu.id_group_menu IS NULL
                AND menu.a_aktif=1
                AND mrole.soft_delete=0
            ORDER BY
                menu.level_menu, menu.urutan_menu ASC
        ");
        \Session::put('login.menu', $data);
    }
}
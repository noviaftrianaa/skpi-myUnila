<?php
if (!function_exists('auto_breadcrumb')) {
    function auto_breadcrumb()
    {
        if (!isset($breadcrumb)) {

            $trans = [
                '-' => ' ',
                '_' => ' ',
                '/' => 'atau',
                'create' => 'Tambah',
                'show' => 'Detail'
            ];

            $array_list = ['fasilitas','kamar','anggota','rute','stok','bidang','edit','ubah','akun','create','baca','detail','lihat','tambah','rincian','daftar','progres','konfigurasi','ruang','pengawas','lokasi','bilik','kandidat','sandi','dashboard'];

            $current_route = Route::getCurrentRoute();

            if( method_exists($current_route, 'getName') ){
                $page = str_replace('.index', '', $current_route->getName());

                foreach (explode('.', $page) as $num => $link) {
                    if (match($array_list,$link)) {
                        $url = '';
                    } else {
                        $route =implode('.',  array_chunk( explode('.', $page), ($num+1) ) [0]);

                        if(Route::has($route))
                            $url = route($route);
                        elseif(Route::has($route . '.index'))
                            $url = route($route . '.index');
                        else
                            $url = '';
                    }

                    $breadcrumb[ucwords(strtr($link, $trans))] = $url;
                }

            }

        }
        if(@$backLink)
        {
            $url = explode('/', rtrim($backLink, '/'));
            $n = count($url)-1;
            if( strlen($url[$n]) < 20 )
                $newBreadcrumb = $url[$n];
            else
                $newBreadcrumb = $url[$n-1];

            $newBreadcrumb = ucwords(strtr($newBreadcrumb, $trans));
            $breadcrumb = insertArrayBefore($pageTitle, $breadcrumb, $newBreadcrumb, $backLink);
        }

        $breadcrumbs_text = '';
        foreach($breadcrumb as $page_name => $url)
        {
            if($page_name!=='Index') {
                $breadcrumbs_text .= '<li class="breadcrumb-item">';
                if($url == last($breadcrumb))
                {
                    $breadcrumbs_text .= empty($page_name) ? $url : $page_name;
                }
                else{
                    if($url=='')
                        $breadcrumbs_text .= $page_name;
                    else
                        $breadcrumbs_text .= '<a href="'.$url.'">'.$page_name.'</a>';
                }

                $breadcrumbs_text .= '</li>';
            }
        }
        return $breadcrumbs_text;
    }

    function match($needles, $haystack)
    {
        foreach($needles as $needle){
            if (strpos($haystack, $needle) !== false) {
                return true;
            }
        }
        return false;
    }
}

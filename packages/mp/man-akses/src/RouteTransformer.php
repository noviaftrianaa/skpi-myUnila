<?php
/**
 * Created by PhpStorm.
 * User: Hendra
 * Date: 6/8/2017
 * Time: 12:03 PM
 */

namespace MP\ManAkses;


class RouteTransformer
{
    public function suffix($route)
    {
        if ($this->hasSuffix($route)) {
            $originalSuffix = $this->toCollection($route)->last();
            if(explode('_',$originalSuffix)) {
                $plotSuffix = explode('_',$originalSuffix);
                $originalSuffix = $plotSuffix[0];
            }
            return $this->validSuffix($originalSuffix);
        }
    }

    public function validSuffix($suffix)
    {
        $dictionary = collect([
            'insert'  => collect([
                'insert', 'add', 'tambah', 'create', 'simpan', 'store'
            ]),
            'update'  => collect([
                'update', 'edit', 'ubah', 'ubah_profil', 'ubah_sandi'
            ]),
            'delete'  => collect([
                'soft_delete', 'delete', 'hapus', 'destroy'
            ]),
            'show' => collect([
                'show', 'lihat', 'detail'
            ]),
            'sanggah' => collect([
                'sanggah','valid','validasi','ajuan','tolak'
            ]),
        ]);

        foreach ($dictionary as $validSuffix => $suffixCollection) {
            if ($suffixCollection->search($suffix) !== false) {
                return $validSuffix;
            }
        }

        abort(501, 'Valid suffix not found for suffix "' . $suffix . '".');
    }

    public function hasSuffix($route)
    {
        $dictionary = collect([
            'insert', 'add', 'tambah', 'create', 'simpan', 'store', 'update', 'edit', 'ubah', 'soft_delete', 'delete', 'hapus', 'destroy', 'show', 'lihat', 'ubah_profil', 'ubah_sandi', 'detail','sanggah','valid','validasi','ajuan','tolak'
        ]);

        $suffix = $this->toCollection($route)->last();
        if(explode('_',$suffix)) {
            $plotSuffix = explode('_',$suffix);
            $suffix = $plotSuffix[0];
        }

        if ($this->isIgnoredSuffix($suffix)) {
            return false;
        }

        return $dictionary->search($suffix) !== false;
    }

    public function isIgnoredSuffix($suffix)
    {
        $ignored = collect(['index','print','export','import','data','ajax','table','tabel']);
        return $ignored->search($suffix);
    }

    public function hasIgnoredSuffix($route)
    {
        $suffix = $this->toCollection($route)->last();
        return $this->isIgnoredSuffix($suffix);
    }

    public function removeSuffix($route)
    {

    }

    public function withoutSuffix($route)
    {
        if ($this->hasSuffix($route)) {
            $route       = $this->toCollection($route);
            $suffixIndex = $route->search($route->last());

            return $route->forget($suffixIndex)->implode('.');
        }

        return $route;
    }

    public function toCollection($route)
    {
        return collect(explode('.', $route));
    }
}
@extends('template.default.app')
@include('__partial.datetime')
@include('__partial.date')
@include('__partial.ckeditor')
@include('__partial.select2')

@section('content')
    <div class="row">
        <section class="col-lg-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fa fa-plus"></i> {!! $judul_halaman !!}</h3>
                </div>
                <?php
                if(isset($param_form)) {
                    if(!is_array($param_form)) {
                        $url = route($route,Crypt::encrypt($param_form));
                        $backlink = route($backLink,Crypt::encrypt($param_form));
                    } else {
                        $new_param = [];
                        $new_route = [];
                        foreach($param_form AS $list_param) {
                            $new_route[] = Crypt::encrypt($list_param);
                            $new_param[] = Crypt::encrypt($list_param);
                        }
                        $url = route($route,$new_route);
                        $backlink = route($backLink, $new_param);
                    }
                } else {
                    $url = route($route);
                    $backlink = route($backLink);
                }
                ?>
                <form action="{{ $url }}" enctype="multipart/form-data" method="post">
                @csrf
                <div class="card-body">
                    @include($form)
                </div>
                <div class="card-footer">
                    <a href="{{ $backlink }}" class="btn btn-flat btn-default"><i class="fa fa-arrow-left"></i> Kembali</a>
                    <div class="pull-right">
                        <button class="btn btn-primary btn-flat" type="submit"><i class="fa fa-save"></i> Simpan</button>
                    </div>
                </div>
                </form>
            </div>
        </section>
    </div>
@endsection

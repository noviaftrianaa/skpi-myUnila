@extends('template.default')
@include('__partial.icheck')
{{--@include('__partial.date')--}}
@include('__partial.ckeditor')
@include('__partial.datetime')
@include('__partial.select2')

@section('content')
    <div class="row">
        <section class="col-lg-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fa fa-pencil"></i> {!! $judul_halaman !!}</h3>
                </div>
                <?php
                    if(isset($param_form)) {
                        if(!is_array($param_form)) {
                            $url = route($route,[Crypt::encrypt($param_form),Crypt::encrypt($id)]);
                            $backlink = route($backLink,Crypt::encrypt($param_form));
                        } else {
                            $new_param = [];
                            $new_route = [];
                            foreach($param_form AS $list_param) {
                                $new_route[] = Crypt::encrypt($list_param);
                                $new_param[] = Crypt::encrypt($list_param);
                            }
                            $new_route[] = Crypt::encrypt($id);
                            $url = route($route,$new_route);
                            $backlink = route($backLink, $new_param);
                        }
                    } else {
                        $url = route($route, Crypt::encrypt($id));
                        $backlink = route($backLink);
                    }
                ?>
                <form action="{{ $url }}" enctype="multipart/form-data" class="form-horizontal" method="post">
                    @csrf
                    @method('PUT')
                <div class="card-body">
                    @include($form)
                </div>
                <div class="card-footer">
                    <a href="{{ $backlink }}" class="btn btn-default btn-flat"><i class="fa fa-arrow-left"></i> Kembali</a>
                    <button type="submit" class="btn btn-warning pull-right btn-flat"><i class="fa fa-pencil"></i> Ubah</button>
                </div>
                </form>
            </div>
        </section>
    </div>

    @stack('form_tambahan')
@endsection

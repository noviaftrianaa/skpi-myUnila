@extends('template_public.default',['judul_layout'=>'Dashboard Prediksi IKU Fakultas '.get_tahun_keaktifan()])

@section('content')
    <div class="container">
        <div class="card">
            <div class="card-body">
                {!! Form::open(['method'=>'get']) !!}
                {!! FormInputSelect('id_fak','Pilih Fakultas',$list_fakultas,false,false,$pilih_fak) !!}
                {!! Form::close() !!}
            </div>
        </div>
    </div>
@endsection

@extends('template.default')
@include('__partial.highchart')
@include('__partial.datatable_yajra')

@section('content')
    <div class="container">
            <div class="col-sm-12">
                <div class="card">
                    <div class="card-header">Data Aplikasi </div>
                    <div class="card-body">
                        <div class="tab-content" id="pills-tabContent">
                                <div class>
                                    <div class="table-responsive">
                                        <table class="table table-hover table-striped table-data">
                                            <tbody>
                                                {!! tablerow('Aplikasi',$data->nm_aplikasi) !!}
                                                {!! tablerow('Unit Organisasi',$data->unitorganisasi->nm_lemb) !!}
                                                {!! tablerow('Keterangan Aplikasi',$data->ket_aplikasi) !!}
                                                {!! tablerow('URL','<a href="'.$data->url.'" target=new>'.$data->url.'</a>') !!}
                                                {!! tablerow('Apakah Telah Ter-integrasi SSO ?',($data->a_integrasi_cas==1)?'Ya':'Tidak') !!}
                                                {!! tablerow('Apakah Sistem Internal PT ?',($data->a_sistem_internal_pt==1)?'Ya':'Tidak') !!}
                                                {!! tablerow('Tgl Buat', TglWaktuIndonesia($data->tgl_create)) ?? '-' !!}
                                                {!! tablerow('Tgl Update', TglWaktuIndonesia($data->last_update)) ?? '-' !!}
                                                {!! tablerow('Last Sync', TglWaktuIndonesia($data->last_sync)) ?? '-' !!}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                        </div>
                    </div>
                </div>
            </div>
    </div>
@endsection


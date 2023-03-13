@extends('template.default',['judul_layout'=>$judul_layout,'side_active'=>$side_active])

@include('__partial.highchart')
@include('__partial.datatable_class')

@push('css')
<style>
td:nth-child(1) {
    width: 20%;
}
</style>
@endpush

@section('content')

    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title mt-1"><i class="fa fa-list mr-2"></i> Data Kerjasama</h3>
        </div><!-- /.card-header -->
        <div class="card-body" style="margin: 0;padding: 0">
            <div class="row">
                <div class="col-md-3 col-12 pl-4">
                    {{-- <img src="{!! (!is_null($data->largeobject)) ? 'data:image/' . $data->largeobject->mime_type . ';base64,' . $data->largeobject->blob_content : asset('auth/img/logo.png') !!}" width="100%" class="my-3"/> --}}
                    <img src="{!! asset('images/pdf.png') !!}" width="70%" class="ml-5 mr-5 mb-3 mt-3"/>
                    <a type="button" class="btn btn-info col-8 my-1 ml-5 mr-5 mb-5" href="#"><i class="fas fa-download"></i> Download File</a>
                </div>
                <div class="col-md-9 col-12">
                    <div class="table-responsive">
                        <table class="table table-striped">
                            @foreach ($mou as $each_data_mou)
                                <tbody>
                                    {!! tablerow('Nama Instansi',$each_data_mou->nm_instansi) !!}
                                    {!! tablerow('Judul MOU',$each_data_mou->judul) !!}
                                    {!! tablerow('Nama Mitra',$each_data_mou->nama_mitra) !!}
                                    {!! tablerow('Nama Dunia Industri',$each_data_mou->nm_dudi) !!}
                                    {!! tablerow('Uraian Mou',$each_data_mou->uraian_mou) !!}
                                    {!! tablerow('SK MOU',$each_data_mou->sk_mou) !!}
                                    {!! tablerow('Nama Bidang Usaha',$each_data_mou->nm_bu) !!}
                                    {!! tablerow('Telp Kantor',$each_data_mou->tel_kantor) !!}
                                    {!! tablerow('Status Kerjasama',$each_data_mou->status) !!}
                                    {!! tablerow('Tgl Mulai', $each_data_mou->tgl_mulai)!!}
                                    {!! tablerow('Tgl Selesai', $each_data_mou->tgl_selesai)!!}
                                </tbody>
                            @endforeach
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title mt-1"><i class="fa fa-list mr-2"></i> Daftar Prodi</h3>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-hover table-striped table-data">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Fakultas</th>
                            <th>Program Studi</th>
                            <th>Status</th>
                            <th>Masa Berlaku</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($list_sms as $no_data => $each_data_prodi)
                            <tr>
                                <td style="width:5%">{{ $no_data + 1 }}</td>
                                <td>{{ $each_data_prodi->nm_fakultas }}</td>
                                <td>{{ $each_data_prodi->nm_prodi }}</td>
                                <td>{{ $each_data_prodi->status }}</td>
                                <td>{{ $each_data_prodi->masa_berlaku }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>

@endsection


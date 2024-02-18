@extends('layouts/layoutMaster')
@include('_partials.__partial.datatable')

@section('title', 'Sync Data My Unila')

@section('content')
    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title"><i class="fa fa-refresh"></i> Detail Table Grup Sync Data My Unila dan PDDIKTI/SISTER
                        <a href="{{ route('sinkronisasi.tabel.tambah',Crypt::encrypt($data->id_kel_table_app)) }}" class="btn btn-outline-primary float-end"><i class="fa fa-plus"></i> Tambah</a>
                    </h4>
                </div>
                <div class="card-body">
                    <table class="table table-striped">
                        <tbody>
                        {!! tableRow('Nama Grup',$data->enpoint) !!}
                        </tbody>
                    </table>
                    <hr>
                    <table id="table-data" class="table table-striped table-bordered">
                        <thead>
                        <tr>
                            <th>Sync Group</th>
                            <th>Keterangan</th>
                            <th>Last Sync</th>
                            <th>Aksi</th>
                        </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
                <div class="card-footer">
                    {!! buttonBack(route('sinkronisasi')) !!}
                </div>
            </div>
        </div>
    </div>
@endsection

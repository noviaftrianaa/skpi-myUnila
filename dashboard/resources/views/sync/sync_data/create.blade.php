@extends('layouts/layoutMaster')
@include('_partials.__partial.datetime')
{{--@include('__partial.date')--}}
@include('_partials.__partial.ckeditor')
@include('_partials.__partial.select2')

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
                <div class="card-body">
                    <form action="{{ route('sinkronisasi.tabel.tambah',Crypt::encrypt($data->id_kel_table_app)) }}" method="get">
                        {!! FormInputStatic('Nama Grup',$data->enpoint) !!}
                        {!! FormInputSelect('schema','Pilih Skema',$data_schema,true,true,$schema) !!}
                    </form>
                </div>
                @if(count($data_table)>0)
                    <form action="{{ $url }}" enctype="multipart/form-data" method="post">
                        @csrf
                        <div class="card-body">
                            <table class="table table-striped">
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Nama Alias</th>
                                    <th>Nama Schema</th>
                                    <th>Nama Table</th>
                                </tr>
                                </thead>
                                <tbody>
                                @foreach($data_table AS $each_data_table)
                                    <tr>
                                        <td><input type="checkbox" name="id_table_app[]" value="{{ $each_data_table->id_table_app }}"></td>
                                        <td>{{ $each_data_table->tabel_alias }}</td>
                                        <td>{{ $each_data_table->skema_tbl }}</td>
                                        <td>{{ $each_data_table->nm_tbl }}</td>
                                    </tr>
                                @endforeach
                                </tbody>
                            </table>
                        </div>
                        <div class="card-footer">
                            <a href="{{ $backlink }}" class="btn btn-flat btn-default"><i class="fa fa-arrow-left"></i> Kembali</a>
                            <div class="float-end">
                                <button class="btn btn-primary btn-flat" type="submit"><i class="fa fa-save"></i> Simpan</button>
                            </div>
                        </div>
                    </form>
                @else
                    <div class="card-footer">
                        <a href="{{ $backlink }}" class="btn btn-flat btn-default"><i class="fa fa-arrow-left"></i> Kembali</a>
                    </div>
                @endif
            </div>
        </section>
    </div>
@endsection

@push('js')
    <script>
        $(document).ready(function() {

            $('#schema').on('change', function() {
                this.form.submit();
            });
        });
    </script>
@endpush

@extends('template_public.default')
@include('__partial.highchart')
@include('__partial.datatable_class')

@section('content')
    <div class="container">
        <div class="row">
            <div class="col-sm-12">
                <div class="card">
                    <div class="card-header bg-primary">Nama Program Studi</div>
                    <div class="card-body">
                        <hr>
                        <div class="tab-content" id="pills-tabContent">
                            <div class="table-responsive">
                                <table class="table table-hover table-striped table-data">
                                    <thead>
                                        <tr>
                                            <th>No</th>
                                            <th>Jenis Standar</th>
                                            <th>Isi Standar</th>
                                            <th>Detail</th>

                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>1</td>
                                            <td>Standar 1</td>
                                            <td> Visi, Misi, Tujuan, dan Strategi</td>
                                            <td style="text-align: center;">
                                                <button type="button" class="btn btn-primary"
                                                    onclick="window.location='http://pdut-unila.test/akreditasi/detail_standar1'">Detail</button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>2</td>
                                            <td>Standar 2</td>
                                            <td>  Tata Pamong, Tata Kelola, dan Kerjasama</td>
                                            <td style="text-align: center;">
                                                <button type="button" class="btn btn-primary"
                                                    onclick="window.location='http://pdut-unila.test/akreditasi/detail_standar2'">Detail</button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>3</td>
                                            <td>Standar 3</td>
                                            <td>Mahasiswa</td>
                                            <td style="text-align: center;">
                                                <button type="button" class="btn btn-primary"
                                                    onclick="window.location='http://pdut-unila.test/akreditasi/detail_standar3'">Detail</button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>4</td>
                                            <td>Standar 4</td>
                                            <td>Sumber Daya Manusia</td>
                                            <td style="text-align: center;">
                                                <button type="button" class="btn btn-primary"
                                                    onclick="window.location='#'">Detail</button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>5</td>
                                            <td>Standar 5</td>
                                            <td>Keuangan, Sarana, dan Prasarana</td>
                                            <td style="text-align: center;">
                                                <button type="button" class="btn btn-primary"
                                                    onclick="window.location='http://pdut-unila.test/akreditasi/detail_standar5'">Detail</button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>6</td>
                                            <td>Standar 6</td>
                                            <td>Pendidikan</td>
                                            <td style="text-align: center;">
                                                <button type="button" class="btn btn-primary"
                                                    onclick="window.location='http://pdut-unila.test/akreditasi/detail_standar6'">Detail</button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>7</td>
                                            <td>Standar 7</td>
                                            <td>Penelitian</td>
                                            <td style="text-align: center;">
                                                <button type="button" class="btn btn-primary"
                                                    onclick="window.location='http://pdut-unila.test/akreditasi/detail_standar7'">Detail</button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>8</td>
                                            <td>Standar 8</td>
                                            <td>Pengabdian kepada Masyarakat</td>
                                            <td style="text-align: center;">
                                                <button type="button" class="btn btn-primary"
                                                    onclick="window.location='http://pdut-unila.test/akreditasi/detail_standar8'">Detail</button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>9</td>
                                            <td>Standar 9</td>
                                            <td>Luaran dan Capaian Tridharma</td>
                                            <td style="text-align: center;">
                                                <button type="button" class="btn btn-primary"
                                                    onclick="window.location='http://pdut-unila.test/akreditasi/detail_standar9'">Detail</button>
                                            </td>
                                        </tr>
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
@push('js')
@endpush

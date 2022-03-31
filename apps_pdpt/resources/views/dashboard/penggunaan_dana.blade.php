@extends('template_public.default')
@include('__partial.highchart')
@include('__partial.datatable_class')

@section('content')
    <div class="container">

        <div class="row">
            <div class="col-sm-12">
                <div class="card">
                    <div class="card-header bg-primary">Daftar Penggunaan Dana </div>
                    <div class="card-body">
                        <table>
                            <thead style="background-color:#eaeaea;">
                                <tr>
                                    <th rowspan="2">Jenis Penggunaan </th>
                                    <th></th>
                                    <th>Unit Pengelolah Program Studi</th>
                                    <th>Program Studi</th>
                                </tr>
                                <tr>
                                    <th></th>
                                    <th>
                                        <select class="form-control form-control-sm" aria-label="Default select example">
                                            <option selected>Tahun</option>
                                            <option value="1">TS-2</option>
                                            <option value="2">TS-1</option>
                                            <option value="3">TS</option>
                                        </select>
                                    </th>
                                    <th>
                                        <select class="form-control form-control-sm" aria-label="Default select example">
                                            <option selected>Tahun</option>
                                            <option value="1">TS-2</option>
                                            <option value="2">TS-1</option>
                                            <option value="3">TS</option>
                                        </select>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Biaya Operasioal Pendidikan</td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td>a. Biaya Dosen Gaji, Honor)</td>
                                    <td>:</td>
                                    <td><input class="form-control form-control-sm" type="text" placeholder="Biaya"></td>
                                    <td><input class="form-control form-control-sm" type="text" placeholder="Biaya"></td>
                                </tr>
                                <tr>
                                    <td>b. Biaya Tenaga Kependidikan (Gaji, Honor)</td>
                                    <td>:</td>
                                    <td><input class="form-control form-control-sm" type="text" placeholder="Biaya"></td>
                                    <td><input class="form-control form-control-sm" type="text" placeholder="Biaya"></td>
                                </tr>
                                <tr>
                                    <td>c. Biaya Operasional Pembelajaran (&nbsp;&nbsp;Bahan dan Peralatan Habis Pakai</td>
                                    <td>:</td>
                                    <td><input class="form-control form-control-sm" type="text" placeholder="Biaya"></td>
                                    <td><input class="form-control form-control-sm" type="text" placeholder="Biaya"></td>
                                </tr>
                                <tr>
                                    <td>d. Biaya Operasional Tidak Langsung (Listrik, Gas, Air, Pemeliharaan Gedung,
                                        Pemeliharaan Sarana, Uang Lembur, Telekomunikasi, Konsumsi, Transprot Lokal, Pajak,
                                        Asuransi, dll)</td>
                                    <td>:</td>
                                    <td><input class="form-control form-control-sm" type="text" placeholder="Biaya"></td>
                                    <td><input class="form-control form-control-sm" type="text" placeholder="Biaya"></td>

                                </tr>
                                <tr>
                                    <td>Biaya Operasional Kemahasiswaan (Penalaran, Minat, Bakat, dan Kesejahteraan)</td>
                                    <td>:</td>
                                    <td><input class="form-control form-control-sm" type="text" placeholder="Biaya"></td>
                                    <td><input class="form-control form-control-sm" type="text" placeholder="Biaya"></td>

                                </tr>
                                <tr style="margin-bottom: 10px!important; background-color:#eaeaea;">
                                    <td>Jumlah </td>
                                    <td>:</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td>Biaya Penelitian </td>
                                    <td>:</td>
                                    <td><input class="form-control form-control-sm" type="text" placeholder="Biaya"></td>
                                    <td><input class="form-control form-control-sm" type="text" placeholder="Biaya"></td>
                                </tr>
                                <tr>
                                    <td>Biaya PKM</td>
                                    <td>:</td>
                                    <td><input class="form-control form-control-sm" type="text" placeholder="Biaya"></td>
                                    <td><input class="form-control form-control-sm" type="text" placeholder="Biaya"></td>
                                </tr>
                                <tr style="margin-bottom: 10px!important; background-color:#eaeaea;">
                                    <td>jumlah</td>
                                    <td>:</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td>Biaya Investasi SDM</td>
                                    <td>:</td>
                                    <td><input class="form-control form-control-sm" type="text" placeholder="Biaya"></td>
                                    <td><input class="form-control form-control-sm" type="text" placeholder="Biaya"></td>
                                </tr>
                                <tr>
                                    <td>Biaya Investasi Sarana</td>
                                    <td>:</td>
                                    <td><input class="form-control form-control-sm" type="text" placeholder="Biaya"></td>
                                    <td><input class="form-control form-control-sm" type="text" placeholder="Biaya"></td>

                                </tr>
                                <tr>
                                    <td>Biaya Investasi Prasarana</td>
                                    <td>:</td>
                                    <td><input class="form-control form-control-sm" type="text" placeholder="Biaya"></td>
                                    <td><input class="form-control form-control-sm" type="text" placeholder="Biaya"></td>

                                </tr>
                                <tr style="margin-bottom: 10px!important; background-color:#eaeaea;">
                                    <td>Jumlah </td>
                                    <td>:</td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>

                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('js')
@endpush

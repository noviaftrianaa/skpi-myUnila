@extends('dosen::components.master')
@section('title', 'Tambah Jabatan Fungsional')

@section('css')
    <style>
        .line {
            border-right: 0.1px solid lightslategray;
        }

    </style>
@stop

@section('content')
    <div class="container-fluid py-4">
        <div class="row my-4">
            <div class="col-lg-12 col-md-12 mb-md-0 mb-4">
                <div class="card">
                    <div class="card-header pb-0">
                        <div class="row">
                            <div class="col-lg-6 col-7">
                                <h6>Form Tambah Jabatan Fungsional</h6>
                            </div>
                        </div>
                    </div>

                    <form>
                        <div class="card-body pb-2">
                            <div class="row">
                                <div class="col-lg-12 col-md-6">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label for="pangkat_golongan">Pangkat / Golongan</label>
                                                <select class="form-control" id="pangkat_golongan">
                                                    <option>Pilih</option>
                                                    <option>Asisten Ahli (300.00)</option>
                                                    <option>Pembantu (300.00)</option>
                                                    <option>Lektor (300.00)</option>
                                                    <option>Lektor Ahli (300.00)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div class="col-md-6">
                                            <div class="form-group">
                                                <label for="pangkat_golongan">Nomor SK</label>
                                                <div class="form-group">
                                                    <input type="email" class="form-control"
                                                        id="exampleFormControlInput1">
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="form-group">
                                                <label for="pangkat_golongan">Terhitung Mulai Tanggal</label>
                                                <div class="form-group">
                                                    <input type="email" class="form-control"
                                                        id="exampleFormControlInput1">
                                                </div>
                                            </div>
                                        </div>

                                        <div class="col-md-12">
                                            <div class="form-group">
                                                <label for="pangkat_golongan">Kelebihan Pengajaran</label>
                                                <div class="form-group">
                                                    <input type="email" class="form-control"
                                                        id="exampleFormControlInput1">
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="row">
                                        <div class="col-md-12">
                                            <div class="form-group">
                                                <label for="pangkat_golongan">Kelebihan Penelitian</label>
                                                <div class="form-group">
                                                    <input type="email" class="form-control"
                                                        id="exampleFormControlInput1">
                                                </div>
                                            </div>
                                        </div>

                                        <div class="col-md-12">
                                            <div class="form-group">
                                                <label for="pangkat_golongan">Kelebihan Pengabdian Masyarakat</label>
                                                <div class="form-group">
                                                    <input type="email" class="form-control"
                                                        id="exampleFormControlInput1">
                                                </div>
                                            </div>
                                        </div>

                                        <div class="col-md-12">
                                            <div class="form-group">
                                                <label for="pangkat_golongan">Kelebihan Kegiatan Penunjang</label>
                                                <div class="form-group">
                                                    <input type="email" class="form-control"
                                                        id="exampleFormControlInput1">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-lg-12 col-md-6" style="display: show;">
                                    <div class="row">
                                        <div class="col-lg-12 col-md-12 mb-3">
                                            <div class="row">
                                                <div class="col-lg-6 col-7">
                                                    <h6 class="mb-1">Upload Dokumen</h6>
                                                    <p class="text-sm mb-0">
                                                        <i class="fas fa-info-circle text-info" aria-hidden="true"></i>
                                                        <span class="font-italic ms-1">Maksimal total ukuran file dalam
                                                            sekali
                                                            proses upload 2 MB
                                                        </span>
                                                    </p>
                                                </div>
                                                <div class="col-lg-6 col-5 my-auto text-end">
                                                    <a class="btn btn-primary mb-0"
                                                        href="{{ route('dosen.inpassing.add') }}"><i
                                                            class="fas fa-plus" aria-hidden="true"></i>&nbsp;&nbsp;Tambah
                                                        Dokumen</a>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="col-lg-12 col-md-12 mb-2 mt-2">
                                            <div class="accordion" id="accordionExample">
                                                <div class="accordion-item">
                                                    <h2 class="accordion-header rounded-top" id="headingOne"
                                                        style="background-color: #121589;">
                                                        <button class="accordion-button" type="button"
                                                            data-bs-toggle="collapse" data-bs-target="#collapseOne"
                                                            aria-expanded="true" aria-controls="collapseOne">
                                                            <a style="color: white;">Dokumen 1</a>
                                                        </button>
                                                    </h2>
                                                    <div id="collapseOne"
                                                        class="accordion-collapse collapse show border border-dark rounded-bottom"
                                                        aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                                                        <div class="accordion-body">
                                                            <div class="row">
                                                                <div class="col-lg-12 col-md-12">
                                                                    <div class="form-group">
                                                                        <label for="exampleFormControlInput1">File
                                                                        </label>
                                                                        <input type="email" class="form-control"
                                                                            id="exampleFormControlInput1"
                                                                            placeholder="name@example.com">
                                                                    </div>

                                                                    <div class="form-group">
                                                                        <label for="exampleFormControlInput1">Nama
                                                                            Dokumen</label>
                                                                        <input type="email" class="form-control"
                                                                            id="exampleFormControlInput1"
                                                                            placeholder="name@example.com">
                                                                    </div>

                                                                    <div class="form-group">
                                                                        <label
                                                                            for="exampleFormControlInput1">Keterangan</label>
                                                                        <textarea rows="3" class="form-control"
                                                                            id="exampleFormControlInput1"
                                                                            placeholder="name@example.com"></textarea>
                                                                    </div>

                                                                    <div class="form-group">
                                                                        <label for="exampleFormControlInput1">Jenis
                                                                            Dokumen</label>
                                                                        <select class="form-control">
                                                                            <option value="">Pilih...</option>
                                                                            {
                                                                            <option value="4007">Analisis instruksional
                                                                            </option>
                                                                            {
                                                                            <option value="4004">Evaluasi hasil</option>
                                                                            {
                                                                            <option value="4003">Evaluasi proses</option>
                                                                            {
                                                                            <option value="17">Foto</option>
                                                                            {
                                                                            <option value="2017">Hasil Peer Review Karya
                                                                                Ilmiah</option>
                                                                            {
                                                                            <option value="2018">Hasil Tes Kemiripan Karya
                                                                                Ilmiah</option>
                                                                            {
                                                                            <option value="2">Ijazah</option>
                                                                            {
                                                                            <option value="38">Jurnal Internasional
                                                                                Bereputasi utk Dosen Asing</option>
                                                                            {
                                                                            <option value="44">Kartu Keluarga</option>
                                                                            {
                                                                            <option value="4006">Kisi-kisi soal</option>
                                                                            {
                                                                            <option value="36">Kitas Bagi Dosen Asing
                                                                            </option>
                                                                            {
                                                                            <option value="4002">Kontak perkuliahan</option>
                                                                            {
                                                                            <option value="1">KTP</option>
                                                                            {
                                                                            <option value="5">Lainnya</option>
                                                                            {
                                                                            <option value="43">NPWP</option>
                                                                            {
                                                                            <option value="101">Publikasi</option>
                                                                            {
                                                                            <option value="11">Riwayat Pendidikan Baru
                                                                            </option>
                                                                            {
                                                                            <option value="4005">RPS</option>
                                                                            {
                                                                            <option value="501">Sertifikat Asesor BKD
                                                                            </option>
                                                                            {
                                                                            <option value="6">Sertifikat Bhs. Inggris
                                                                            </option>
                                                                            {
                                                                            <option value="21">Sertifikat Dosen (Serdos)
                                                                            </option>
                                                                            {
                                                                            <option value="22">Sertifikat Profesional
                                                                            </option>
                                                                            {
                                                                            <option value="7">Sertifikat TPA</option>
                                                                            {
                                                                            <option value="41">SK Associate Professor untuk
                                                                                Dosen Asing</option>
                                                                            {
                                                                            <option value="19">SK CPNS</option>
                                                                            {
                                                                            <option value="4">SK Dosen/Instruktur/Tutor
                                                                            </option>
                                                                            {
                                                                            <option value="23">SK Jabatan Fungsional
                                                                            </option>
                                                                            {
                                                                            <option value="10">SK Pangkat/Inpassing</option>
                                                                            {
                                                                            <option value="24">SK Pemberhentian/Lolos
                                                                            </option>
                                                                            {
                                                                            <option value="42">SK Penugasan</option>
                                                                            {
                                                                            <option value="20">SK Penyetaraan Ijasah
                                                                            </option>
                                                                            {
                                                                            <option value="18">SK PNS</option>
                                                                            {
                                                                            <option value="39">Surat Keterangan Aktif
                                                                                Melaksanakan Tridharma PT</option>
                                                                            {
                                                                            <option value="37">Surat Keterangan Jabatan
                                                                                Akademik Dosen Asing</option>
                                                                            {
                                                                            <option value="35">Surat Keterangan Jadwal
                                                                                Mengajar</option>
                                                                            {
                                                                            <option value="40">Surat Pernyataan dari
                                                                                Pimpinan PT</option>
                                                                            {
                                                                            <option value="3">Surat Pernyataan Dosen
                                                                            </option>
                                                                            {
                                                                            <option value="25">Transkrip Nilai</option>
                                                                        </select>
                                                                    </div>

                                                                    <div class="form-group">
                                                                        <label for="exampleFormControlInput1">Tautan
                                                                            Dokumen</label>
                                                                        <div class="input-group">
                                                                            <span class="input-group-text"
                                                                                id="basic-addon3">https://</span>
                                                                            <input type="email" class="form-control"
                                                                                id="exampleFormControlInput1"
                                                                                placeholder="name@example.com">
                                                                        </div>
                                                                        <p class="text-sm mt-1">
                                                                            <i class="fas fa-info-circle text-info"
                                                                                aria-hidden="true"></i>
                                                                            <span class="font-italic ms-1">Perhatikan format
                                                                                penulisan url dengan http atau https
                                                                            </span>
                                                                        </p>
                                                                    </div>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                        <div class="col-lg-12 col-md-12 mb-2 mt-2">
                                            <div class="accordion" id="accordionExample">
                                                <div class="accordion-item">
                                                    <h2 class="accordion-header rounded-top" id="headingOne"
                                                        style="background-color: #121589;">
                                                        <button class="accordion-button" type="button"
                                                            data-bs-toggle="collapse" data-bs-target="#collapseOne"
                                                            aria-expanded="true" aria-controls="collapseOne">
                                                            <a style="color: white;">Dokumen 1</a>
                                                        </button>
                                                    </h2>
                                                    <div id="collapseOne"
                                                        class="accordion-collapse collapse border border-dark rounded-bottom"
                                                        aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                                                        <div class="accordion-body">
                                                            <div class="row">
                                                                <div class="col-lg-12 col-md-12">
                                                                    <div class="form-group">
                                                                        <label for="exampleFormControlInput1">File
                                                                        </label>
                                                                        <input type="email" class="form-control"
                                                                            id="exampleFormControlInput1"
                                                                            placeholder="name@example.com">
                                                                    </div>

                                                                    <div class="form-group">
                                                                        <label for="exampleFormControlInput1">Nama
                                                                            Dokumen</label>
                                                                        <input type="email" class="form-control"
                                                                            id="exampleFormControlInput1"
                                                                            placeholder="name@example.com">
                                                                    </div>

                                                                    <div class="form-group">
                                                                        <label
                                                                            for="exampleFormControlInput1">Keterangan</label>
                                                                        <textarea rows="3" class="form-control"
                                                                            id="exampleFormControlInput1"
                                                                            placeholder="name@example.com"></textarea>
                                                                    </div>

                                                                    <div class="form-group">
                                                                        <label for="exampleFormControlInput1">Jenis
                                                                            Dokumen</label>
                                                                        <select class="form-control">
                                                                            <option value="">Pilih...</option>
                                                                            {
                                                                            <option value="4007">Analisis instruksional
                                                                            </option>
                                                                            {
                                                                            <option value="4004">Evaluasi hasil</option>
                                                                            {
                                                                            <option value="4003">Evaluasi proses</option>
                                                                            {
                                                                            <option value="17">Foto</option>
                                                                            {
                                                                            <option value="2017">Hasil Peer Review Karya
                                                                                Ilmiah</option>
                                                                            {
                                                                            <option value="2018">Hasil Tes Kemiripan Karya
                                                                                Ilmiah</option>
                                                                            {
                                                                            <option value="2">Ijazah</option>
                                                                            {
                                                                            <option value="38">Jurnal Internasional
                                                                                Bereputasi utk Dosen Asing</option>
                                                                            {
                                                                            <option value="44">Kartu Keluarga</option>
                                                                            {
                                                                            <option value="4006">Kisi-kisi soal</option>
                                                                            {
                                                                            <option value="36">Kitas Bagi Dosen Asing
                                                                            </option>
                                                                            {
                                                                            <option value="4002">Kontak perkuliahan</option>
                                                                            {
                                                                            <option value="1">KTP</option>
                                                                            {
                                                                            <option value="5">Lainnya</option>
                                                                            {
                                                                            <option value="43">NPWP</option>
                                                                            {
                                                                            <option value="101">Publikasi</option>
                                                                            {
                                                                            <option value="11">Riwayat Pendidikan Baru
                                                                            </option>
                                                                            {
                                                                            <option value="4005">RPS</option>
                                                                            {
                                                                            <option value="501">Sertifikat Asesor BKD
                                                                            </option>
                                                                            {
                                                                            <option value="6">Sertifikat Bhs. Inggris
                                                                            </option>
                                                                            {
                                                                            <option value="21">Sertifikat Dosen (Serdos)
                                                                            </option>
                                                                            {
                                                                            <option value="22">Sertifikat Profesional
                                                                            </option>
                                                                            {
                                                                            <option value="7">Sertifikat TPA</option>
                                                                            {
                                                                            <option value="41">SK Associate Professor untuk
                                                                                Dosen Asing</option>
                                                                            {
                                                                            <option value="19">SK CPNS</option>
                                                                            {
                                                                            <option value="4">SK Dosen/Instruktur/Tutor
                                                                            </option>
                                                                            {
                                                                            <option value="23">SK Jabatan Fungsional
                                                                            </option>
                                                                            {
                                                                            <option value="10">SK Pangkat/Inpassing</option>
                                                                            {
                                                                            <option value="24">SK Pemberhentian/Lolos
                                                                            </option>
                                                                            {
                                                                            <option value="42">SK Penugasan</option>
                                                                            {
                                                                            <option value="20">SK Penyetaraan Ijasah
                                                                            </option>
                                                                            {
                                                                            <option value="18">SK PNS</option>
                                                                            {
                                                                            <option value="39">Surat Keterangan Aktif
                                                                                Melaksanakan Tridharma PT</option>
                                                                            {
                                                                            <option value="37">Surat Keterangan Jabatan
                                                                                Akademik Dosen Asing</option>
                                                                            {
                                                                            <option value="35">Surat Keterangan Jadwal
                                                                                Mengajar</option>
                                                                            {
                                                                            <option value="40">Surat Pernyataan dari
                                                                                Pimpinan PT</option>
                                                                            {
                                                                            <option value="3">Surat Pernyataan Dosen
                                                                            </option>
                                                                            {
                                                                            <option value="25">Transkrip Nilai</option>
                                                                        </select>
                                                                    </div>

                                                                    <div class="form-group">
                                                                        <label for="exampleFormControlInput1">Tautan
                                                                            Dokumen</label>
                                                                        <div class="input-group">
                                                                            <span class="input-group-text"
                                                                                id="basic-addon3">https://</span>
                                                                            <input type="email" class="form-control"
                                                                                id="exampleFormControlInput1"
                                                                                placeholder="name@example.com">
                                                                        </div>
                                                                        <p class="text-sm mt-1">
                                                                            <i class="fas fa-info-circle text-info"
                                                                                aria-hidden="true"></i>
                                                                            <span class="font-italic ms-1">Perhatikan format
                                                                                penulisan url dengan http atau https
                                                                            </span>
                                                                        </p>
                                                                    </div>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('js')
@stop

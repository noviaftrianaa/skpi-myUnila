@extends('stakeholder::layouts.master')
@section('title', 'PDUT Universitas Lampung - Status Pembayaran')
@section('content')
@section('css')
<style>
.stats {
    background: #f2f5f8 !important;
    color: #000 !important
}

.articles {
    font-size: 10px;
    color: #a1aab9
}

.number1 {
    font-weight: 500
}

.followers {
    font-size: 15px;
    color: #a1aab9
}

.number2 {
    font-weight: 500
}

.rating {
    font-size: 10px;
    color: #a1aab9
}

.number3 {
    font-weight: 500
}
</style>
@stop

<div class="container-fluid py-4">
  <div class="row mt-2">
        <div class="col-lg-12 mb-lg-0 mb-4 ">
          <div class="card z-index-2">
            <div class="card-body p-3">
              <form class="form-inline" method="post" id="form_filter">
                <div class="form-group">
                    <div class="row">
                        <label for="alamat" style="margin-right:10px" class="col-sm-2 col-form-label">Periode</label>
                        <div class="col-md-2"><select id="periode" name="periode" class="form-control input-sm" onchange="goSubmit(this)">
                            <option value="1" >Pilih Semester</option>
                            <option value="2" selected>2021 Ganjil</option>
                            <option value="3" >2019 Pendek</option>
                            <option value="4" >2019 Genap</option>
                            <option value="5" >2019 Ganjil</option></select>
                        </div>
                    </div>
                </div>
                </form>
              <div class="row">
                <div class="col-md-12">
                    <div class="row nav-tabs-custom">
                      <ul id="tab-data-mahasiswa" class="nav nav-tabs"  style="padding-left:5px;padding-right:5px;">
                            <li id="item-informasi-umum" class="active"><a href="#informasi-umum" data-toggle="tab">KRS</a></li>
                            <li id="item-domisili" ><a href="#domisili" data-toggle="tab">KHS</a></li>
                            <li id="item-sekolah" ><a href="#sekolah" data-toggle="tab">TRANSKRIP</a></li>
                      </ul>
                      <div class="tab-content col-md-12">
                        <div id="informasi-umum" class="tab-pane active">
                          <div class="row">
                            <div class="col-md-10">
                              <div id="block-jk" class="row bord-bottom">
                                <label for="jk" class="col-md-5">Jenis Kelamin</label>
                                <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                  Perempuan<p class="help-block"><span id="error-field-jk"></span></p>
                                </div>
                              </div>
                              <div id="block-tmplahir" class="row bord-bottom">
                                <label for="tmplahir" class="col-md-5">Tempat Lahir</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                Bandar Lampung<p class="help-block"><span id="error-field-tmplahir"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-tgllahir" class="row bord-bottom">
                                            <label for="tgllahir" class="col-md-5">Tanggal Lahir</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                21 Agustus 2001<p class="help-block"><span id="error-field-tgllahir"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-idagama" class="row bord-bottom">
                                            <label for="idagama" class="col-md-5">Agama</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                Islam<p class="help-block"><span id="error-field-idagama"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-idsuku" class="row bord-bottom ">
                                            <label for="idsuku" class="col-md-5">Suku</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                <span data-cari="cari/suku" data-inkey="idsuku" id="idsuku_label" />
                                                <p class="help-block"><span id="error-field-idsuku"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-goldarah" class="row bord-bottom ">
                                            <label for="goldarah" class="col-md-5">Golongan Darah</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                O<p class="help-block"><span id="error-field-goldarah"></span></p>
                                        </div>
                                        </div>
                                        <div id="block-beratbadan" class="row bord-bottom ">
                                            <label for="beratbadan" class="col-md-5">Berat Badan (Kg)</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                <p class="help-block"><span id="error-field-beratbadan"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-tinggibadan" class="row bord-bottom ">         
                                            <label for="tinggibadan" class="col-md-5">Tinggi Badan (cm)</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                <p class="help-block"><span id="error-field-tinggibadan"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-telepon" class="row bord-bottom ">
                                            <label for="telepon" class="col-md-5">No. Telepon</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                0895605995201<p class="help-block"><span id="error-field-telepon"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-hp" class="row bord-bottom ">
                                            <label for="hp" class="col-md-5">No. HP</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                0895605995201<p class="help-block"><span id="error-field-hp"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-emailkampus" class="row bord-bottom ">
                                            <label for="emailkampus" class="col-md-5">Email Kampus</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                <p class="help-block"><span id="error-field-emailkampus"></span></p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-sm-6" >
                                        <div id="block-email" class="row bord-bottom ">
                                            <label for="email" class="col-md-5">Email Pribadi</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                khairunnisa2001.rip@gmail.com<p class="help-block"><span id="error-field-email"></span></p>                </div>
                                        </div>
                                        <div id="block-statusnikah" class="row bord-bottom ">
                                            <label for="statusnikah" class="col-md-5">Status Nikah</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                Lajang<p class="help-block"><span id="error-field-statusnikah"></span></p>                </div>
                                        </div>
                                        <div id="block-nik" class="row bord-bottom "> 
                                            <label for="nik" class="col-md-5">NIK</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                1871116108010004<p class="help-block"><span id="error-field-nik"></span></p>                </div>
                                        </div>
                                        <div id="block-nokk" class="row bord-bottom ">
                                            <label for="nokk" class="col-md-5">No. KK</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                1871112109100013<p class="help-block"><span id="error-field-nokk"></span></p>                </div>
                                        </div>
                                        <div id="block-nokps" class="row bord-bottom ">
                                            <label for="nokps" class="col-md-5">No. KPS</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                <p class="help-block"><span id="error-field-nokps"></span></p>                </div>
                                        </div>
                                        <div id="block-idpekerjaan" class="row bord-bottom ">
                                            <label for="idpekerjaan" class="col-md-5">Pekerjaan</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                Belum Bekerja<p class="help-block"><span id="error-field-idpekerjaan"></span></p>                </div>
                                        </div>
                                        <div id="block-idpenghasilan" class="row bord-bottom ">
                                            <label for="idpenghasilan" class="col-md-5">Penghasilan</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                <p class="help-block"><span id="error-field-idpenghasilan"></span></p>                </div>
                                        </div>
                                        <div id="block-instansi" class="row bord-bottom ">
                                            <label for="instansi" class="col-md-5">Instansi Pekerjaan</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                <p class="help-block"><span id="error-field-instansi"></span></p>                </div>
                                        </div>
                                        <div id="block-idtransport" class="row bord-bottom ">
                                            <label for="idtransport" class="col-md-5">Transportasi</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                <p class="help-block"><span id="error-field-idtransport"></span></p>                </div>
                                        </div>
                                        <div id="block-fileaktakelahiran" class="row bord-bottom ">
                                            <label for="fileaktakelahiran" class="col-md-5">Akta Kelahiran</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                <p class="help-block"><span id="error-field-fileaktakelahiran"></span></p>                </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="domisili" class="tab-pane ">
                                <div class="row">
                                    <div class="col-sm-6" >
                                        <div id="block-alamat" class="row bord-bottom ">
                                            <label for="alamat" class="col-md-5">Alamat</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                Jl. R.A. Basyid No. 115<p class="help-block"><span id="error-field-alamat"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-rt" class="row bord-bottom ">
                                            <label for="rt" class="col-md-5">RT</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                06<p class="help-block"><span id="error-field-rt"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-rw" class="row bord-bottom ">
                                            <label for="rw" class="col-md-5">RW</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                II<p class="help-block"><span id="error-field-rw"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-dusun" class="row bord-bottom ">
                                            <label for="dusun" class="col-md-5">Dusun</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                -<p class="help-block"><span id="error-field-dusun"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-desa" class="row bord-bottom ">
                                            <label for="desa" class="col-md-5">Desa/Kelurahan</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                LABUHAN DALAM<p class="help-block"><span id="error-field-desa"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-idpropinsi" class="row bord-bottom ">
                                            <label for="idpropinsi" class="col-md-5">Propinsi</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                LAMPUNG<p class="help-block"><span id="error-field-idpropinsi"></span></p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-sm-6" >
                                        <div id="block-idkota" class="row bord-bottom ">
                                            <label for="idkota" class="col-md-5">Kota</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                KOTA BANDAR LAMPUNG<p class="help-block"><span id="error-field-idkota"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-idkecamatan" class="row bord-bottom ">
                                            <label for="idkecamatan" class="col-md-5">Kecamatan</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                TANJUNG SENANG<p class="help-block"><span id="error-field-idkecamatan"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-idnegara" class="row bord-bottom ">
                                            <label for="idnegara" class="col-md-5">Kewarganegaraan</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                Indonesia<p class="help-block"><span id="error-field-idnegara"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-kodepos" class="row bord-bottom ">
                                            <label for="kodepos" class="col-md-5">Kode Pos</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                35142<p class="help-block"><span id="error-field-kodepos"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-idjenistinggal" class="row bord-bottom ">
                                            <label for="idjenistinggal" class="col-md-5">Status Tinggal</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                Rumah Orang Tua<p class="help-block"><span id="error-field-idjenistinggal"></span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="sekolah" class="tab-pane ">
                                <div class="row">
                                    <div class="col-sm-6" >
                                        <div id="block-idpendidikanasal" class="row bord-bottom ">
                                            <label for="idpendidikanasal" class="col-md-5">Pendidikan Asal</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                SMK<p class="help-block"><span id="error-field-idpendidikanasal"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-idpropinsismu" class="row bord-bottom ">
                                            <label for="idpropinsismu" class="col-md-5">Propinsi Sekolah</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                LAMPUNG<p class="help-block"><span id="error-field-idpropinsismu"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-idkotasmu" class="row bord-bottom ">
                                            <label for="idkotasmu" class="col-md-5">Kota Sekolah</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                KOTA BANDAR LAMPUNG<p class="help-block"><span id="error-field-idkotasmu"></span></p> 
                                            </div>
                                        </div>
                                        <div id="block-npsn" class="row bord-bottom ">
                                            <label for="npsn" class="col-md-5">Sekolah</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                <span  data-cari="findSekolahBy" data-param="idkotasmu"data-toggle="tooltip" title="Keterangan : Isian wajib diisi" 
                                                data-inkey="npsn" data-key="69765023" id="npsn_label" />
                                                <p class="help-block"><span id="error-field-npsn"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-nisn" class="row bord-bottom ">
                                            <label for="nisn" class="col-md-5">NISN</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                0011979448<p class="help-block"><span id="error-field-nisn"></span></p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-sm-6" >
                                        <div id="block-alamatsmu" class="row bord-bottom ">
                                            <label for="alamatsmu" class="col-md-5">Alamat Sekolah</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                Jl.  Pendidikan Kel. Sukarame Baru  Kec.  Sukarame Kota Bandar Lampung
                                                <p class="help-block"><span id="error-field-alamatsmu"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-telpsmu" class="row bord-bottom ">
                                            <label for="telpsmu" class="col-md-5">Telepon Sekolah</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                <span class="number" maxlength="15"data-toggle="tooltip" title="Keterangan : isian maksimal 15 karakter, 
                                                Isian harus angka">7215610688</span><p class="help-block"><span id="error-field-telpsmu"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-noijasahsmu" class="row bord-bottom ">
                                            <label for="noijasahsmu" class="col-md-5">Nomor Ijasah Sekolah</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                M-SMK/13-3/0669390<p class="help-block"><span id="error-field-noijasahsmu"></span></p> 
                                            </div>
                                        </div>
                                        <div id="block-fileijazahterakhir" class="row bord-bottom ">
                                            <label for="fileijazahterakhir" class="col-md-5">File Ijazah SMA</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                <p class="help-block"><span id="error-field-fileijazahterakhir"></span></p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="perguruan-tinggi" class="tab-pane ">
                                <div class="row">
                                    <div class="col-sm-6" >
                                        <div id="block-iduniversitasasal" class="row bord-bottom ">
                                            <label for="iduniversitasasal" class="col-md-5">Perguruan Tinggi Asal</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                <span  data-cari="findUniversitas" data-inkey="iduniversitasasal" id="iduniversitasasal_label" />
                                                <p class="help-block"><span id="error-field-iduniversitasasal"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-iduniversitasprodiasal" class="row bord-bottom ">
                                            <label for="iduniversitasprodiasal" class="col-md-5">Program Studi Asal</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                <span  data-cari="findUniversitasProdiBy" data-inkey="iduniversitasprodiasal" id="iduniversitasprodiasal_label" />
                                                <p class="help-block"><span id="error-field-iduniversitasprodiasal"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-nimlama" class="row bord-bottom "> 
                                            <label for="nimlama" class="col-md-5">NIM Asal</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                <p class="help-block"><span id="error-field-nimlama"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-ipkasal" class="row bord-bottom "> 
                                            <label for="ipkasal" class="col-md-5">IPK Asal</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                <span class="number" maxlength="4" data-decimal="2" data-min="0" data-max="4"data-toggle="tooltip" title="Keterangan : isian maksimal 4 karakter, Isian harus angka"></span><p class="help-block"><span id="error-field-ipkasal"></span></p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-sm-6" >
                                        <div id="block-sksasal" class="row bord-bottom ">
                                            <label for="sksasal" class="col-md-5">SKS Asal (Diakui)</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                <span class="number"   maxlength="3"data-toggle="tooltip" title="Keterangan : isian maksimal 3 karakter, Isian harus angka"></span><p class="help-block"><span id="error-field-sksasal"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-noijasahsmu" class="row bord-bottom ">
                                            <label for="noijasahsmu" class="col-md-5">Nomor Ijasah</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                M-SMK/13-3/0669390<p class="help-block"><span id="error-field-noijasahsmu"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-filesuratpindah" class="row bord-bottom ">
                                            <label for="filesuratpindah" class="col-md-5">Surat Rekom. Pindah</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                <p class="help-block"><span id="error-field-filesuratpindah"></span></p>
                                            </div>
                                        </div>
                                        <div id="block-filetranskripasal" class="row bord-bottom ">
                                            <label for="filetranskripasal" class="col-md-5">Transkrip Asal</label>
                                            <div class="col-md-7" style="display:block;word-wrap:break-word;">
                                                <p class="help-block"><span id="error-field-filetranskripasal"></span></p>
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
      
    </div>
  </div>
@endsection
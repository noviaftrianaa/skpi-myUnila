@extends('stakeholder::layouts.master')
@section('title', 'PDUT Universitas Lampung - Kartu Rencana Kerja')
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
    <div class="col-lg-12 mb-lg-0 mb-4">
      <div class="card z-index-2">
        <div class="card-body p-3">
          <form class="form-inline" method="post" id="form_filter">
            <div class="row">
              <label for="alamat" style="margin-right:5px" class="col-sm-2 col-form-label">Periode</label>
              <div class="col-md-2"><select id="periode" name="periode" class="form-control input-sm" onchange="goSubmit(this)">
                <option value="1" >Pilih Semester</option>
                <option value="2" selected>2021 Ganjil</option>
                <option value="3" >2019 Pendek</option>
                <option value="4" >2019 Genap</option>
                <option value="5" >2019 Ganjil</option></select>
              </div>
            </div>
          </form>
            <div class="row nav-tabs-custom">
              <div class="nav-wrapper position-relative end-0">
                <ul class="nav nav-pills nav-fill p-1" role="tablist">
                                        <li class="nav-item">
                                            <a class="nav-link mb-0 px-0 py-1 active" data-bs-toggle="tab" href="#krs"
                                                role="tab" aria-controls="preview" aria-selected="true">
                                                <i class="ni ni-badge text-sm me-2"></i> Kartu Rencana Studi (KRS)
                                            </a>
                                        </li>
                                        <li class="nav-item">
                                            <a class="nav-link mb-0 px-0 py-1" data-bs-toggle="tab" href="#khs"
                                                role="tab" aria-controls="code" aria-selected="false">
                                                <i class="ni ni-laptop text-sm me-2"></i> Kartu Hasil Studi (KHS)
                                            </a>
                                        </li>

                                        <li class="nav-item">
                                            <a class="nav-link mb-0 px-0 py-1" data-bs-toggle="tab" href="#transkrip"
                                                role="tab" aria-controls="code" aria-selected="false">
                                                <i class="ni ni-laptop text-sm me-2"></i> Transkrip
                                            </a>
                                        </li>
                                    </ul>
                                </div>
              <div class="d-flex align-items-center">
                <div class="ml-4 w-100 p-1">
                  <div class="p-3 mt-0 rounded text-white stats">
                    <div class="col-md-15">
                    <form method="post" id="form_data" enctype="multipart/form-data">
                      <input type="hidden" name="key" id="key" />
                      <input type="hidden" name="act" id="act" />
                      <div class="row">
                        <div class="col-sm-5" >
                          <div class="col-sm-23">
                            <div class="d-flex flex-column">
                              <table>
                                <tr>    
                                  <td width="30%">NPM</td>
                                  <td width="45%">: 1517051048</td>  
                                </tr>   
                                    <tr>
                                      <td width="30%">Status Mahasiswa</td>
                                      <td width="45%">: Aktif</td>
                                    </tr>
                                    <tr>
                                      <td width="30%">Angkatan</td>
                                      <td width="45%">: 2019</td>
                                    </tr>
                                      <td width="30%">Tahun Kurikulum</td>
                                      <td width="45%">: 2020</td>
                                    </tr>
                                  </table>
                                </div>
                              </div>
                              </div>
                              
                              <div class="col-sm-7" >
                                <div class="col-sm-23">
                                  <div class="d-flex flex-column">
                                    <table>
                                      <tr>
                                        <td width="30%">Nama Mahasiswa</td>
                                        <td width="55%">: Zuliana Nurfadlillah</td>
                                      </tr>
                                      <tr>
                                        <td width="30%">Program Studi</td>
                                        <td width="55%">: S1 - Biologi Terapan</td>
                                      </tr>
                                      <tr>
                                        <td width="30%">Pembimbing Akadamik</td>
                                        <td width="55%">: DR NUNING NURCAHYANI, M.Sc.</td>
                                      </tr>
                                      <tr>
                                        <td width="30%">Semester / IPK</td>
                                        <td width="55%">: 10 / 3.03</td>
                                      </tr>
                                    </table>
                                  </div>
                                </div>
                              </div>
                          </div>
                      </form>
                  </div>
              </div>
            </div>
          </div>
            </div>
              </div>
            </div>
          </div>
          
          <div class="row mt-4">
            <div class="col-lg-12 col-md-12 mb-md-0 mb-4">
                <div class="card-header px-0 pb-2">
                  <div class="table-responsive">
                    <div class="tab-content" id="myTabContent">
                      <div class="tab-pane fade show active" id="krs" role="tabpanel"
                          aria-labelledby="krs-tab">
                          <div class="card">
                              <div class="card-body px-0 pb-2">
                                  <div class="table-responsive">
                                        <table class="table align-items-center mb-3">
                                          <thead>
                                              <tr>
                                                  <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No
                                                  </th>
                                                  <th
                                                      class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">
                                                      Kode</th>
                                                  <th
                                                      class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                                      Mata Kuliah</th>
                                                  <th
                                                      class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                                      Nama Kelas</th>
                                                  <th
                                                      class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                                      SKS</th>
                                                  <th
                                                      class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                                      Jadwal</th>
                                                  <th
                                                      class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                                      Status</th>
                                              </tr>
                                          </thead>
                                          <tbody>
                                              <tr>
                                                  <td>
                                                      <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                          1</span>
                                                  </td>
                                                  <td>
                                                      <span class="text-xs font-weight-bold"> BIT620301 </span>
                                                  </td>
                                                  <td class="align-middle text-center text-sm">
                                                      <span class="text-xs font-weight-bold"> Metodologi Penelitian</span>
                                                  </td>
                                                  <td class="align-middle text-center text-sm">
                                                    <span class="text-xs font-weight-bold">BIT</span>
                                                </td>
                                                  <td class="align-middle text-center text-sm">
                                                      <span class="text-xs font-weight-bold"> 3 </span>
                                                  </td>
                                                  <td class="align-middle text-center text-sm">
                                                    <span class="text-xs font-weight-bold">
                                                      Senin, 08:20 s.d 10:10<br>
                                                      Senin, 10:10 s.d 11:00 </span>
                                                </td>
                                                  <td class="align-middle text-center text-sm">
                                                      <span class="text-xs font-weight-bold"> Wajib </span>
                                                  </td>
                                              </tr>
                                              <tr>
                                                  <td>
                                                      <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                          2</span>
                                                  </td>
                                                  <td>
                                                    <span class="text-xs font-weight-bold"> BIT620302 </span>
                                                </td>
                                                <td class="align-middle text-center text-sm">
                                                    <span class="text-xs font-weight-bold"> Teknik Penulisan Karya Ilmiah</span>
                                                </td>
                                                <td class="align-middle text-center text-sm">
                                                  <span class="text-xs font-weight-bold">BIT</span>
                                              </td>
                                                <td class="align-middle text-center text-sm">
                                                    <span class="text-xs font-weight-bold"> 2 </span>
                                                </td>
                                                <td class="align-middle text-center text-sm">
                                                  <span class="text-xs font-weight-bold">
                                                    Selasa, 09:20 s.d 10:10<br>
                                                    Selasa, 10:10 s.d 11:00</span>
                                              </td>
                                                <td class="align-middle text-center text-sm">
                                                    <span class="text-xs font-weight-bold"> Wajib </span>
                                                </td>
                                              </tr>
                                              <tr>
                                                  <td>
                                                      <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                          3</span>
                                                  </td>
                                                  <td>
                                                    <span class="text-xs font-weight-bold"> 	BIT620303 </span>
                                                </td>
                                                <td class="align-middle text-center text-sm">
                                                    <span class="text-xs font-weight-bold"> Biologi Evolusi</span>
                                                </td>
                                                <td class="align-middle text-center text-sm">
                                                  <span class="text-xs font-weight-bold">BIT</span>
                                              </td>
                                                <td class="align-middle text-center text-sm">
                                                    <span class="text-xs font-weight-bold"> 2 </span>
                                                </td>
                                                <td class="align-middle text-center text-sm">
                                                  <span class="text-xs font-weight-bold">
                                                    Rabu, 07:30 s.d 09:10</span>
                                              </td>
                                                <td class="align-middle text-center text-sm">
                                                    <span class="text-xs font-weight-bold"> Wajib </span>
                                                </td>
                                              </tr>
                                            </tbody>
                                            <tfoot>
                                              <tr>
                                                  <th colspan="4">Total SKS</th>
                                                  <th class="text-center">24</th>
                                                  <th colspan="3">&nbsp;</th>
                                              </tr>
                                              <tr>
                                                  <th colspan="4">Batas SKS</th>
                                                  <th class="text-center">24</th>
                                                  <th colspan="3">&nbsp;</th>
                                              </tr>
                                          </tfoot>
                                      </table>
                                  </div>
                              </div>
                          </div>
                      </div>
                      <div class="tab-pane fade" id="khs" role="tabpanel" aria-labelledby="khs-tab">
                          <div class="card">
                              <div class="card-body px-0 pb-2">
                                  <div class="table-responsive">
                                    <table class="table align-items-center mb-3">
                                      <thead>
                                          <tr>
                                              <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No
                                              </th>
                                              <th
                                                  class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">
                                                  Kode</th>
                                              <th
                                                  class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                                  Mata Kuliah</th>
                                              <th
                                                  class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                                  SKS</th>
                                              <th
                                                  class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                                  Nilai Mutu</th>
                                              <th
                                                  class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                                  Bobot</th>
                                              <th
                                                  class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                                  Nilai</th>
                                              <th
                                                  class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                                  Keterangan</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          <tr>
                                              <td>
                                                  <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                      1</span>
                                              </td>
                                              <td>
                                                  <span class="text-xs font-weight-bold"> BIT620301 </span>
                                              </td>
                                              <td class="align-middle text-center text-sm">
                                                  <span class="text-xs font-weight-bold"> Metodologi Penelitian</span>
                                              </td>
                                              <td class="align-middle text-center text-sm">
                                                  <span class="text-xs font-weight-bold"> 3 </span>
                                              </td>
                                              <td class="align-middle text-center text-sm">
                                                <span class="text-xs font-weight-bold">-</span>
                                             </td>
                                              <td class="align-middle text-center text-sm">
                                                <span class="text-xs font-weight-bold">
                                                  - </span>
                                            </td>
                                              <td class="align-middle text-center text-sm">
                                                  <span class="text-xs font-weight-bold"> Isi Kuesioner<a href="/siakad/list_angket"> Dosen </a> </span>
                                              </td>
                                              <td class="align-middle text-center text-sm">
                                                <span class="text-xs font-weight-bold"> - </span>
                                            </td>
                                          </tr>
                                          <tr>
                                              <td>
                                                  <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                      2</span>
                                              </td>
                                              <td>
                                                <span class="text-xs font-weight-bold"> BIT620301 </span>
                                            </td>
                                            <td class="align-middle text-center text-sm">
                                                <span class="text-xs font-weight-bold"> Metodologi Penelitian</span>
                                            </td>
                                            <td class="align-middle text-center text-sm">
                                                <span class="text-xs font-weight-bold"> 3 </span>
                                            </td>
                                            <td class="align-middle text-center text-sm">
                                              <span class="text-xs font-weight-bold">-</span>
                                           </td>
                                            <td class="align-middle text-center text-sm">
                                              <span class="text-xs font-weight-bold">
                                                - </span>
                                          </td>
                                            <td class="align-middle text-center text-sm">
                                                <span class="text-xs font-weight-bold"> Isi Kuesioner<a href="/siakad/list_angket"> Dosen </a> </span>
                                            </td>
                                            <td class="align-middle text-center text-sm">
                                              <span class="text-xs font-weight-bold"> - </span>
                                          </td>
                                          </tr>
                                          <tr>
                                              <td>
                                                  <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                      3</span>
                                              </td>
                                              <td>
                                                <span class="text-xs font-weight-bold"> BIT620301 </span>
                                            </td>
                                            <td class="align-middle text-center text-sm">
                                                <span class="text-xs font-weight-bold"> Metodologi Penelitian</span>
                                            </td>
                                            <td class="align-middle text-center text-sm">
                                                <span class="text-xs font-weight-bold"> 3 </span>
                                            </td>
                                            <td class="align-middle text-center text-sm">
                                              <span class="text-xs font-weight-bold">-</span>
                                           </td>
                                            <td class="align-middle text-center text-sm">
                                              <span class="text-xs font-weight-bold">
                                                - </span>
                                          </td>
                                            <td class="align-middle text-center text-sm">
                                                <span class="text-xs font-weight-bold"> Isi Kuesioner<a href="/siakad/list_angket"> Dosen </a> </span>
                                            </td>
                                            <td class="align-middle text-center text-sm">
                                              <span class="text-xs font-weight-bold"> - </span>
                                          </td>
                                          </tr>
                                        </tbody>
                                        <tfoot>
                                          <tr>
                                              <th colspan="3">Total SKS</th>
                                              <th class="text-center">24</th>
                                              <th></th>
                                                                          <th class="text-center">0</th>
                                                                      <th colspan="2">&nbsp;</th>
                                          </tr>
                                          <tr>
                                              <th colspan="3">Indeks Prestasi Semester</th>
                                              <th class="text-center">
                      
                                                                          
                                                                          0.00
                                              </th>
                                              <th colspan="4">&nbsp;</th>
                                          </tr>
                                      </tfoot>
                                  </table>
                                  </div>
                              </div>
                          </div>
                      </div>
                      <div class="tab-pane fade" id="transkrip" role="tabpanel" aria-labelledby="transkrip-tab">
                          <div class="card">
                              <div class="card-body px-0 pb-2">
                                  <div class="table-responsive">
                                      <table class="table align-items-center mb-0">
                                          <thead>
                                              <tr>
                                                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No</th>
                                                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Kur</th>
                                                <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Kode</th>
                                                <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Mata Kuliah</th>
                                                <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Smst</th>
                                                <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">SKS</th>
                                                <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Grade</th>
                                                <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nilai Mutu</th>
                                                <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Bobot</th>
                                              </tr>
                                            </thead>
                                          <tbody>
                                              <tr>
                                                <td><span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1</span>
                                                </td>
                                                <td><span class="text-xs font-weight-bold"> 2016 </span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold"> MIP617101</span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold"> SAINS DASAR</span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold">1</span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold"> 2 </span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold">A </span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold"> 4.00 </span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold"> 8.00 </span>
                                                </td>
                                              </tr>
                                              <tr>
                                                <td><span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2</span>
                                                </td>  
                                                <td><span class="text-xs font-weight-bold"> 2016 </span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold"> MIP617101</span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold"> SAINS DASAR</span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold">1</span>
                                                </td>                     
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold"> 2 </span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold">A </span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold"> 4.00 </span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold"> 8.00 </span>
                                                </td>
                                              </tr>
                                              <tr>
                                                <td><span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3</span>
                                                </td>
                                                <td><span class="text-xs font-weight-bold"> 2016 </span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold"> MIP617101</span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold"> SAINS DASAR</span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold">1</span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold"> 2 </span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold">A </span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold"> 4.00 </span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold"> 8.00 </span>
                                                </td>
                                              </tr>
                                              <tr>
                                                <td><span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;4</span>
                                                </td>
                                                <td><span class="text-xs font-weight-bold"> 2016 </span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold"> MIP617101</span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold"> SAINS DASAR</span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold">1</span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold"> 2 </span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold">A </span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold"> 4.00 </span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold"> 8.00 </span>
                                                </td>
                                              </tr>
                                              <tr>
                                                <td><span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5</span>
                                                </td>
                                                <td><span class="text-xs font-weight-bold"> 2016 </span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold"> MIP617101</span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold"> SAINS DASAR</span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold">1</span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold"> 2 </span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold">A </span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold"> 4.00 </span>
                                                </td>
                                                <td class="align-middle text-center text-sm"><span class="text-xs font-weight-bold"> 8.00 </span>
                                                </td>
                                              </tr>
                                            </tbody>
                                            <tfoot>
                                              <tr>
                                                <th colspan="5">Total</th>
                                                <th class="text-center">89</th>
                                                <th>&nbsp;</th>
                                                <th>&nbsp;</th>
                                                <th style="text-align:right">310,00</th>
                                              </tr>
                                              <tr>
                                              <th colspan="8">Indeks Prestasi Kumulatif</th>
                                              <th style="text-align:right">3,03</th>
                                              </tr>                     
                                            </tfoot>
                                      </table>
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
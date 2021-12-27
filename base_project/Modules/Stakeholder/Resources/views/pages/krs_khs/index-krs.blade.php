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
                <div class="form-group">
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
                <h4 class="ms-1 mb-2">Kartu Rencana Studi</h4>
                    <div class="d-flex align-items-center">
                        <div class="ml-2 w-100 p-1">
                            <div class="p-3 mt-0 rounded text-white stats">
                                <div class="d-flex flex-column">
                                    <table>
                                        <tr>
                                          <td width="30%">NPM</td>
                                          <td width="200%">: 1517051048</td>
                                        </tr>
                                        <tr>
                                          <td>Program Studi</td>
                                          <td>: S1-Biologi Terapan</td>
                                        </tr>
                                        <tr>
                                          <td width="30%">Konsentrasi</td>
                                          <td width="200%">: -</td>
                                        </tr>
                                        <tr>
                                          <td>Pembimbing Akadamik</td>
                                          <td>: DR NUNING NURCAHYANI, M.Sc.</td>
                                        </tr>
                                        <tr>
                                          <td>Semester / IPK</td>
                                          <td>: 10 / 3.03</td>
                                        </tr>
                                        <tr>
                                          <td width="30%">Status Mahasiswa</td>
                                          <td width="200%">: Aktif</td>
                                        </tr>
                                      </table>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                    <div class="row my-0">
                      <div class="col-lg-12 col-md-6 mb-md-0 mb-4">
                          <div class="card">
                              <div class="card-header pb-0">
                                  <div class="row">
                                      <div class="col-lg-6 col-7">
                                          <p class="text-sm mb-0">
                                          </p>
                                      </div>
                                      <div class="col-lg-6 col-5 my-auto text-end">
                                      </div>
                                  </div>
                              </div>
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
                                                  <th class="text-center text-xs font-weight-bold">7</th>
                                                  <th colspan="3">&nbsp;</th>
                                              </tr>
                                              <tr>
                                                  <th colspan="4">Batas SKS</th>
                                                  <th class="text-center text-xs font-weight-bold">24</th>
                                                  <th colspan="3">&nbsp;</th>
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

@endsection
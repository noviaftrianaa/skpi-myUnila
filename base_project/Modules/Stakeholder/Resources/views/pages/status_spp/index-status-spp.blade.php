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
      <div class="col-lg-12 mb-lg-0 mb-4">
        <div class="card z-index-2">
          <div class="card-body p-3">
            <h6 class="ms-0 mb-2"> Keuangan </h6>
              <div class="row nav-tabs-custom">
                
                <div class="d-flex align-items-center">
                  <div class="ml-4 w-100 p-1">
                    <div class="p-3 mt-0 rounded text-white stats">
                      <div class="col-md-15">
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
                    <div class="card-body p-3">
                    <h4 class="ms-0 mb-2">Pembayaran</h4>
                    <div class="table-responsive">
                      
                        <div class="tab-pane fade show active" id="krs" role="tabpanel"
                            aria-labelledby="krs-tab">
                            <div class="card">
                                <div class="card-body px-0 pb-2">
                                    <div class="table-responsive">
                                          <table class="table align-items-center mb-3">
                                            <thead>
                                                <tr>
                                                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No.
                                                    </th>
                                                    <th
                                                        class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                                        Kode Pembayaran</th>
                                                    <th
                                                        class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                                        Tanggal</th>
                                                    <th
                                                        class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                                        Periode</th>
                                                    <th
                                                        class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                                        Switching</th>
                                                    <th
                                                        class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                                        Bank</th>
                                                    <th
                                                        class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">
                                                        Nominal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            1</span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 12345678 </span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 29 Jul 2021, 09:47:35</span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                      <span class="text-xs font-weight-bold">20211</span>
                                                  </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> TELLER </span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                      <span class="text-xs font-weight-bold">
                                                        BTN</span>
                                                  </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 5.700.000 </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            2</span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 12345678 </span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 29 Jul 2021, 09:47:35</span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                      <span class="text-xs font-weight-bold">20211</span>
                                                  </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> TELLER </span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                      <span class="text-xs font-weight-bold">
                                                        BTN</span>
                                                  </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 5.700.000 </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            3</span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 12345678 </span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 29 Jul 2021, 09:47:35</span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                      <span class="text-xs font-weight-bold">20211</span>
                                                  </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> TELLER </span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                      <span class="text-xs font-weight-bold">
                                                        BTN</span>
                                                  </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 5.700.000 </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            4</span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 12345678 </span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 29 Jul 2021, 09:47:35</span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                      <span class="text-xs font-weight-bold">20211</span>
                                                  </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> TELLER </span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                      <span class="text-xs font-weight-bold">
                                                        BTN</span>
                                                  </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 5.700.000 </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            5</span>
                                                    </td>
                                                    <td  class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 12345678 </span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 29 Jul 2021, 09:47:35</span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                      <span class="text-xs font-weight-bold">20211</span>
                                                  </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> TELLER </span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                      <span class="text-xs font-weight-bold">
                                                        BTN</span>
                                                  </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 5.700.000 </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            6</span>
                                                    </td>
                                                    <td  class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 12345678 </span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 29 Jul 2021, 09:47:35</span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                      <span class="text-xs font-weight-bold">20211</span>
                                                  </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> TELLER </span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                      <span class="text-xs font-weight-bold">
                                                        BTN</span>
                                                  </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 5.700.000 </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            7</span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 12345678 </span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 29 Jul 2021, 09:47:35</span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                      <span class="text-xs font-weight-bold">20211</span>
                                                  </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> TELLER </span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                      <span class="text-xs font-weight-bold">
                                                        BTN</span>
                                                  </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 5.700.000 </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            8</span>
                                                    </td>
                                                    <td  class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 12345678 </span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 29 Jul 2021, 09:47:35</span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                      <span class="text-xs font-weight-bold">20211</span>
                                                  </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> TELLER </span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                      <span class="text-xs font-weight-bold">
                                                        BTN</span>
                                                  </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 5.700.000 </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            9</span>
                                                    </td>
                                                    <td  class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 12345678 </span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 29 Jul 2021, 09:47:35</span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                      <span class="text-xs font-weight-bold">20211</span>
                                                  </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> TELLER </span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                      <span class="text-xs font-weight-bold">
                                                        BTN</span>
                                                  </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 5.700.000 </span>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <span class="text-xs font-weight-bold">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                                            10</span>
                                                    </td>
                                                    <td  class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 12345678 </span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 29 Jul 2021, 09:47:35</span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                      <span class="text-xs font-weight-bold">20211</span>
                                                  </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> TELLER </span>
                                                    </td>
                                                    <td class="align-middle text-center text-sm">
                                                      <span class="text-xs font-weight-bold">
                                                        BTN</span>
                                                  </td>
                                                    <td class="align-middle text-center text-sm">
                                                        <span class="text-xs font-weight-bold"> 5.700.000 </span>
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
              </div>
            </div>
    </div>
</div>
            </div>
          </div>
        
  
  
  @endsection
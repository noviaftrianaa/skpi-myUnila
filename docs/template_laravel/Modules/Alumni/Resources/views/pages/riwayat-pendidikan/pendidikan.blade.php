@extends('alumni::layouts.master')

@section('content')
<div class="page-header min-height-100 border-radius-xl mt-4">
<div class="col-lg-12">
    <div class="card h-100">
      <div class="card-header pb-0 p-3">
        <div class="row">
          <div class="col-6 d-flex align-items-center">
            <h6 class="mb-0">Daftar Pendidikan</h6>
          </div>
          <div class="col-6 text-end">
            <button class="btn btn-outline-primary btn-sm"><i class="fa fa-plus"></i></button>
          </div>
        </div>
      </div>
      <div class="card-body p-3 pb-0">
        <ul class="list-group">
          
            <table style="width: 100%; font-size: 11px">
                <thead>
                  <tr class="success">
                    <th width="5%">No</th>
                    <th width="11%" style="text-align: center;">Tingkat</th>
                    <th width="8%">Akreditasi</th>
                    <th width="15%">Satuan Pendidikan</th>
                    <th width="10%">No. Ijazah</th>
                    <th width="10%">Tgl. Ijazah</th>
                    <th width="15%">Pejabat Ttd</th>
                    <th width="10%">Gelar Depan</th>
                    <th width="10%">Gelar Belakang</th>
                    <th width="10%">Ijazah</th>
                  </tr>
                </thead>
                <tbody>
                    <tr class="odd gradeX">
                        <td style="text-align: center;">1</td>
                        <td style="text-align: center;">S1</td>
                        <td style="text-align: center;">A</td>
                        <td>Universitas Lampung</td>
                        <td>04716/26.5.S1/2021</td>
                        <td>23-01-2021</td>
                        <td>Prof. Dr. Karomani, M.Si.</td>
                        <td>-</td>
                        <td>S.T.</td>
                        <td>
                          <button type="button" class="btn btn-warning btn-sm"><i class="fa fa-eye"></i></button>
                        </td>
                      </tr>
                     
                     
                   <tr class="odd gradeX">
                    <td style="text-align: center;">2</td>
                    <td style="text-align: center;">SMA</td>
                    <td style="text-align: center;">A</td>
                    <td>SMAN 10 Bandar Lampung</td>
                    <td>04716/26.5.S1/2021</td>
                    <td>23-01-2021</td>
                    <td>Drs. Izmir Hasan M.Pd.</td>
                    <td>-</td>
                    <td>-</td>
                    <td>
                      <button type="button" class="btn btn-warning btn-sm"><i class="fa fa-eye"></i></button>
                    </td>
                  </tr>
                  <tr class="odd gradeX">
                    <td style="text-align: center;">3</td>
                    <td style="text-align: center;">SMP</td>
                    <td style="text-align: center;">A</td>
                    <td>SMPN 1 Bandar Lampung</td>
                    <td>04716/26.5.S1/2021</td>
                    <td>23-01-2021</td>
                    <td>Drs. Haryanto</td>
                    <td>-</td>
                    <td>-</td>
                    <td>
                      <button type="button" class="btn btn-warning btn-sm"><i class="fa fa-eye"></i></button>
                    </td>
                  </tr>
                  <tr class="odd gradeX">
                    <td style="text-align: center;">4</td>
                    <td style="text-align: center;">SD</td>
                    <td style="text-align: center;">A</td>
                    <td>SDN 2 Rawa Laut</td>
                    <td>04716/26.5.S1/2021</td>
                    <td>23-01-2021</td>
                    <td>Drs. Nursyiwan Zakki</td>
                    <td>-</td>
                    <td>-</td>
                    <td>
                      <button type="button" class="btn btn-warning btn-sm"><i class="fa fa-eye"></i></button>
                    </td>
                  </tr>
                </tbody>
              </table>
        </ul>
      </div>
    </div>
  </div>
</div>
    
    {{-- <p>
        This view is loaded from module: {!! config('alumni.name') !!}
    </p> --}}
@endsection

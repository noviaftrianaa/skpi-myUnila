@extends('alumni::layouts.master')

@section('content')
<div class="container-fluid py-4">
    <div class="row">
      <div class="col-12">
        <div class="card mb-4">
          <div class="card-header pb-0">
            <h6>Riwayat Pekerjaan</h6>
          </div>
          <div class="card-body px-0 pt-0 pb-2">
            <div class="table-responsive p-0">
              <table class="table align-items-center mb-0">
                <thead>
                  <tr>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No.</th>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nama</th>
                    <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Lokasi</th>
                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Lama Bekerja</th>
                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Jabatan</th>
                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Gaji</th> 
                    <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="align-middle text-center">
                        <span class="text-xs font-weight-bold mb-0">1.</span>
                    </td>
                    <td >
                        <span class="text-xs font-weight-bold mb-0">UPT TIK UNILA</span>
                    </td>
                    <td>
                        <span class="text-xs font-weight-bold mb-0">Bandar Lampung</span>
                    </td>
                    <td class="align-middle text-center">
                        <span class="text-xs font-weight-bold mb-0">22 November 2021-sekarang</span>
                      </td>
                    <td class="align-middle text-center">
                        <span class="text-xs font-weight-bold mb-0">Tenaga Ahli</span>
                    </td>
                    <td class="align-middle text-center">
                      <span class="text-secondary text-xs font-weight-bold">-</span>
                    </td>
                    <td class="align-middle text-center">
                        <button type="button" class="btn btn-info btn-sm mt-3 py-1 px-3"><i class="fa fa-pencil text-white"></i></button>
                        |
                        <button type="button" class="btn btn-danger btn-sm mt-3 py-1 px-3"><i class="fa fa-trash text-white"></i></button>
                    </td>
                  </tr>
                  <tr>
                    <td class="align-middle text-center">
                        <span class="text-xs font-weight-bold mb-0">2.</span>
                    </td>
                    <td>
                        <span class="text-xs font-weight-bold mb-0">The Summit Bistro</span>
                    </td>
                    <td>
                        <span class="text-xs font-weight-bold mb-0">Bandar Lampung</span>
                    </td>
                    <td class="align-middle text-center">
                        <span class="text-xs font-weight-bold mb-0">01 Februari 2021-21 November 2021</span>
                    </td>
                    <td class="align-middle text-center">
                        <span class="text-xs font-weight-bold mb-0">Manager</span>
                    </td>
                    <td class="align-middle text-center">
                      <span class="text-secondary text-xs font-weight-bold">5000000</span>
                    </td>
                    <td class="align-middle text-center">
                        <button type="button" class="btn btn-info btn-sm mt-3 py-1 px-3"><i class="fa fa-pencil text-white"></i></button>
                        |
                        <button type="button" class="btn btn-danger btn-sm mt-3 py-1 px-3"><i class="fa fa-trash text-white"></i></button>
                    </td>
                  </tr>
                  <tr>
                    <td class="align-middle text-center">
                        <span class="text-xs font-weight-bold mb-0">3.</span>
                    </td>
                    <td>
                        <span class="text-xs font-weight-bold mb-0">After Beaute, PT Mega Irianto Indonesia</span>
                    </td>
                    <td>
                        <span class="text-xs font-weight-bold mb-0">Bandar Lampung</span>
                    </td>
                    <td class="align-middle text-center">
                        <span class="text-xs font-weight-bold mb-0">04 Januari 2021-01 Februari 2021</span>
                      </td>
                    <td class="align-middle text-center">
                        <span class="text-xs font-weight-bold mb-0">IT Support</span>
                    </td>
                    <td class="align-middle text-center">
                      <span class="text-secondary text-xs font-weight-bold">3890000</span>
                    </td>
                    <td class="align-middle text-center">
                        <button type="button" class="btn btn-info btn-sm mt-3 py-1 px-3"><i class="fa fa-pencil text-white"></i></button>
                        |
                        <button type="button" class="btn btn-danger btn-sm mt-3 py-1 px-3"><i class="fa fa-trash text-white"></i></button>
                    </td>
                  </tr>
                  <tr>
                    <td class="align-middle text-center">
                        <span class="text-xs font-weight-bold mb-0">4.</span>
                    </td>
                    <td>
                        <span class="text-xs font-weight-bold mb-0">PT Angkasa Pura II Persero cabang 601</span>
                    </td>
                    <td>
                        <span class="text-xs font-weight-bold mb-0">Jakarta</span>
                    </td>
                    <td class="align-middle text-center">
                        <span class="text-xs font-weight-bold mb-0">23 Februari 2018-23 Maret 2018</span>
                      </td>
                    <td class="align-middle text-center">
                        <span class="text-xs font-weight-bold mb-0">IT Staff (magang)</span>
                    </td>
                    <td class="align-middle text-center">
                      <span class="text-secondary text-xs font-weight-bold">600000</span>
                    </td>
                    <td class="align-middle text-center">
                        <button type="button" class="btn btn-info btn-sm mt-3 py-1 px-3"><i class="fa fa-pencil text-white"></i></button>
                        |
                        <button type="button" class="btn btn-danger btn-sm mt-3 py-1 px-3"><i class="fa fa-trash text-white"></i></button>
                    </td>
                  </tr>
                  <tr>
                    <td class="align-middle text-center">
                        <span class="text-xs font-weight-bold mb-0">5.</span>
                    </td>
                    <td>
                        <span class="text-xs font-weight-bold mb-0">MooMooBee</span>
                    </td>
                    <td>
                        <span class="text-xs font-weight-bold mb-0">Bandar Lampung</span>
                    </td>
                    <td class="align-middle text-center">
                        <span class="text-xs font-weight-bold mb-0">18 Januari 2016-20 Juni 2020</span>
                      </td>
                    <td class="align-middle text-center">
                        <span class="text-xs font-weight-bold mb-0">Customer Service</span>
                    </td>
                    <td class="align-middle text-center">
                      <span class="text-secondary text-xs font-weight-bold">1800000</span>
                    </td>
                    <td class="align-middle text-center">
                        <button type="button" class="btn btn-info btn-sm mt-3 py-1 px-3"><i class="fa fa-pencil text-white"></i></button>
                        |
                        <button type="button" class="btn btn-danger btn-sm mt-3 py-1 px-3"><i class="fa fa-trash text-white"></i></button>
                    </td>
                  </tr>
        
                 
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    {{-- <p>
        This view is loaded from module: {!! config('alumni.name') !!}
    </p> --}}
@endsection

@extends('alumni::layouts.master')

@section('content')
<div class="container-fluid py-4">
    <div class="card" style="color:rgba(14, 59, 4, 0.733)">
   <div class="p-3 mt-0 rounded">
  <strong>Informasi</strong> 
  <hr>
  Biaya Legalisasi yang telah ditetapkan adalah : <b>Rp 2000,00 /lembar</b>
<br>Transfer ke <b>897654****</b> BNI a.n. <b>Universitas Lampung<b>
</div>
    </div>
    <br>
    <div class="card mb-4">
        <div class="card-header pb-0 p-3">
            <div class="row">
              <div class="col-6 d-flex align-items-center">
                <h6 class="mb-0">Daftar Legalisasi Ijazah & Transkrip</h6>
              </div>
              <div class="col-6 text-end">
                <button class="btn btn-outline-primary btn-sm">+ Pengajuan</i></button>
              </div>
            </div>
          </div>
       
        <div class="card-body px-0 pt-0 pb-2">
          <div class="table-responsive p-0">
            <table class="table align-items-center mb-0">
              <thead>
                <tr>
                  <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No.</th>
                  <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Jumlah Dokumen</th>
                  <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Pengambilan</th>
                  <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Jumlah Bayar</th>
                  <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Tanggal Bayar</th>
                  <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Konfirmasi Pembayaran</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                    <td class="align-middle text-center">
                        <span class="text-xs font-weight-bold mb-0">1.</span>
                      </td>
                      <td class="align-middle text-center">10</td>
                    <td class="align-middle text-center">Dikirim</td>
                    <td class="align-middle text-center">Rp 20.000,00</td>
                    <td class="align-middle text-center">-</td>
                    <td class="align-middle text-center"><button type="button" class="btn btn-danger btn-sm">Unggah Bukti</i></button></td>
                  </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
          {{-- <p>
        This view is loaded from module: {!! config('alumni.name') !!}
    </p> --}}
@endsection

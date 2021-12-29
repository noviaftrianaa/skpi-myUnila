@extends('alumni::layouts.master')

@section('content')
<div class="page-header min-height-100 border-radius-xl mt-4">
<div class="col-lg-12">
    <div class="card h-100">
      <div class="card-header pb-0 p-3">
        <div class="row">
          <div class="col-6 d-flex align-items-center">
            <h6 class="mb-0">Daftar Pelatihan</h6>
          </div>
          <div class="col-6 text-end">
            <button class="btn btn-outline-primary btn-sm"><i class="fa fa-plus"></i></button>
          </div>
        </div>
      </div>
      <div class="card-body p-3 pb-0">
        <ul class="list-group">
          
          <table >
            <thead>
              <tr>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Pelatihan</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Tahun</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Penyelengara</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Lokasi</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Durasi</th>
                <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Dokumen</th>
              </tr>
            </thead>
            <tbody>
              
              <tr>
                <td>1.</td>
                <td>Best Twenty Two Indonesia Next 2018 by Telkomsel</td>
                <td style="color:rgb(90, 196, 187)"><b>2018</td>
                <td>Telkomsel</td>
                <td>Singapura</td>
                <td>1 Minggu</td>
                <td>
                  <button type="button" class="btn btn-warning btn-sm"><i class="fa fa-eye"></i></button>
                </td>
              </td>
              </tr>
              <tr>
                <td>2.</td>
                <td>Microsoft Office Specialist Certified</td>
                <td style="color:rgb(90, 196, 187)"><b>2018</td>
                <td>Microsoft</td>
                <td>Jakarta</td>
                <td>1 Minggu</td>
                <td>
                  <button type="button" class="btn btn-warning btn-sm"><i class="fa fa-eye"></i></button>
                </td>
              </tr>
              <tr>
                <td>3.</td>
                <td>ICAgile Profesional Certified</td>
                <td style="color:rgb(90, 196, 187)"><b>2019</td>
                <td>The Agile Company</td>
                <td>Jakarta</td>
                <td>2 Hari</td>
                <td>
                  <button type="button" class="btn btn-warning btn-sm"><i class="fa fa-eye"></i></button>
                </td>
              </td>
              </tr>
              <tr>
                <td>4.</td>
                <td>Indonesia Professional Certification Authority</td>
                <td style="color:rgb(90, 196, 187)"><b>2019</td>
                <td>LSPPRI</td>
                <td>Lampung</td>
                <td>4 Hari</td>
                <td>
                  <button type="button" class="btn btn-warning btn-sm"><i class="fa fa-eye"></i></button>
                </td>
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

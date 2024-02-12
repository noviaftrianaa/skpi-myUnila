@extends('layouts/layoutMaster')
@include('_partials.__partial.datatable')

@section('title', $judul)

@section('content')
  <div class="row">
    <div class="col-md-12">
      <div class="card">
        <div class="card-header">
          <h4 class="card-title float-start"><i class="fa fa-users"></i> {{ $judul }}</h4>
          <div class="float-end">
            <form action="{{ route('sdm.dosen') }}" method="GET" class="float-end"><label for="tahun">Tahun Ajaran</label><select name="tahun" id="tahun">
              @foreach($ta_list AS $id_thn_ajaran=>$nm_thn_ajaran)
                <option value="{{ $id_thn_ajaran }}" {{ $id_thn_ajaran==$thn?'selected':'' }}>{{ $nm_thn_ajaran }}</option>
              @endforeach
              </select>
            </form>
          </div>
        </div>
        <div class="card-body table-responsive">
          <table class="table table-striped table-bordered" id="table-data">
            <thead>
            <tr>
              <th>No</th>
              <th>Nama Dosen</th>
              <th>NIDN</th>
              <th>NIP</th>
              <th>Fakultas</th>
              <th>Jurusan</th>
              <th>Prodi</th>
              <th>Pendidikan Terakhir</th>
              <th>Jabatan Fungsional</th>
              <th>Pangkat/Golongan</th>
              <th>Status Ikatan</th>
              <th>Status Kepegawaian</th>
              <th>Status Keaktifan</th>
              <th>Email</th>
              <th>ID SINTA</th>
            </tr>
            </thead>
            <tbody>
              @foreach($data AS $no=>$each_data)
                <tr>
                  <td>{{ $no+1 }}</td>
                  <td>{{ $each_data->nm_sdm }}</td>
                  <td>{{ $each_data->nidn }}</td>
                  <td>{{ $each_data->nip }}</td>
                  <td>{{ $each_data->fakultas }}</td>
                  <td>{{ $each_data->jurusan }}</td>
                  <td>{{ $each_data->homebase }}</td>
                  <td>{{ $each_data->nm_jenj_didik }}</td>
                  <td>{{ $each_data->nm_jabfung }}</td>
                  <td>{{ $each_data->kode_gol }}</td>
                  <td>{{ $each_data->nm_ikatan_kerja }}</td>
                  <td>{{ $each_data->nm_stat_pegawai }}</td>
                  <td>{{ $each_data->nm_stat_aktif }}</td>
                  <td>{{ $each_data->email }}</td>
                  <td>{{ $each_data->id_sinta }}</td>
                </tr>
              @endforeach
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
@endsection

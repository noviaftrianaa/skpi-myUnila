<table class="table table-striped table-bordered">
    <thead>
    <tr>
        <th>Asal PT</th>
        <th>Homebase Prodi</th>
        <th>Semester Masuk</th>
        <th>Tanggal Masuk</th>
        <th>Jenis Pendaftaran</th>
        <th>NIM</th>
        <th>Status Keluar</th>
        <th>Tanggal Keluar</th>
    </tr>
    </thead>
    <tbody>
    @foreach($homebase AS $each_data_homebase)
        <tr>
            <td>{{ $each_data_homebase->nm_pt }}</td>
            <td>{{ $each_data_homebase->prodi }}</td>
            <td>{{ $each_data_homebase->nm_smt }}</td>
            <td>{{ tglIndonesia($each_data_homebase->tgl_masuk_sp) }}</td>
            <td>{{ $each_data_homebase->nm_jns_daftar }}</td>
            <td>{{ $each_data_homebase->nim }}</td>
            <td>{{ is_null($each_data_homebase->ket_keluar)?'-':$each_data_homebase->ket_keluar }}</td>
            <td>{{ is_null($each_data_homebase->tgl_keluar)?'-':tglIndonesia($each_data_homebase->tgl_keluar) }}</td>
        </tr>
    @endforeach
    </tbody>
</table>

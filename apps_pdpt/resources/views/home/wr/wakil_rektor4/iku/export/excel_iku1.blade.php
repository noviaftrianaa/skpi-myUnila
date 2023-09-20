
    <table>
        <tr><td colspan="14" class="Header" style="text-align: center; vertical-align: middle;">IKU 1 - Kondisi Lulusan</td></tr>
        <tr>
            <td>No</td>
            <td>NPM</td>
            <td>Nama Alumni</td>
            <td>Fakultas</td>
            <td>Nama Prodi</td>
            <td>Tgl Lulus</td>
            <td>Status</td>
            <td>Masa Tunggu 12 Bulan</td>
            <td>Pendapatan</td>
            <td>1,2 UMP</td>
            <td>Provinsi</td>
            <td>Nama PT Lanjut</td>
            <td>Tgl Masuk PT Lanjut</td>
            <td>Sesuai IKU 1</td>
        </tr>
        @foreach($data as $key => $each_data)
        <tr>
            <td>{{ $key+1 }}</td>
            <td>{{ $each_data->nipd }}</td>
            <td>{{ $each_data->nm_pd }}</td>
            <td>{{ $each_data->y_nm_fakultas }}</td>
            <td>{{ $each_data->y_nm_prodi }}</td>
            <td>{{ $each_data->tgl_keluar }}</td>
            <td>{{ $each_data->l_stat_lulus }}</td>
            <td>{{ $each_data->kerja_or_study_12_bln }}</td>
            <td>{{ $each_data->income_per_bln }}</td>
            <td>{{ $each_data->satu_koma_dua_ump }}</td>
            <td>{{ $each_data->provinsi }}</td>
            <td>{{ $each_data->nm_pt_lnjt }}</td>
            <td>{{ $each_data->wkt_masuk }}</td>
            <td>{{ $each_data->x_data_yes }}</td>
        </tr>
        @endforeach
    </table>




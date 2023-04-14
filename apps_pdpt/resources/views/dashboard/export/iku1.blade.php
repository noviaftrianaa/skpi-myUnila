<table>
    <tr>
        <th colspan="11" style="text-align: center">IKU 1 TAHUN {{ $thn_iku }} UNIVERSITAS LAMPUNG</th>
    </tr>
    <thead>
        <tr>
            <th>No.</th>
            <th>NIM</th>
            <th>Nama Lulusan</th>
            <th>Nama PT</th>
            <th>Nama Prodi</th>
            <th>Tahun Lulus</th>
            <th>Status</th>
            <th>Kurang dari sama dengan 6 Bulan</th>
            <th>Rata2 Pendapatan</th>
            <th>Provinsi</th>
            <th>1,2 UMP</th>
            <th>Memenuhi IKU</th>
        </tr>
    </thead>
    <tbody>
        @foreach ($data as $no=>$item)
            <tr>
                <td>{{ ($no+1) }}</td>
                <td>{{ $item->nipd }}</td>
                <td>{{ $item->nm_pd }}</td>
                <td>{{ $item->nm_sp }}</td>
                <td>{{ $item->nm_prod }}</td>
                <td>{{ $item->thn_lulus }}</td>
                <td>{{ $item->stat_lulus }}</td>
                <td>{{ $item->kurang_dari_6_bulan }}</td>
                <td>{{ number_format($item->income_per_bln, 0, ',', '.') }}</td>
                <td>{{ $item->nm_wil }}</td>
                <td>{{ number_format($item->besaran_umr, 0, ',', '.') }}</td>
                <td>{{ $item->memenuhi_iku }}</td>
            </tr>
        @endforeach
    </tbody>
</table>
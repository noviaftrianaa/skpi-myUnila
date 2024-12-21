@foreach($status_smt AS $prodi=>$data)
    <table class="table table-striped table-bordered mt-4">
        <thead>
        <tr><th colspan="10">{{ $prodi }}</th></tr>
        <tr>
            <th>Semester</th>
            <th>Status Semester</th>
            <th>Total SKS</th>
            <th>IPK</th>
            <th>SKS Reguler</th>
            <th>SKS MBKM</th>
            <th>Total SKS</th>
            <th>IP</th>
            <th>Pembiayaan</th>
            <th>Biaya Semester</th>
        </tr>
        </thead>
        <tbody>
        @foreach($data AS $each_data)
            <tr>
                <td>{{ $each_data->nm_smt }}</td>
                <td>{{ $each_data->nm_stat_mhs }}</td>
                <td>{{ number_format($each_data->total_sks, 0, ',', '.') }}</td>
                <td>{{ $each_data->ipk }}</td>
                <td>{{ ($each_data->sks_reg+0).' SKS' }}</td>
                <td>{{ ($each_data->sks_mbkm+0).' SKS' }}</td>
                <td>{{ ($each_data->sks_mbkm+$each_data->sks_reg).' SKS' }}</td>
                <td>{{ rtrim(rtrim(number_format($each_data->ips, 2, ',', '.'), '0'), ',') }}</td>
                <td>{{ $each_data->nm_pembiayaan }}</td>
                <td>Rp {{ number_format($each_data->biaya_smt, 0, ',', '.') }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>
@endforeach

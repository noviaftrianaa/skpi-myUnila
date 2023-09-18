<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
</head>
<body>
    <table border="1">
        <tr><td colspan="4" class="Header" style="text-align: center; vertical-align: middle;">IKU 1 - Kondisi Lulusan</td></tr>
        <tr>
            <td>No</td>
            <td>NPM</td>
            <td>Nama Alumni</td>
            <td>Tanggal Lulus</td>
        </tr>
        @foreach($data as $key => $each_data)
        <tr>
            <td>{{ $key+1 }}</td>
            <td>{{ $each_data->nipd }}</td>
            <td>{{ $each_data->nm_pd }}</td>
            <td>{{ $each_data->tgl_keluar }}</td>
        </tr>
        @endforeach
    </table>
</body>



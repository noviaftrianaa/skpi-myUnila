@extends('templates.layout-surat')

@section('konten')
<p>
    Berdasarkan SK Cuti Akademik nomor:
    <strong>{{ $nomor_sk_cuti ?? '___________' }}</strong> tanggal
    <strong>{{ $tgl_sk_cuti ?? '___________' }}</strong> dan Bukti Pembayaran UKT Semester Berjalan,
    Kepala Biro Akademik dan Kemahasiswaan (BAK) Universitas Lampung menerangkan bahwa:
</p>

<table class="data">
    <tr><td class="label">Nama</td><td>: {{ $nm_mahasiswa ?? '___________' }}</td></tr>
    <tr><td class="label">NPM</td><td>: {{ $nim ?? '___________' }}</td></tr>
    <tr><td class="label">Program Studi</td><td>: {{ $nm_prodi ?? '___________' }}</td></tr>
    <tr><td class="label">Fakultas</td><td>: {{ $nm_fakultas ?? '___________' }}</td></tr>
</table>

<p>
    adalah benar mahasiswa aktif Universitas Lampung dan telah melakukan heregistrasi/her pada semester berjalan
    setelah menjalani cuti akademik.
</p>

<p>
    Demikian Surat Keterangan Heregistrasi ini dibuat untuk dipergunakan sebagaimana mestinya.
</p>
@endsection

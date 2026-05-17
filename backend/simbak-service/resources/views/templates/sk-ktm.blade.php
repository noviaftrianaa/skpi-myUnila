@extends('templates.layout-surat')

@section('konten')
<p>
    Berdasarkan Surat Keterangan Mahasiswa Aktif dari Fakultas {{ $nm_fakultas ?? '___________' }} nomor:
    <strong>{{ $nomor_surat_ket_aktif ?? '___________' }}</strong> dan Surat Laporan Kehilangan dari Kepolisian nomor:
    <strong>{{ $nomor_surat_polisi ?? '___________' }}</strong>, Kepala Biro Akademik dan Kemahasiswaan (BAK)
    Universitas Lampung, menerangkan bahwa:
</p>

<table class="data">
    <tr><td class="label">Nama</td><td>: {{ $nm_mahasiswa ?? '___________' }}</td></tr>
    <tr><td class="label">NPM</td><td>: {{ $nim ?? '___________' }}</td></tr>
    <tr><td class="label">Program Studi</td><td>: {{ $nm_prodi ?? '___________' }}</td></tr>
    <tr><td class="label">Fakultas</td><td>: {{ $nm_fakultas ?? '___________' }}</td></tr>
</table>

<p>setelah dilakukan verifikasi dan validasi oleh Bagian Akademik BAK, adalah benar mahasiswa aktif Universitas Lampung.</p>

<p>Demikian surat keterangan ini dibuat sebagai pengganti Kartu Tanda Mahasiswa (KTM).</p>
@endsection

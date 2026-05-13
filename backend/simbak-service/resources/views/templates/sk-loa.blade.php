@extends('templates.layout-surat')

@section('konten')
<p>
    Kepala Biro Akademik dan Kemahasiswaan (BAK) Universitas Lampung dengan ini menerangkan bahwa:
</p>

<table class="data">
    <tr><td class="label">Nama</td><td>: {{ $nm_mahasiswa ?? '___________' }}</td></tr>
    <tr><td class="label">NPM</td><td>: {{ $nim ?? '___________' }}</td></tr>
    <tr><td class="label">Program Studi</td><td>: {{ $nm_prodi ?? '___________' }}</td></tr>
    <tr><td class="label">Fakultas</td><td>: {{ $nm_fakultas ?? '___________' }}</td></tr>
    @if(!empty($angkatan))
    <tr><td class="label">Angkatan</td><td>: {{ $angkatan }}</td></tr>
    @endif
</table>

<p>
    adalah benar telah diterima sebagai Mahasiswa Baru Universitas Lampung pada program studi tersebut di atas.
    Yang bersangkutan dinyatakan terdaftar dan berhak mengikuti seluruh kegiatan akademik di Universitas Lampung.
</p>

<p>
    Surat Keterangan ini diterbitkan sebagai Letter of Acceptance (LoA) atas permintaan yang bersangkutan untuk
    dipergunakan sebagaimana mestinya.
</p>
@endsection

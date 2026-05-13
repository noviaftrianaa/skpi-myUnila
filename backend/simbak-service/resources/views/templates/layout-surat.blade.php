<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>{{ $title ?? 'Surat Keterangan' }}</title>
<style>
    @page { size: A4; margin: 1.5cm 2cm; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #000; line-height: 1.5; }
    .header { border-bottom: 4px double #000; padding-bottom: 8px; }
    .header table { width: 100%; border-collapse: collapse; }
    .header td.logo { width: 90px; vertical-align: top; padding-right: 12px; }
    .header td.text { text-align: center; vertical-align: middle; }
    .header td.text .line1 { font-size: 13pt; }
    .header td.text .line2 { font-size: 13pt; font-weight: bold; }
    .header td.text .line3 { font-size: 10pt; }
    .judul { text-align: center; margin: 28px 0 6px; }
    .judul .title { font-size: 14pt; font-weight: bold; text-decoration: underline; letter-spacing: 1px; }
    .judul .nomor { font-size: 12pt; }
    .nomor-tabel { width: auto; margin: 0 auto; border-collapse: collapse; }
    .nomor-tabel td { padding: 0 4px; }
    .konten { text-align: justify; margin-top: 16px; }
    .konten p { margin: 8px 0; }
    .konten table.data { margin-top: 8px; margin-left: 0; border-collapse: collapse; }
    .konten table.data td { padding: 2px 8px; vertical-align: top; }
    .konten table.data td.label { width: 140px; }
    .ttd { margin-top: 36px; }
    .ttd table { width: 100%; border-collapse: collapse; }
    .ttd td { vertical-align: top; }
    .ttd .right { text-align: left; padding-left: 280px; }
    .ttd .sign-space { height: 90px; }
    .footer-catatan { position: fixed; bottom: 0; left: 0; right: 0; font-size: 7pt; color: #555; border-top: 1px solid #999; padding-top: 4px; }
</style>
</head>
<body>
<div class="header">
    <table>
        <tr>
            <td class="logo">
                {{-- Logo placeholder, ganti dengan path absolut atau base64 jika diperlukan --}}
                <div style="width: 80px; height: 80px; border: 1px solid #999; text-align: center; line-height: 80px; font-size: 9pt;">LOGO</div>
            </td>
            <td class="text">
                <div class="line1">KEMENTERIAN PENDIDIKAN TINGGI, SAINS,</div>
                <div class="line1">DAN TEKNOLOGI</div>
                <div class="line2">UNIVERSITAS LAMPUNG</div>
                <div class="line3">Jalan Prof. Dr. Sumantri Brojonegoro No. 1 Bandar Lampung 35145</div>
                <div class="line3">Telepon (0721) 701609, 702673, 702971, 703475, 701252, Fax. (0721) 702767</div>
                <div class="line3">laman http://unila.ac.id</div>
            </td>
        </tr>
    </table>
</div>

<div class="judul">
    <div class="title">SURAT KETERANGAN</div>
    <table class="nomor-tabel"><tr>
        <td>No:</td>
        <td>{{ $nomor_surat ?? '' }}/UN26.05/KM.00.03/{{ $tahun ?? date('Y') }}</td>
    </tr></table>
</div>

<div class="konten">
    @isset($body_html)
        {!! $body_html !!}
    @else
        @yield('konten')
    @endisset
</div>

<div class="ttd">
    <table>
        <tr>
            <td class="right">
                {{ $tempat_terbit }}, {{ $tgl_terbit }}<br>
                {{ $pejabat_jabatan }},
                <div class="sign-space">&nbsp;</div>
                <strong>{{ $pejabat_nama }}</strong><br>
                NIP {{ $pejabat_nip }}
            </td>
        </tr>
    </table>
</div>

<div class="footer-catatan">
    <strong>Catatan:</strong><br>
    1. UU ITE No. 11 Tahun 2008 Pasal 5 Ayat 1 "Informasi Elektronik dan/atau Dokumen Elektronik dan/atau hasil cetaknya merupakan alat bukti yang sah"<br>
    2. Dokumen ini telah ditandatangani secara elektronik menggunakan sertifikat elektronik yang diterbitkan oleh BSrE
</div>
</body>
</html>

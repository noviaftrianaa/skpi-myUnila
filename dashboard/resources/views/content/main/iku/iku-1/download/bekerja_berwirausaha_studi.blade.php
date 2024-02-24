
<table>
  <tr><td colspan="14" class="Header" style="text-align: center; vertical-align: middle;">IKU 1 - Lulusan Mendapat Pekerjaan yang Layak</td></tr>
  <tr>
      <td>No</td>
      <td>NPM</td>
      <td>Nama Alumni</td>
      <td>Fakultas</td>
      <td>Nama Prodi</td>
      <td>Jenjang</td>
      <td>Tgl Lulus / Kompre</td>
      <td>Status Lulusan</td>
      <td>Apakah Kerja Sebelum Lulus ?</td>
      <td>Bulan dapat Kerja</td>
      <td>Pendapatan</td>
      <td>1,2 UMP</td>
      <td>Provinsi</td>
      <td>Nama PT Lanjut Studi</td>
      <td>Nama Prodi Lanjut Studi</td>
      <td>Tgl Masuk PT Lanjut</td>
      <td>Point IKU 1</td>
  </tr>
  {{-- @if (!isset($data)) --}}
    @foreach($data as $key => $each_data)
    <tr>
        <td>{{ $key+1 }}</td>
        <td>{{ $each_data->nipd }}</td>
        <td>{{ $each_data->nm_pd }}</td>
        <td>{{ $each_data->nm_fakultas }}</td>
        <td>{{ $each_data->nm_prodi }}</td>
        <td>{{ $each_data->nm_jenj_didik }}</td>
        <td>{{ $each_data->tgl_keluar }}</td>
        <td>{{ $each_data->status_lulusan }}</td>
        <td>{{ $each_data->a_kerja_sblm_lulus }}</td>
        <td>{{ $each_data->bln_dpt_kerja }}</td>
        <td>{{ $each_data->income_per_bln }}</td>
        <td>{{ $each_data->ump }}</td>
        <td>{{ $each_data->nm_wil }}</td>
        <td>{{ $each_data->nm_pt_lnjt }}</td>
        <td>{{ $each_data->nm_prodi_lnjt }}</td>
        <td>{{ $each_data->wkt_masuk_lnjt_study }}</td>
        <td>{{ $each_data->point }}</td>
    </tr>
    @endforeach
  {{-- @else
    <tr></tr>
  @endif --}}
</table>

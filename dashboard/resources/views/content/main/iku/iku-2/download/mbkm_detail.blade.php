
<table>
  <tr><td colspan="14" class="Header" style="text-align: center; vertical-align: middle;">IKU 2 - Mahasiswa MBKM Detail</td></tr>
  <tr>
      <td>No</td>
      <td>NPM</td>
      <td>Nama Mahasiswa</td>
      <td>Fakultas</td>
      <td>Nama Prodi</td>
      <td>Jenjang</td>
      <td>Semester</td>
      <td>Kategori MBKM</td>
      <td>Nama Program</td>
      <td>SKS Konversi</td>
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
        <td>{{ $each_data->id_smt }}</td>
        <td>{{ $each_data->nm_jns_akt_mhs }}</td>
        <td>{{ $each_data->judul_akt_mhs }}</td>
        <td>{{ $each_data->sks_konversi }}</td>
    </tr>
    @endforeach
  {{-- @else
    <tr></tr>
  @endif --}}
</table>

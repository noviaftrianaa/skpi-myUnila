
<table>
  <tr><td colspan="14" class="Header" style="text-align: center; vertical-align: middle;">IKU 2 - Mahasiswa Prestasi</td></tr>
  <tr>
      <td>No</td>
      <td>NPM</td>
      <td>Nama Mahasiswa</td>
      <td>Fakultas</td>
      <td>Nama Prodi</td>
      <td>Jenjang</td>
      <td>Tahun Prestasi</td>
      <td>Nama Prestasi</td>
      <td>Tingkat Prestasi</td>
      <td>Peringkat</td>
      <td>Point</td>
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
        <td>{{ $each_data->thn_prestasi }}</td>
        <td>{{ $each_data->nm_prestasi }}</td>
        <td>{{ $each_data->nm_tkt_prestasi }}</td>
        <td>{{ $each_data->peringkat }}</td>
        <td>{{ $each_data->point }}</td>
    </tr>
    @endforeach
  {{-- @else
    <tr></tr>
  @endif --}}
</table>

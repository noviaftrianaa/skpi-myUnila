
<table>
  <tr><td colspan="14" class="Header" style="text-align: center; vertical-align: middle;">IKU 2 - Mahasiswa MBKM Agregat</td></tr>
  <tr>
      <td>No</td>
      <td>NPM</td>
      <td>Nama Mahasiswa</td>
      <td>Fakultas</td>
      <td>Nama Prodi</td>
      <td>Jenjang</td>
      <td>Total Konversi</td>
      <td>Point IKU 2</td>
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
        <td>{{ $each_data->total_konversi }}</td>
        <td>{{ $each_data->total_point }}</td>
    </tr>
    @endforeach
  {{-- @else
    <tr></tr>
  @endif --}}
</table>

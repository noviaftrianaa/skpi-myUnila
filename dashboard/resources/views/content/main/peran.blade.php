@extends('layouts/layoutMaster')

@section('title', 'Ganti Peran')

@section('content')
  <div class="d-flex justify-content-between mx-3">
    <h4 class="my-3">Ganti Peran</h4>
    <a href="{{ url('main') }}" class="btn btn-primary"><i class="ti ti-home me-2"></i>Back to Dashboard</a>
  </div>

    <div class="card mx-3">
        <div class="card-header border-bottom">
            <h5 class="card-title">Peran</h5>
        </div>
        <div class="card-body py-3">
          @foreach ($peran as $item)
          <button data-id="{{ $item->id_peran }}" class="btn btn-{!! $item->id_peran==session()->get('login.role')->id_peran ? 'success' : 'primary' !!} p-2 me-2" type="button">{{ $item->nm_peran }} {!! $item->id_peran==session()->get('login.role')->id_peran ? '<i class="fas fa-check ms-2"></i>' : '' !!} </button>
          @endforeach
        </div>
    </div>
@endsection

@section('page-script')
<script>
  $(document).ready(function() {
    $('button').on('click', function() {
      var id = $(this).data('id');
      window.location.href = "{{ route('main-changePeran') }}"+"?id_peran="+id;
    });
  });
</script>
@endsection

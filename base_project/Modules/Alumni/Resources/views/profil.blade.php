@extends('alumni::layouts.master')

@section('content')
<div class="col-12 mt-4">
  <div class="card h-100">
    <div class="card-header pb-0 p-3">
      <div class="row">
        <div class="col-md-8 d-flex align-items-center">
          <h6 class="mb-0">Status Tugas Akhir</h6>
        </div>
        <div class="col-md-4 text-end">
          <a href="javascript:;">
            <i class="fas fa-cog text-secondary text-sm" data-bs-toggle="tooltip" data-bs-placement="top" title="Ubah"></i>
          </a>
        </div>
      </div>
    </div>
    <div class="card-body p-3">
      <p class="text-sm">
        - 
      </p>
      <hr class="horizontal gray-light my-4">
      <ul class="list-group">
        <li class="list-group-item border-0 ps-0 pt-0 text-sm"><strong class="text-dark">No. SK Kelulusan:</strong> &nbsp; -</li>
        <li class="list-group-item border-0 ps-0 text-sm"><strong class="text-dark">NINA:</strong> &nbsp; 55202202100064</li>
        <li class="list-group-item border-0 ps-0 text-sm"><strong class="text-dark">No. Ijazah:</strong> &nbsp; 04716/26.5 S1/2021</li>
        <li class="list-group-item border-0 ps-0 text-sm"><strong class="text-dark">Program:</strong> &nbsp; Sarjana</li>
        <li class="list-group-item border-0 ps-0 text-sm"><strong class="text-dark">Program Studi:</strong> &nbsp; Teknik Informatika</li>
        
      </ul>
    </div>
  </div>
</div>
</div>
    
    {{-- <p>
        This view is loaded from module: {!! config('alumni.name') !!}
    </p> --}}
@endsection

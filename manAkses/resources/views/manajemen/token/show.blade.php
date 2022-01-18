@extends('template.default.app')
@section('title','Token URI Sequence')
@extends('__partial.datatable')

@section('content')
    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title"><i class="fa fa-list"></i> Token URI Sequence</h3>
        </div><!-- /.card-header -->
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-striped table-hover text-xs" id="table-data" style="width: 100% !important">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Accessed URI</th>
                        <th>Sequence</th>
                        <th>Hit Count</th>
                        <th>First Hit</th>
                        <th>Last Hit</th>
                      </tr>
                    </thead>
                    <tbody>
                        @foreach($data as $no=>$item)
                        <tr>
                            <td>{{$no+1}}</td>
                            <td>{{$item->accessed_uri}}</td>
                            <td>{{$item->sequence}}</td>
                            <td>{{$item->hit_count}}</td>
                            <td>{{$item->first_hit}}</td>
                            <td>{{$item->last_hit}}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>

@endsection
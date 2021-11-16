{!! Form::open(['url' => $url,  'method' => 'delete', 'class' => 'delete_form', 'style' => 'display: inline;']) !!}
<button class="btn btn-xs btn-danger btn-flat btn-delete" data-toggle="tooltip" data-placement="top" title="{{ $title }}">
    <i class="fa fa-trash-o"></i>
</button>
{!! Form::close() !!}
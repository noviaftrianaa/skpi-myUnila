<form action="{{ $url }}" class="delete_form" style="display: inline;" method="POST">
    @csrf
    @method('delete')
<button class="btn btn-xs btn-danger btn-flat btn-delete" data-toggle="tooltip" data-placement="top" title="{{ $title }}">
    <i class="fa fa-trash-o"></i>
</button>
</form>

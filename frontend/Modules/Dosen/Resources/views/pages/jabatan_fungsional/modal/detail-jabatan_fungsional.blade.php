<div class="modal fade" id="modal-default" tabindex="-1" role="dialog" aria-labelledby="modal-default"
    aria-hidden="true">
    <div class="modal-dialog modal- modal-dialog-centered modal-" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h6 class="modal-title" id="modal-title-default">Detail Jabatan Fungsional</h6>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">×</span>
                </button>
            </div>
            <div class="modal-body">
                <dl class="row my-3">
                    @foreach ($listJabatanFungsional as $key => $value)
                        @if ($key > 0)
                            @continue
                        @endif
                        @foreach ($value as $key => $value)
                            <dt class="col-sm-6">{{ Str::upper($key) }}</dt>
                            <dd class="col-sm-6">{{ $value }}</dd>
                        @endforeach
                    @endforeach
                </dl>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary"><i class="fa fa-pencil-square-o"></i> Edit</button>
            </div>
        </div>
    </div>
</div>

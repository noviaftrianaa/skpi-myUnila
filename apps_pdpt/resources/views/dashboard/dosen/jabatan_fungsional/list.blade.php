<!-- Modal -->
<div class="modal fade" id="modal" role="dialog">
    <div class="modal-dialog modal-xl">
        <!-- Modal content-->
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title"><i class="fa fa-table"></i> Daftar Dosen</h5>
                <button type="button" class="btn-close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <div class="col-md-12" style="margin-bottom:20px;">
                    <label>Nama Berdasarkan Abjad : </label>
                    <div class="text-center">
                        <div id="charList" class="btn-group btn-group-md">
                            <button type="button" class="btn btn-primary active" data-value="all">Semua</button>
                            @foreach(range('A','Z') as $char)
                                <button type="button" class="btn btn-default" data-value="{{$char}}">{{$char}}</button>
                            @endforeach
                        </div>
                    </div>
                </div>
                <div class="table-responsive">
                    <table id="datatable" class="table table-striped dataTable" width="100%">
                        <thead>
                        <tr>
                            <th>Nama</th>
                            <th>NIDN</th>
                            <th>NIP</th>
                            <th>JK</th>
                            <th>Program Studi</th>
                        </tr>
                        </thead>
                        <tfoot>
                        <tr>
                            <th>Nama</th>
                            <th>NIDN</th>
                            <th>NIP</th>
                            <th>JK</th>
                            <th>Program Studi</th>
                        </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

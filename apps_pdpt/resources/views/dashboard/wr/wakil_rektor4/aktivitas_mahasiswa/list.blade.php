<!-- Modal -->
<div class="modal fade" id="modal" role="dialog">
    <div class="modal-dialog modal-xl">
        <!-- Modal content-->
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title"><i class="fa fa-table"></i> Daftar Mahasiswa</h5>
                <button type="button" class="btn-close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="modal-body">
                <div class="col-md-12" style="margin-bottom:20px;">
                    <label>Nama Mahasiswa Berdasarkan Abjad : </label>
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
                            <th>Nama Masiswa</th>
                            <th>NPM</th>
                            <th>Program Studi</th>
                            <th>Jenis Aktivitas</th>
                            <th>Judul Aktivitas</th>
                            <th>Semester</th>
                        </tr>
                        </thead>
                        {{-- <tfoot>
                        <tr>
                            <th>NPM</th>
                            <th>Nama Masiswa</th>
                            <th>Program Studi</th>
                            <th>nm_jns_akt_mhs</th>
                            <th>judul_akt_mhs</th>
                            <th>judul_akt_mhs</th>
                        </tr>
                        </tfoot> --}}
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

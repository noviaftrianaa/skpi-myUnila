<!-- Modal -->
<div class="modal fade" id="modal" role="dialog">
    <div class="modal-dialog"  style="width:90%;">
        <!-- Modal content-->
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">&times;</button>
                <h4 style="color:red;"><i class="fa fa-table"></i> Daftar Dosen</h4>
            </div>
            <div class="modal-body">
                <div class="col-md-12" style="margin-bottom:20px;">
                    <label>Nama Berdasarkan Abjad : </label>
                    <center>
                        <div id="charList" class="btn-group">
                            <button type="button" class="btn btn-primary active" data-value="all">Semua</button>
                            @foreach(range('A','Z') as $char)
                                <button type="button" class="btn btn-default" data-value="{{$char}}">{{$char}}</button>
                            @endforeach
                        </div>
                    </center>
                </div>
                <table id="datatable" class="dataTable striped border bordered" cellspacing="0" width="100%">
                    <thead>
                    <tr>
                        <th>Nama</th>
                        <th>NIDN</th>
                        <th>NIP</th>
                        <th>JK</th>
                        <th>Tgl Lahir</th>
                        <th>Perguruan Tinggi</th>
                        <th>Program Studi</th>
                    </tr>
                    </thead>
                    <tfoot>
                    <tr>
                        <th>Nama</th>
                        <th>NIDN</th>
                        <th>NIP</th>
                        <th>JK</th>
                        <th>Tgl Lahir</th>
                        <th>Perguruan Tinggi</th>
                        <th>Program Studi</th>
                    </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    </div>
</div>

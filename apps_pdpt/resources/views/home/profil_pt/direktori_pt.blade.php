@extends('template.default')

@section('content')
    <div class="row">
        <div class="col-md-12 col-12">
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title"><i class="fa fa-graduation-cap mr-2"></i> {{ strtoupper(Judul()) }}</h3>
                </div>
                <div class="card-body">
                    <div class="d-lg-flex d-block mb-3 px-2">
                        <div class="btn-group">
                            <button class="btn btn-warning text-dark btn-sm reload_data">
                                <i class="fa fa-refresh reload-card"></i>
                                Reload Data
                            </button>
                        </div>
                        <span class="text-dark p-2" id="name"></span>
                        <div class="ml-auto">
                            <div class="input-group">
                                <input type="text" id="search" placeholder="Pencarian" class="form-control">
                                <div class="input-group-append">
                                    <button class="btn btn-primary btn-sm" data-toggle="tooltip" data-placement="top" title="Cari">
                                        <i class="fa fa-search search-icon"></i>
                                    </button>
                                </div>
                            </div> 
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-stripped table-hover" id="table-data" style="width:100% !important">
                            <thead>
                                <tr>
                                    <th width="5%" class="text-bold">No.</th>
                                    <th class="text-bold">Lembaga</th>
                                    <th class="text-bold text-center">Jumlah Dosen</th>
                                    <th class="text-bold text-center">Jumlah Tendik</th>
                                    <th width="7%" class="text-bold text-center">#</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade modal-fullscreen" id="exampleModal" tabindex="-1" role="dialog"
        aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl" role="document">
            <div class="modal-content">
                <div class="modal-header pb-0">
                    <div class="float-left">
                        <p>
                            <span id="txt1_modal"></span>
                            <span id="txt2_modal"></span>
                            <span id="txt3_modal"></span>
                            <span id="txt4_modal"></span>
                        </p>
                    </div>
                    <div class="float-right mt-3">
                        <button id="btn_modal_back" class="btn btn-primary mr-1"><i class="fas fa-arrow-left"></i></button>
                        <button id="btn_modal_close" class="btn btn-danger" data-dismiss="modal" aria-label="Close"><i
                                class="fas fa-times"></i></button>
                    </div>
                </div>
                <div class="modal-body">
                    <div id="x_tb_01">
                        <table id="tb_01" class="table table-bordered table-striped" style="width:100% !important">
                            <thead class="bg-info text-center"></thead>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@push('css')
<link href="{{asset('bower_components/datatables/media/css/dataTables.bootstrap4.css')}}" rel="stylesheet">
<style>
    .modal.modal-fullscreen .modal-dialog {
        width: 100vw;
        height: 100vh;
        margin: 0;
        padding: 0;
        max-width: none;
    }

    .modal.modal-fullscreen .modal-content {
        height: auto;
        height: 100vh;
        border-radius: 0;
        border: none;
    }

    .modal.modal-fullscreen .modal-body {
        overflow-y: auto;
    }
</style>
@endpush

@push('js')
<script type="text/javascript" src="{{ asset('bower_components/datatables/media/js/jquery.dataTables.min.js')}}"></script>
<script type="text/javascript" src="{{ asset('bower_components/datatables/media/js/dataTables.bootstrap4.min.js')}}"></script>
<script>
    function datatables(link)
    {
        let table = $('#table-data').DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: link
            },
            columns: [
                { data: 'DT_RowIndex', orderable: false, searchable: false },
                { data: 'nm_lemb' },
                { data: 'jml_dosen', className: 'text-center', render: function(data,type,row) { return (data) ? data : 0; } },
                { data: 'jml_tendik', className: 'text-center', render: function(data,type,row) { return (data) ? data : 0; } },
                { data: 'aksi', className: 'text-center', orderable: false }
            ],
            "language": {
                "decimal":        "",
                "emptyTable":     "Tidak ada data pada tabel",
                "info":           "Menampilkan _START_ sampai _END_ dari _TOTAL_ total data",
                "infoEmpty":      "Tidak ada yang ditampilkan",
                "infoFiltered":   "(Terfilter dari  _MAX_ total entitas)",
                "infoPostFix":    "",
                "thousands":      ",",
                "lengthMenu":     "Menampilkan _MENU_ entitas",
                "loadingRecords": "Loading...",
                "processing":     "<span class='fa-stack fa-lg'>\n\<i class='fa fa-spinner fa-spin fa-stack-2x fa-fw'></i>\n\</span>&emsp;Mohon Menunggu ...",
                "search":         "Pencarian:",
                "zeroRecords":    "Tidak ada data yang cocok",
                "paginate": {
                    "first":      "Pertama",
                    "last":       "Terakhir",
                    "next":       "Selanjutnya",
                    "previous":   "Sebelumnya"
                },
                "aria": {
                    "sortAscending":  ": activate to sort column ascending",
                    "sortDescending": ": activate to sort column descending"
                }
            },
            sDom: 'rt<"row"<"col-sm-12 col-md-3"l><"col-sm-12 col-md-3"i><"col-sm-12 col-md-6"p>>'
        } );
        return table;
    }
    
    $(document).ready( function () {

        let url = window.location.href+'/data';
        var nProdi = ['b4017e14-c4fb-4370-bedc-29fae31c183b','9b467728-ca97-4922-a9bd-75eb7ec512e1','74393186-b8fb-4f21-b4ac-8e3f1f15b6b3'];
        let table = datatables(url);
        let name = $('#name').append(`Universitas Lampung`);

        $('#search').on('change', function () {
            table.search($('#search').val()).draw();
        } );
        
        $('.reload_data').on('click', function() {
            table.clear().destroy();
            table = datatables(url);
            $('#name').html('Universitas Lampung');
        });

        table.on('click', '#btnDetail', function(event) {
            var urls;
            event.preventDefault();
            //CHECK ID
            let sms = $(this).data('sms');
            let fak = $(this).data('fak');
            let jur = $(this).data('jur');
            
            if(sms!='' && fak=='' && jur=='') {
                $('#name').append(' &#187; Fakultas '+$(this).data('name'));
                urls = url + '?id_fak_unila='+sms;
                //REDRAW TABLE
                table.clear().destroy();
                table = datatables(urls);
            } else if (sms!='' && fak!='' && jur=='') {
                if(nProdi.includes(fak.toLowerCase())) {
                    if ($.fn.dataTable.isDataTable($('#tb_01'))) {
                        $('#tb_01').DataTable().destroy();
                    }
                    $('#txt1_modal').text('Program Studi '+$(this).data('name'));
                    tblDetail(sms);
                } else {
                    $('#name').append(' &#187; '+$(this).data('name'));
                    urls = url + '?id_jur_unila='+sms;
                    //REDRAW TABLE
                    table.clear().destroy();
                    table = datatables(urls);
                }
            } else {
                if ($.fn.dataTable.isDataTable($('#tb_01'))) {
                    $('#tb_01').DataTable().destroy();
                }
                $('#txt1_modal').text('Program Studi '+$(this).data('name'));
                tblDetail(sms);
            }
        });
    });

    function tblDetail(sms)
    {
        $("#btn_modal_close").show();
        $("#btn_modal_back").hide();
        $('#exampleModal').modal('show');
        $('#tb_01').DataTable({
            processing: true,
            serverSide: true,
            ajax: {
                url: "{{ route('profil_pt.direktori_pt.data.detail') }}",
                data: {
                    id_prodi: sms
                }
            },
            columns: [
                { data: 'DT_RowIndex', title: 'No.', width: '5px', className: 'text-center' },
                { data: 'nm_sdm', title: 'Nama', className: 'text-left' },
                { data: 'nidn', title: 'NIDN', className: 'text-center' },
                { data: 'nm_jns_sdm', title: 'Dosen/Tendik', className: 'text-center' },
                { data: 'nm_lemb', title: 'Lembaga', className: 'text-center' },
                {
                    data: 'id_stat_aktif',
                    title: 'Status',
                    className: 'text-center',
                    render: function(data,type,row) {
                        return (data==1) ? `<span class="text-success">${row.nm_stat_aktif}</span>` : `<span class="text-danger">${row.nm_stat_aktif}</span>`;
                    }
                }
            ]
        });
    }
</script>
@endpush
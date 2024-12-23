@section('vendor-style')
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/datatables-checkboxes-jquery/datatables.checkboxes.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css') }}">
    <!-- Row Group CSS -->
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/datatables-rowgroup-bs5/rowgroup.bootstrap5.css') }}">>
@endsection

@section('vendor-script')
    <script src="{{ asset('assets/vendor/libs/jquery-sticky/jquery-sticky.js') }}"></script>
    <script src="{{ asset('js/datatables.min.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/select2/select2.js') }}"></script>
@endsection

@section('page-script')
    <script src="{{ asset('assets/js/form-layouts.js') }}"></script>
    <script type="text/javascript">
        'use strict';

        function datatables(unit) {
            var id_sms = @json($id_sms);
            var jns_unit = @json($jns_unit);

            let table = $('#table-data').DataTable({
                "bDestroy": true,
                processing: true,
                pageLength: 25,
                "language": {
                    "decimal": "",
                    "emptyTable": "Tidak ada data pada tabel",
                    "info": "Menampilkan _START_ sampai _END_ dari _TOTAL_ total data",
                    "infoEmpty": "Tidak ada yang ditampilkan",
                    "infoFiltered": "(Terfilter dari  _MAX_ total entitas)",
                    "infoPostFix": "",
                    "thousands": ",",
                    "lengthMenu": "Menampilkan _MENU_ entitas",
                    "loadingRecords": "API not connected...",
                    "processing": "Sedang dalam proses...",
                    "search": "Pencarian:",
                    "zeroRecords": "Tidak ada data yang cocok",
                    "paginate": {
                        "first": "Pertama",
                        "last": "Terakhir",
                        "next": "Selanjutnya",
                        "previous": "Sebelumnya"
                    },
                    "aria": {
                        "sortAscending": ": activate to sort column ascending",
                        "sortDescending": ": activate to sort column descending"
                    }
                },
                sDom: 'rt<"row"<"col-sm-12 col-md-3"l><"col-sm-12 col-md-3"i><"col-sm-12 col-md-6"p>>',

                ajax: {
                    url: "{{ route('json-list-kurikulum') }}",
                    data: function (d) {
                        // Tambahkan parameter tambahan ke data yang dikirim
                        d.thn_kurikulum = $('#thn_kurikulum').val();
                        d.search = $('#id_unit').val();
                        d.id_sms = id_sms; // Kirim id_sms ke server
                        d.jns_unit = jns_unit; // Kirim id_sms ke server
                    }
                },
                "columns": [
                    { data: 'thn_kurikulum', title: 'Tahun Kurikulum' },
                    { data: 'semester', title: 'Semester' },
                    { data: 'kode_mk', title: 'Kode Mata Kuliah' },
                    { data: 'nm_mk', title: 'Nama Mata Kuliah' },
                    { data: 'sks_mk', title: 'SKS MK' },
                    { data: 'jns_mk', title: 'Jenis MK' },
                    { data: 'nm_fakultas', title: 'Fakultas' },
                    { data: 'nm_jurusan', title: 'Jurusan' },
                    { data: 'nm_prodi', title: 'Prodi' }
                ],
                buttons: [{
                    extend: 'collection',
                    className: 'btn btn-label-primary dropdown-toggle me-2',
                    text: '<i class="ti ti-file-export me-sm-1"></i> <span class="d-none d-sm-inline-bloc' +
                        'k">Export</span>',
                    buttons:
                    [{
                            extend: 'print',
                            text: '<i class="ti ti-printer me-1" ></i>Print',
                            className: 'dropdown-item',
                            customize: function(win) {
                                //customize print view for dark
                                $(win.document.body)
                                    .css('color', config.colors.headingColor)
                                    .css('border-color', config.colors.borderColor)
                                    .css('background-color', config.colors.bodyBg);
                                $(win.document.body)
                                    .find('table')
                                    .addClass('compact')
                                    .css('color', 'inherit')
                                    .css('border-color', 'inherit')
                                    .css('background-color', 'inherit');
                            }
                        },
                        {
                            extend: 'csv',
                            text: '<i class="ti ti-file-text me-1" ></i>Csv',
                            className: 'dropdown-item',
                        },
                        {
                            extend: 'excel',
                            text: '<i class="ti ti-file-text me-1" ></i>Excel',
                            className: 'dropdown-item',
                        },
                        {
                            extend: 'copy',
                            text: '<i class="ti ti-copy me-1" ></i>Copy',
                            className: 'dropdown-item',
                        },
                    ]
                }, {
                    text: '<i class="ti ti-filter me-sm-1"></i> <span class="d-none d-sm-inline-block">Fi' +
                        'lter</span>',
                    className: 'add-new btn btn-primary',
                    attr: {
                        'data-bs-toggle': 'offcanvas',
                        'data-bs-target': '#offcanvasAddUser'
                    }
                }],
                "initComplete": function(settings, json) {
                    table.buttons().containers().appendTo('#exportBtn');
                }
            });

            return table;
        }

        $(document).ready(function() {

            let unit = <?php echo json_encode($unit); ?>;
            let table = datatables(unit);

            $('#search').on('change', function() {
                table.search($('#search').val()).draw();
                $('#offcanvasAddUser').offcanvas('hide');
            });
            $('#btnSearch').on('click', function() {
                table.search($('#search').val()).draw();
                $('#offcanvasAddUser').offcanvas('hide');
            });
            $('#thn_kurikulum').on('change', function() {
                $('#table-data').DataTable().clear().destroy();
                table = datatables(unit);
                $('#offcanvasAddUser').offcanvas('hide');
            });
            $('#id_unit').on('change', function() {
                $('#table-data').DataTable().clear().destroy();
                table = datatables(unit);
                $('#offcanvasAddUser').offcanvas('hide');
            });
        });
    </script>
@endsection

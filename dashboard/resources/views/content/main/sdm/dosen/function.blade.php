@section('vendor-style')
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/datatables-checkboxes-jquery/datatables.checkboxes.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css') }}">
    <!-- Row Group CSS -->
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/datatables-rowgroup-bs5/rowgroup.bootstrap5.css') }}">>
@endsection

@section('vendor-script')
    <script src="{{ asset('assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/select2/select2.js') }}"></script>
@endsection

@section('page-script')
    <script type="text/javascript">
        'use strict';

        $(document).ready(function() {

            $('#tahun').on('change', function() {
                this.form.submit();
            });

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
                    "loadingRecords": "Loading...",
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
                buttons: [{
                    extend: 'collection',
                    className: 'btn btn-label-primary dropdown-toggle me-2',
                    text: '<i class="ti ti-file-export me-sm-1"></i> <span class="d-none d-sm-inline-bloc' +
                        'k">Export</span>',
                    buttons: [
                          {
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
                        // {
                        //     extend: 'pdf',
                        //     text: '<i class="ti ti-file-description me-1"></i>Pdf',
                        //     className: 'dropdown-item',
                        //     orientation: 'landscape',
                        //     customize: function(win) {
                        //         //customize print view for dark
                        //         $(win.document.body)
                        //             .css('color', config.colors.headingColor)
                        //             .css('border-color', config.colors.borderColor)
                        //             .css('background-color', config.colors.bodyBg);
                        //         $(win.document.body)
                        //             .find('table')
                        //             .addClass('compact')
                        //             .css('color', 'inherit')
                        //             .css('border-color', 'inherit')
                        //             .css('background-color', 'inherit');
                        //     }
                        // },
                    ]
                }],
            });

            table.buttons().containers().appendTo('#exportBtn');
        });
    </script>
@endsection

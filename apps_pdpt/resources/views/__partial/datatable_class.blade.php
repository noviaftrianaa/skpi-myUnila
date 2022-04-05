@push('css')
    <link href="{{ asset('bower_components/datatables/media/css/dataTables.bootstrap4.css') }}" rel="stylesheet">

    <style type="text/css">
        .tg {
            border-collapse: collapse;
            border-color: #ccc;
            border-spacing: 0;
            width: 100%;
        }

        .tg thead {
            width: 100%;
        }

        .tg td {
            background-color: #fff;
            border-color: #ccc;
            border-style: solid;
            border-width: 1px;
            color: #333;
            font-family: Arial, sans-serif;
            font-size: 14px;
            overflow: hidden;
            padding: 10px 5px;
            word-break: normal;
            width: auto;
        }

        .tg th {
            background-color: #f0f0f0;
            border-color: #ccc;
            border-style: solid;
            border-width: 1px;
            color: #333;
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: normal;
            overflow: hidden;
            padding: 10px 5px;
            word-break: normal;
        }

        .tg .tg-c3ow {
            border-color: inherit;
            text-align: center;
            vertical-align: middle;
            font-weight: bold;
        }

        .tg .tg-0pky {
            border-color: inherit;
            text-align: center;
            vertical-align: middle;
            font-weight: bold;
        }

    </style>
@endpush

@push('js')
    <script type="text/javascript" src="{{ asset('bower_components/datatables/media/js/jquery.dataTables.min.js') }}">
    </script>
    <script type="text/javascript" src="{{ asset('bower_components/datatables/media/js/dataTables.bootstrap4.min.js') }}">
    </script>
    <script>
        $(document).ready(function() {
            $('.table-data').DataTable({
                stateSave: true,
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
                }
            });

            $('.pendidikan_datatable').DataTable({
                stateSave: true,
                "language": {
                    "decimal": "",
                    "emptyTable": "Tidak ada data pada tabel",
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
                }
            });

            $('.penelitian_datatable').DataTable({
                stateSave: true,
                "language": {
                    "decimal": "",
                    "emptyTable": "Tidak ada data pada tabel",
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
                }
            });

            $('.pengabdian_datatable').DataTable({
                stateSave: true,
                "language": {
                    "decimal": "",
                    "emptyTable": "Tidak ada data pada tabel",
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
                }
            });

            $('.seleksi_mhs_datatable').DataTable({
                stateSave: true,
                responsive: true,
                "language": {
                    "decimal": "",
                    "emptyTable": "Tidak ada data pada tabel",
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
                }
            });

            $('.mhs_asing_datatable').DataTable({
                stateSave: true,
                responsive: true,
                "language": {
                    "decimal": "",
                    "emptyTable": "Tidak ada data pada tabel",
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
                }
            });

            $('.dsn_pembimbing_utama_datatable').DataTable({
                stateSave: true,
                responsive: true,
                "language": {
                    "decimal": "",
                    "emptyTable": "Tidak ada data pada tabel",
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
                }
            });

            $('.dsn_prakin_datatable').DataTable({
                stateSave: true,
                responsive: true,
                "language": {
                    "decimal": "",
                    "emptyTable": "Tidak ada data pada tabel",
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
                }
            });

            $('.dsn_tetap_datatable').DataTable({
                stateSave: true,
                responsive: true,
                "language": {
                    "decimal": "",
                    "emptyTable": "Tidak ada data pada tabel",
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
                }
            });

            $('.eewmp_dosen_tetap_datatable').DataTable({
                stateSave: true,
                responsive: true,
                "language": {
                    "decimal": "",
                    "emptyTable": "Tidak ada data pada tabel",
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
                }
            });

            $('.dsn_tdk_tetap_datatable').DataTable({
                stateSave: true,
                responsive: true,
                "language": {
                    "decimal": "",
                    "emptyTable": "Tidak ada data pada tabel",
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
                }
            });

            $('.rekognisi_dtps_datatable').DataTable({
                stateSave: true,
                responsive: true,
                "language": {
                    "decimal": "",
                    "emptyTable": "Tidak ada data pada tabel",
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
                }
            });

            $('.penelitian_dtps_datatable').DataTable({
                stateSave: true,
                responsive: true,
                "language": {
                    "decimal": "",
                    "emptyTable": "Tidak ada data pada tabel",
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
                }
            });
        });
    </script>
@endpush

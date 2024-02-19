@section('vendor-style')
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/bs-stepper/bs-stepper.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/bootstrap-select/bootstrap-select.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/select2/select2.css') }}" />
    <link rel="stylesheet" href="{{ asset('css/bootstrap.min.css') }}" />
    <link rel="stylesheet" href="{{ asset('css/dataTables.bootstrap5.min.css') }}" />
@endsection

@section('vendor-script')
    <script src="{{ asset('assets/vendor/libs/bs-stepper/bs-stepper.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/bootstrap-select/bootstrap-select.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/select2/select2.js') }}"></script>
    <script src="{{ asset('js/jquery.min.js') }}"></script>
    <script src="{{ asset('js/jquery-ui.min.js') }}"></script>
    <script src="{{ asset('js/datatables.min.js') }}"></script>
    <script src="{{ asset('assets/js/form-wizard-numbered.js') }}"></script>
@endsection

@section('page-script')
    <script src="{{ asset('assets/js/form-wizard-icons.js') }}"></script>
    <script>
        function dosen(id) {
            return $('.dosen').DataTable({
                "bDestroy": true,
                processing: true,
                serverSide: true,
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
                "ajax": {
                    "url": "{{ route('pages-home-dosen-detail') }}",
                    "type": "GET",
                    "data": {
                        id_sms: id,
                        tahun: $('#periodeDosen').val()
                    }
                },
                order: [
                    [4, 'ASC']
                ],
                "columns": [{
                        "data": "nm_sdm",
                        "title": "Nama Dosen",
                        "orderable": true,
                        render: function(data, type, row) {
                            return `<a href="{{ route('pages-dosen', '') }}/${row.id_sdm}" target="_blank">${data}</a>`;
                        }
                    },
                    {
                        "data": "nidn",
                        "title": "NIDN",
                        "width": "5px",
                        "orderable": false,
                        "className": "text-center",
                    },
                    {
                        "data": "nip",
                        "title": "NIP",
                        "width": "5px",
                        "orderable": false,
                        "className": "text-center",
                    },
                    {
                        "data": "jk",
                        "title": "Jenis Kelamin",
                        "orderable": true,
                        "className": "text-center",
                    },
                    {
                        "data": "nm_stat_aktif",
                        "title": "Status",
                        "orderable": true,
                        "className": "text-center",
                        render: function(data, type, row) {
                            return row.id_stat_aktif == 1 ?
                                `<span class="badge bg-label-primary">${data}</span>` : (row
                                    .id_stat_aktif == 27 ?
                                    `<span class="badge bg-label-warning">${data}</span>` :
                                    `<span class="badge bg-label-danger">${data}</span>`);
                        }
                    }
                ]
            });
        }

        function mahasiswa(id) {
            return $('.mahasiswa').DataTable({
                "bDestroy": true,
                processing: true,
                serverSide: true,
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
                "ajax": {
                    "url": "{{ route('pages-prodi-mahasiswa', '') }}" + "/" + id,
                    "type": "GET"
                },
                order: [
                    [1, 'ASC']
                ],
                "columns": [{
                        "data": "id_smt",
                        "title": "Semester",
                        "orderable": true,
                        render: function(data, type, row) {
                            return data.substring(5, 4) == 1 ? `${data.substring(0,4)} Ganjil` :
                                `${data.substring(0,4)} Genap`;
                        }
                    },
                    {
                        "data": "total",
                        "title": "Total Mahasiswa",
                        "orderable": false,
                        "className": "text-center",
                    }
                ]
            });
        }

        $(document).ready(function() {
            var id = "{{ $id_sms }}";
            dosen(id);
            mahasiswa(id);

            $('#periodeDosen').on('change', function() {
                $('.dosen').DataTable().clear().destroy();
                dosen(id);
            });
        });
    </script>
@endsection

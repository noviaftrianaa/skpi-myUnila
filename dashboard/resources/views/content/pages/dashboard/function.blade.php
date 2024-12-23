@section('vendor-style')
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/bs-stepper/bs-stepper.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/bootstrap-select/bootstrap-select.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/select2/select2.css') }}" />
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css') }}">
@endsection

@section('vendor-script')
    <script src="{{ asset('assets/vendor/libs/bs-stepper/bs-stepper.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/bootstrap-select/bootstrap-select.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/select2/select2.js') }}"></script>
    <script src="{{ asset('assets/js/form-wizard-icons.js') }}"></script>
    <script src="{{ asset('js/datatables.min.js') }}"></script>
@endsection

@section('page-script')
    <script>
        function programstudi() {
            return $('.programstudi').DataTable({
                processing: true,
                serverSide: true,
                pageLength: 10,
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
                ajax: {
                    url: "{{ route('pages-home-programstudi') }}"
                },
                columns: [{
                        data: 'DT_RowIndex',
                        orderable: false,
                        searchable: false,
                        title: 'No.',
                        width: '5px',
                        className: 'text-center'
                    },
                    {
                        data: 'kode_prodi',
                        title: 'Kode Prodi',
                        className: 'text-center'
                    },
                    {
                        data: 'nm_lemb',
                        title: 'Program Studi'
                    },
                    {
                        data: 'nm_jenj_didik',
                        title: 'Jenjang',
                        width: '5px',
                        className: 'text-center'
                    },
                    {
                        data: 'soft_delete',
                        title: 'Status',
                        width: '5px',
                        className: 'text-center'
                    },
                ],
            });
        };

        function mahasiswa() {
            return $('.mahasiswa').DataTable({
                processing: true,
                serverSide: true,
                pageLength: 10,
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
                ajax: {
                    url: "{{ route('pages-home-mahasiswa') }}",
                    data: {
                        periode: $('#periodeMahasiswa').val()
                    }
                },
                columns: [{
                        data: 'DT_RowIndex',
                        orderable: false,
                        searchable: false,
                        title: 'No.',
                        className: 'text-center'
                    },
                    {
                        data: 'nm_lemb',
                        title: 'Program Studi',
                    },
                    {
                        data: 'nm_jenj_didik',
                        className: 'text-center',
                        title: 'Jenjang'
                    },
                    {
                        data: 'nasional',
                        className: 'text-center',
                        title: 'Nasional'
                    },
                    {
                        data: 'internasional',
                        className: 'text-center',
                        title: 'Internasional'
                    },
                ],
            });
        };

        function dosen() {
            return $('.dosen').DataTable({
                processing: true,
                serverSide: true,
                pageLength: 10,
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
                ajax: {
                    url: "{{ route('pages-home-dosen') }}",
                    data: {
                        periode: $('#periodeDosen').val()
                    }
                },
                columns: [{
                        data: 'DT_RowIndex',
                        orderable: false,
                        searchable: false,
                        className: 'text-center'
                    },
                    {
                        data: 'nm_lemb',
                    },
                    {
                        data: 'nm_jenj_didik',
                        className: 'text-center'
                    },
                    {
                        data: 'pns_pria',
                        className: 'text-center'
                    },
                    {
                        data: 'pns_wanita',
                        className: 'text-center'
                    },
                    {
                        data: 'kontrak_pria',
                        className: 'text-center'
                    },
                    {
                        data: 'kontrak_wanita',
                        className: 'text-center'
                    },
                ],
            });
        };

        function tendik() {
            return $('.tendik').DataTable({
                processing: true,
                serverSide: true,
                pageLength: 10,
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
                ajax: {
                    url: "{{ route('pages-home-tendik') }}",
                },
                columns: [{
                        data: 'DT_RowIndex',
                        orderable: false,
                        searchable: false,
                        className: 'text-center'
                    },
                    {
                        data: 'nm_unit_orga'
                    },
                    {
                        data: 'pns_pria',
                        className: 'text-center'
                    },
                    {
                        data: 'pns_wanita',
                        className: 'text-center'
                    },
                    {
                        data: 'kontrak_pria',
                        className: 'text-center'
                    },
                    {
                        data: 'kontrak_wanita',
                        className: 'text-center'
                    },
                ],
            });
        }

        $(document).ready(function() {
            let auth = <?php echo json_encode(auth()->check()) ?>;
            programstudi();
            var tMahasiswa = mahasiswa();
            var tDosen = dosen();
            var tTendik = tendik();

            //Mahasiswa
            tMahasiswa.on('click', '#btnModalMahasiswa', function() {
                var id = $(this).data('id');
                $('#detProdiMahasiswa').html("Program Studi " + $(this).data('prodi'));

                $('#modalMahasiswaList').modal('show');
                var oTable = $('#tDetailMahasiswa').DataTable({
                    "bDestroy": true,
                    processing: true,
                    serverSide: true,
                    ordering: false,
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
                        "url": "{{ route('pages-home-mahasiswa-detail') }}",
                        "type": "GET",
                        "data": {
                            id_sms: id,
                            periode: $('#periodeMahasiswa').val()
                        }
                    },
                    "columns": [{
                            "data": "nm_pd",
                            "title": "Nama Mahasiswa",
                        },
                        {
                            "data": "nipd",
                            "title": "NPM",
                            "width": "5px",
                            "className": "text-center",
                        },
                        {
                            "data": "jk",
                            "title": "Jenis Kelamin",
                            "className": "text-center",
                        },
                        {
                            "data": "id_stat_mhs",
                            "title": "Status",
                            "className": "text-center",
                        }
                    ],
                });
            });

            tDosen.on('click', '#btnModalDosen', function() {
                var id = $(this).data('id');
                $('#detProdi').html("Program Studi " + $(this).data('prodi'));

                $('#modalDosenList').modal('show');
                var oTable = $('#tDetailDosen').DataTable({
                    "bDestroy": true,
                    processing: true,
                    serverSide: true,
                    ordering: false,
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
                    "columns": [{
                            "data": "nm_sdm",
                            "title": "Nama Dosen",
                        },
                        {
                            "data": "nidn",
                            "title": "NIDN",
                            "width": "5px",
                            "className": "text-center",
                        },
                        {
                            "data": "nip",
                            "title": "NIP",
                            "width": "5px",
                            "className": "text-center",
                        },
                        {
                            "data": "jk",
                            "title": "Jenis Kelamin",
                            "className": "text-center",
                        },
                        {
                            "data": "nm_stat_aktif",
                            "title": "Status",
                            "className": "text-center",
                        }
                    ]
                });
            });

            tTendik.on('click', '#btnModalTendik', function() {
                var id = $(this).data('id');
                $('#detProdiTendik').html("Lembaga/Fakultas " + $(this).data('prodi'));

                $('#modalTendikList').modal('show');
                var oTable = $('#tDetailTendik').DataTable({
                    "bDestroy": true,
                    processing: true,
                    serverSide: true,
                    ordering: false,
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
                        "url": "{{ route('pages-home-tendik-detail') }}",
                        "type": "GET",
                        "data": {
                            id_unit_orga: id
                        }
                    },
                    "columns": [{
                            "data": "nm_pegawai",
                            "title": "Nama Tendik",
                        },
                        {
                            "data": "nip",
                            "title": "NIP",
                            "width": "5px",
                            "className": "text-center",
                        },
                        {
                            "data": "jk",
                            "title": "Jenis Kelamin",
                            "className": "text-center",
                        },
                        {
                            "data": "jns_pegawai",
                            "title": "Jenis Pegawai",
                        },
                        {
                            "data": "status",
                            "title": "Status",
                            "className": "text-center",
                        }
                    ]
                });
            });

            $('#periodeMahasiswa').on('change', function() {
                $('.mahasiswa').DataTable().clear().destroy();
                tMahasiswa = mahasiswa();
            });
            $('#periodeDosen').on('change', function() {
                $('.dosen').DataTable().clear().destroy();
                tDosen = dosen();
            });
        });
    </script>
@endsection

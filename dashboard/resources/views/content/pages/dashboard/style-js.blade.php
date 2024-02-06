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
    <script src="{{ asset('assets/js/form-wizard-icons.js') }}"></script>
    <script src="{{ asset('js/jquery.min.js') }}"></script>
    <script src="{{ asset('js/jquery-ui.min.js') }}"></script>
    <script src="{{ asset('js/datatables.min.js') }}"></script>
@endsection

@section('page-script')
    <script>
        function programstudi() {
            return $('.programstudi').DataTable({
                processing: true,
                serverSide: true,
                pageLength: 10,
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
                        title: 'Program Studi',
                        render: function(data, type, row) {
                            return `<a href="{{ route('pages-prodi', '') }}/${row.id_sms}">${data}</a>`;
                        }
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
                        className: 'text-center',
                        render: function(data, type, row) {
                            return data == '0' ? `<span class="badge bg-success">Aktif</span>` :
                                `<span class="badge bg-danger">Tidak Aktif</span>`;
                        }
                    },
                ],
            });
        }

        function mahasiswa() {
            return $('.mahasiswa').DataTable({
                processing: true,
                serverSide: true,
                pageLength: 10,
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
                        title: 'Program Studi'
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
        }

        function dosen() {
            return $('.dosen').DataTable({
                processing: true,
                serverSide: true,
                pageLength: 10,
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
                        render: function(data, type, row) {
                            return `<a href="javascript:void(0);" id="btnModalDosen" data-id="${row.id_sms}" data-prodi="${row.nm_lemb}">${data}</a>`;
                        }
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
        }

        function tendik() {
            return $('.tendik').DataTable({
                processing: true,
                serverSide: true,
                pageLength: 10,
                ajax: {
                    url: "{{ route('pages-home-tendik') }}"
                },
                columns: [{
                        data: 'DT_RowIndex',
                        orderable: false,
                        searchable: false,
                        className: 'text-center'
                    },
                    {
                        data: 'nm_lemb',
                        render: function(data, type, row) {
                            return `<a href="javascript:void(0);" id="btnModalTendik" data-id="${row.id_sms}" data-prodi="${row.nm_lemb}">${data}</a>`;
                        }
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
            programstudi();
            mahasiswa();
            var tDosen = dosen();
            var tTendik = tendik();

            tDosen.on('click', '#btnModalDosen', function() {
                var id = $(this).data('id');
                $('#detProdi').html("Program Studi " + $(this).data('prodi'));

                $('#modalDosenList').modal('show');
                var oTable = $('#tDetailDosen').DataTable({
                    "bDestroy": true,
                    processing: true,
                    serverSide: true,
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
                                    `<span class="badge bg-success">${data}</span>` : (row
                                        .id_stat_aktif == 27 ?
                                        `<span class="badge bg-warning">${data}</span>` :
                                        `<span class="badge bg-danger">${data}</span>`);
                            }
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
                    "ajax": {
                        "url": "{{ route('pages-home-tendik-detail') }}",
                        "type": "GET",
                        "data": {
                            id_sms: id
                        }
                    },
                    order: [
                        [3, 'ASC']
                    ],
                    "columns": [{
                            "data": "nm_sdm",
                            "title": "Nama Tendik",
                            "orderable": true,
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
                                    `<span class="badge bg-success">${data}</span>` : (row
                                        .id_stat_aktif == 27 ?
                                        `<span class="badge bg-warning">${data}</span>` :
                                        `<span class="badge bg-danger">${data}</span>`);
                            }
                        }
                    ]
                });
            });

            $('#periodeMahasiswa').on('change', function() {
                $('.mahasiswa').DataTable().clear().destroy();
                mahasiswa();
            });
            $('#periodeDosen').on('change', function() {
                $('.dosen').DataTable().clear().destroy();
                tDosen = dosen();
            });
        });
    </script>
@endsection

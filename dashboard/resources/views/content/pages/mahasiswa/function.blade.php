@section('vendor-style')
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/datatables-checkboxes-jquery/datatables.checkboxes.css') }}">
@endsection

<!-- Page -->
@section('page-style')
    <link rel="stylesheet" href="{{ asset('assets/vendor/css/pages/page-profile.css') }}" />
@endsection

@section('vendor-script')
    <script src="{{ asset('assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js') }}"></script>
@endsection

@section('page-script')
    <script src="{{ asset('assets/js/pages-profile.js') }}"></script>
    <script>
        function semester(id) {
            return $('#tSemester').DataTable({
                "bDestroy": true,
                processing: true,
                serverSide: true,
                "ajax": {
                    "url": "{{ route('pages-mahasiswa-semester', '') }}" + "/" + id,
                    "type": "GET",
                },
                order: [
                    [0, 'DESC']
                ],
                "columns": [{
                        data: 'id_smt',
                        title: 'Semester',
                        className: 'text-center',
                        render: function(data, type, row) {
                            return data.substring(5, 4) == 1 ? `${data.substring(0,4)} Ganjil` :
                                `${data.substring(0,4)} Genap`;
                        }
                    },
                    {
                        data: 'nm_stat_mhs',
                        title: 'Status',
                    },
                    {
                        data: 'sks_semester',
                        title: 'SKS',
                    },
                    {
                        data: 'prodi',
                        title: 'Program Studi',
                    },
                ]
            });
        }

        function mk(id) {
            return $('#tMK').DataTable({
                "bDestroy": true,
                processing: true,
                serverSide: true,
                "ajax": {
                    "url": "{{ route('pages-mahasiswa-mk', '') }}" + "/" + id,
                    "type": "GET",
                },
                order: [
                    [0, 'DESC']
                ],
                "columns": [{
                        data: 'id_smt',
                        title: 'Semester',
                        className: 'text-center',
                    },
                    {
                        data: 'kode_mk',
                        title: 'Kode MK',
                    },
                    {
                        data: 'nm_mk',
                        title: 'Mata Kuliah',
                    },
                    {
                        data: 'id_stat_mhs',
                        title: 'Program',
                    },
                    {
                        data: 'sks_mk',
                        title: 'SKS',
                    },
                    {
                        data: 'prodi',
                        title: 'Program Studi',
                    },
                ]
            });
        }

        function aktivitas(id) {
            return $('#tAktivitas').DataTable({
                "bDestroy": true,
                processing: true,
                serverSide: true,
                "ajax": {
                    "url": "{{ route('pages-mahasiswa-aktivitas', '') }}" + "/" + id,
                    "type": "GET",
                },
                order: [
                    [0, 'DESC']
                ],
                "columns": [{
                        data: 'id_smt',
                        title: 'Semester',
                        className: 'text-center',
                    },
                    {
                        data: 'nm_jns_akt_mhs',
                        title: 'Jenis',
                    },
                    {
                        data: 'judul_akt_mhs',
                        title: 'Judul',
                    },
                    {
                        data: 'lokasi_kegiatan',
                        title: 'Lokasi',
                    },
                    {
                        data: 'sk_tugas',
                        title: 'SK',
                    },
                    {
                        data: 'tgl_sk_tugas',
                        title: 'Tgl SK',
                    },
                    {
                        data: 'nm_lemb',
                        title: 'Program Studi',
                    },
                ]
            });
        }

function prestasi(id) {
    return $('#tPrestasi').DataTable({
        "bDestroy": true,
        processing: true,
        serverSide: true,
        "ajax": {
            "url": "{{ route('pages-mahasiswa-prestasi', '') }}" + "/" + id,
            "type": "GET",
        },
        order: [
            [0, 'DESC']
        ],
        "columns": [{
                data: 'nm_jenis_prestasi',
                title: 'Bidang',
            },
            {
                data: 'nm_prestasi',
                title: 'Nama Prestasi',
            },
            {
                data: 'peringkat',
                title: 'Peringkat',
            },
            {
                data: 'penyelenggara',
                title: 'Penyelenggara',
            },
            {
                data: 'nm_tkt_prestasi',
                title: 'Tingkat',
            },
            {
                data: 'thn_prestasi',
                title: 'Tahun',
            },
        ]
    });
}

        $(document).ready(function() {
            let profil = <?php echo json_encode($profil); ?>;
            semester(profil.id_pd);
            mk(profil.id_pd);
            aktivitas(profil.id_pd);
            prestasi(profil.id_pd);
        });
    </script>
@endsection

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
    <script src="{{ asset('js/datatables.min.js') }}"></script>
@endsection

@section('page-script')
    <script src="{{ asset('assets/js/pages-profile.js') }}"></script>
    <script>
        //PENGAJARAN
        function tPengajaran(id) {
            return $('#tPengajaran').DataTable({
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
                lengthMenu: [
                    [10, 15, 25, 100, -1],
                    [10, 15, 25, 100, 'All']
                ],
                "ajax": {
                    "url": "{{ route('pages-dosen-pengajaran', '') }}" + "/" + id,
                    "type": "GET",
                },
                "columns": [{
                        data: 'DT_RowIndex',
                        title: 'No.',
                        orderable: false,
                        searchable: false,
                        width: '5px',
                        className: 'text-center'
                    },
                    {
                        data: 'kode_mk',
                        title: 'Kode MK',
                        width: '5px',
                        className: 'text-center'
                    },
                    {
                        data: 'nm_mk',
                        title: 'Mata Kuliah',
                    },
                    {
                        data: 'sks_mk',
                        title: 'SKS',
                        width: '5px',
                        className: 'text-center'
                    },
                    {
                        data: 'id_smt',
                        title: 'Semester',
                        render: function(data, type, row) {
                          return data.substring(5,4)==1 ? `${data.substring(0,4)} Ganjil` : `${data.substring(0,4)} Genap`;
                        }
                    },
                    {
                        data: 'nm_lemb',
                        title: 'Program Studi',
                    },
                    {
                        data: 'lembaga',
                        title: 'Lembaga',
                    },
                ]
            });
        }
        //BIMBINGAN
        function tBimbingan(id) {
            return $('#tBimbingan').DataTable({
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
                pageLength: 5,
                lengthMenu: [
                    [5, 10, 25, -1],
                    [5, 10, 25, 'All']
                ],
                "ajax": {
                    "url": "{{ route('pages-dosen-bimbingan', '') }}" + "/" + id,
                    "type": "GET",
                },
                "columns": [{
                        data: 'DT_RowIndex',
                        title: 'No.',
                        orderable: false,
                        searchable: false,
                        width: '5px',
                        className: 'text-center'
                    },
                    {
                        data: 'nm_jns_akt_mhs',
                        title: 'Kegiatan',
                    },
                    {
                        data: 'judul_akt_mhs',
                        title: 'Judul Kegiatan',
                    },
                    {
                        data: 'urutan_promotor',
                        title: 'Urutan Pembimbing',
                        render: function(data, type, row) {
                            return `Pembimbing Ke-${data}`;
                        }
                    },
                    {
                        data: 'id_smt',
                        title: 'Semester',
                        render: function(data, type, row) {
                          return data.substring(5,4)==1 ? `${data.substring(0,4)} Ganjil` : `${data.substring(0,4)} Genap`;
                        }
                    },
                    {
                        data: 'nm_lemb',
                        title: 'Program Studi',
                    },
                ]
            });
        }
        //PENGUJIAN
        function tPengujian(id) {
            return $('#tPengujian').DataTable({
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
                pageLength: 5,
                lengthMenu: [
                    [5, 10, 25, -1],
                    [5, 10, 25, 'All']
                ],
                "ajax": {
                    "url": "{{ route('pages-dosen-pengujian', '') }}" + "/" + id,
                    "type": "GET",
                },
                "columns": [{
                        data: 'DT_RowIndex',
                        title: 'No.',
                        orderable: false,
                        searchable: false,
                        width: '5px',
                        className: 'text-center'
                    },
                    {
                        data: 'nm_jns_akt_mhs',
                        title: 'Kegiatan',
                    },
                    {
                        data: 'judul_akt_mhs',
                        title: 'Judul Kegiatan',
                    },
                    {
                        data: 'urutan_uji',
                        title: 'Urutan Penguji',
                        render: function(data, type, row) {
                            return `Penguji Ke-${data}`;
                        }
                    },
                    {
                        data: 'id_smt',
                        title: 'Semester',
                        render: function(data, type, row) {
                          return data.substring(5,4)==1 ? `${data.substring(0,4)} Ganjil` : `${data.substring(0,4)} Genap`;
                        }
                    },
                    {
                        data: 'nm_lemb',
                        title: 'Program Studi',
                    },
                ]
            });
        }

        $(document).ready(function() {
            var profil = <?php echo json_encode($profil); ?>;
            tPengajaran(profil.id_sdm);
            tBimbingan(profil.id_sdm);
            tPengujian(profil.id_sdm);
        });
    </script>
@endsection

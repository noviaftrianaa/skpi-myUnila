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
        $(document).ready(() => {
            let semesterTable;
            let khsTable;
            let transkripTable;
            // Tangkap klik tombol rincian semester
            $(document).on('click', '.btn-rincian-semester', function() {
                const idRegPd = $(this).data('id_reg_pd'); // Ambil data-id_reg_pd dari tombol

                // Saat modal dibuka, kirimkan data ke server
                $('#modalSemester').on('shown.bs.modal', function ()  {
                    if (!$.fn.DataTable.isDataTable('#tSemester')) {
                        semesterTable = $('#tSemester').DataTable({
                            processing: true,
                            serverSide: true,
                            ajax: {
                                url: "{{ route('profile.smst-mhs') }}", // URL backend
                                type: 'GET',
                                data: (d) => {
                                    d.id_reg_pd = idRegPd; // Kirim data-id_reg_pd ke server
                                }
                            },
                            columns: [
                                { data: 'nm_smt', name: 'nm_smt', title: 'Semester' },
                                { data: 'nm_lemb', name: 'nm_lemb', title: 'Nama Prodi' },
                                { data: 'nm_stat_mhs', name: 'nm_stat_mhs', title: 'Status Semester' },
                                { data: 'ips', name: 'ips', title: 'IPS' },
                                { data: 'ipk', name: 'ipk', title: 'IPK' },
                                { data: 'sks_semester', name: 'sks_semester', title: 'SKS Semester' },
                                { data: 'nm_pembiayaan', name: 'nm_pembiayaan', title: 'Pembiayaan' },
                                { data: 'total_sks', name: 'total_sks', title: 'Total SKS' },
                                {
                                    data: 'biaya_smt',
                                    name: 'biaya_smt',
                                    title: 'Biaya Semester',
                                    render: function(data) {
                                        return new Intl.NumberFormat('id-ID', {
                                            style: 'currency',
                                            currency: 'IDR'
                                        }).format(data);
                                    }
                                },
                                { data: 'action', name: 'Detail', orderable: false, searchable: false, title: 'Action' }
                            ],
                            language: {
                                decimal: "",
                                emptyTable: "Tidak ada data pada tabel",
                                info: "Menampilkan _START_ sampai _END_ dari _TOTAL_ total data",
                                infoEmpty: "Tidak ada yang ditampilkan",
                                infoFiltered: "(Terfilter dari  _MAX_ total entitas)",
                                lengthMenu: "Menampilkan _MENU_ entitas",
                                loadingRecords: "Loading...",
                                processing: "Sedang dalam proses...",
                                search: "Pencarian:",
                                zeroRecords: "Tidak ada data yang cocok",
                                paginate: {
                                    first: "Pertama",
                                    last: "Terakhir",
                                    next: "Selanjutnya",
                                    previous: "Sebelumnya"
                                }
                            }
                        });
                    } else {
                        // Reload data jika DataTable sudah ada, kirimkan id_reg_pd baru
                        semesterTable.ajax.url("{{ route('profile.smst-mhs') }}?id_reg_pd=" + idRegPd).load();
                    }
                });
            });

               // Event untuk tombol "Lihat KHS"
            $('#tSemester').on('click', '.btn-khs',  function ()  {
                const idSmt = $(this).data('id-smt'); // Ambil ID semester dari atribut tombol
                // Buka modal KHS
                $('#modalKHS').modal('show');

                // Inisialisasi atau reload DataTables di modal KHS
                if (!$.fn.DataTable.isDataTable('#tKHS')) {
                    khsTable = $('#tKHS').DataTable({
                        processing: true,
                        serverSide: true,
                        ajax: {
                            url: "{{ route('profile.khs-mhs') }}", // Ganti dengan route yang sesuai
                            data: { id_smt: idSmt } // Kirim ID semester ke backend
                        },
                        columns: [
                            {data: 'nm_smt', name: 'nm_smt', title: 'Semester'},
                            {data: 'nm_prodi', name: 'nm_prodi', title: 'Nama Prodi'},
                            {data: 'kode_mk', name: 'kode_mk', title: 'Kode MK'},
                            {data: 'nm_mk', name: 'nm_mk', title: 'Nama MK'},
                            {data: 'sks_mk', name: 'sks_mk', title: 'SKS MK'},
                            {data: 'nm_kls', name: 'nm_kls', title: 'Kelas MK'},
                            {data: 'nilai_angka', name: 'nilai_angka', title: 'Nilai Angka'},
                            {data: 'nilai_huruf', name: 'nilai_huruf', title: 'Nilai Huruf'},
                            {data: 'nilai_indeks', name: 'nilai_indeks', title: 'Nilai Index'},
                        ],
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
                } else {
                    khsTable.ajax.url("{{ route('profile.khs-mhs') }}?=" + idSmt).load(); // Reload data jika tabel sudah ada
                }
            });

            // Bersihkan tabel saat modal ditutup
            $('#modalKHS').on('hidden.bs.modal', function () {
                if ($.fn.DataTable.isDataTable('#tKHS')) {
                    khsTable.clear().destroy(); // Hancurkan tabel saat modal ditutup
                    $('#tKHS').empty(); // Kosongkan tabel
                }
            });

            $(document).on('click', '.btn-transkrip', function() {
                const idRegPd = $(this).data('id_reg_pd'); // Ambil data-id_reg_pd dari tombol

                // Ketika modal dibuka, jalankan fungsi inisialisasi atau reload DataTable
                $('#modalTranskip').on('shown.bs.modal', function() {
                    if ($.fn.DataTable.isDataTable('#tTranskrip')) {
                        // Hapus DataTable sebelumnya jika ada
                        $('#tTranskrip').DataTable().destroy();
                    }

                    // Inisialisasi DataTable baru
                    $('#tTranskrip').DataTable({
                        processing: true,
                        serverSide: true,
                        ajax: {
                            url: "{{ route('profile.transkrip_mhs') }}", // URL backend
                            type: 'GET',
                            data: { id_reg_pd: idRegPd } // Kirim data-id_reg_pd ke server
                        },
                        columns: [
                            { data: 'nm_smt', name: 'nm_smt', title: 'Semester' },
                            { data: 'nm_prodi', name: 'nm_prodi', title: 'Nama Prodi' },
                            { data: 'kode_mk', name: 'kode_mk', title: 'Kode MK' },
                            { data: 'nm_mk', name: 'nm_mk', title: 'Nama MK' },
                            { data: 'sks_mk', name: 'sks_mk', title: 'SKS MK' },
                            { data: 'nm_kls', name: 'nm_kls', title: 'Kelas MK' },
                            { data: 'nilai_angka', name: 'nilai_angka', title: 'Nilai Angka' },
                            { data: 'nilai_huruf', name: 'nilai_huruf', title: 'Nilai Huruf' },
                            { data: 'nilai_indeks', name: 'nilai_indeks', title: 'Nilai Index' }
                        ],
                        language: {
                            emptyTable: "Tidak ada data pada tabel",
                            info: "Menampilkan _START_ sampai _END_ dari _TOTAL_ total data",
                            infoEmpty: "Tidak ada yang ditampilkan",
                            infoFiltered: "(Terfilter dari  _MAX_ total entitas)",
                            lengthMenu: "Menampilkan _MENU_ entitas",
                            loadingRecords: "Loading...",
                            processing: "Sedang dalam proses...",
                            search: "Pencarian:",
                            zeroRecords: "Tidak ada data yang cocok",
                            paginate: {
                                first: "Pertama",
                                last: "Terakhir",
                                next: "Selanjutnya",
                                previous: "Sebelumnya"
                            }
                        }
                    });
                });
            });
        });
    </script>
@endsection

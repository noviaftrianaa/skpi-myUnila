@push('js')
    <script>
        const encIdProdi = '{{ $id_prodi }}'

        function fakultasColumns() {
            return [{
                    data: 'DT_RowIndex',
                    title: 'No'
                },
                {
                    data: 'nama_lembaga',
                    title: 'Nama Fakultas'
                },
                {
                    data: 'total_prodi',
                    title: 'Total Prodi'
                },
                {
                    data: 'jenjang_list',
                    title: 'Jenjang Prodi'
                },
                {
                    data: 'prodi_aktif',
                    title: 'Prodi Aktif'
                },
                {
                    data: 'prodi_akan_kadaluarsa',
                    title: 'Hampir Kadaluarsa'
                },
            ];
        }

        function prodiColumns() {
            return [{
                    data: 'DT_RowIndex',
                    title: 'No'
                },
                {
                    data: 'nama_prodi',
                    title: 'Nama Prodi'
                },
                {
                    data: 'jenjang_didik',
                    title: 'Jenjang Pendidikan'
                },
                {
                    data: 'histori_akreditasi',
                    title: 'Histori Akreditasi'
                },
                // {
                //     data: 'sk_akreditasi_prodi',
                //     title: 'SK Akreditasi Prodi'
                // },
                // {
                //     data: 'tanggal_sk_akreditasi_prodi',
                //     title: 'Tanggal SK Akreditasi Prodi'
                // },
                // {
                //     data: 'tst_sk_akreditasi_prodi',
                //     title: 'TST SK Akreditasi Prodi'
                // },
                // {
                //     data: 'nilai_akreditasi',
                //     title: 'Nilai Akreditasi'
                // }
            ];
        }

        function languageDatatable() {
            return {
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
        }

        $(document).ready(function() {
            let tabelAkreditasi
            $("btnBackFakultas").hide()

            // $('.card-body').html('Hello World')
            $('#selectTahun').wrap('<div class="position-relative"></div>').select2({
                width: $(this).data('width') ? $(this).data('width') : $(this).hasClass('w-100') ? '100%' :
                    'style',
                ajax: {
                    url: "{{ route('akreditasi.tahun') }}",
                    dataType: 'json',
                    type: "GET",
                    delay: 250,
                    data: function(params) {
                        return {
                            search: params.term
                        }
                    },
                    processResults: function(data, params) {
                        return {
                            results: data.results
                        };
                    },
                    cache: true
                }
            });
            tabelAkreditasi = $('#tabelAkreditasi').DataTable({
                lengthMenu: [5, 10, 15, 20, 25, 100],
                "pageLength": 10,
                "lengthChange": true,
                ajax: encIdProdi !== '' ? '/main/akreditasi/data/' + encIdProdi : '/main/akreditasi/data/',
                processing: true,
                serverSide: true,
                columns: encIdProdi !== '' ? prodiColumns() : fakultasColumns(),
                language: languageDatatable(),

            });


            $('#selectTahun').on('change', function() {
                let value = $(this).val();
                console.log("Tahun dipilih:", value);
            });
        })
    </script>
@endpush

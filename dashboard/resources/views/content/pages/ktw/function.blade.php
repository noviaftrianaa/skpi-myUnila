@section('vendor-style')
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/datatables-checkboxes-jquery/datatables.checkboxes.css') }}">
    <link rel="stylesheet" href="{{ asset('assets/vendor/libs/apex-charts/apex-charts.css') }}" />
@endsection

@section('vendor-script')
    <script src="{{ asset('assets/vendor/libs/jquery-sticky/jquery-sticky.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/select2/select2.js') }}"></script>
    <script src="{{ asset('assets/vendor/libs/apex-charts/apexcharts.js') }}"></script>
@endsection

@section('page-script')
    <script type="text/javascript">
        'use strict';

        function ajaxChart(tahun) {
            $.ajax({
                url: "{{ route('pages-ktw-data') }}",
                type: "GET",
                success: function(res) {
                    let temp = [];
                    $.each(res, function(index, item) {
                        temp[index] = [];
                        let thn = tahun;

                        let temps = [];
                        temps[thn] = 0;
                        temps[(thn - 1)] = 0;
                        temps[(thn - 2)] = 0;
                        temps[(thn - 3)] = 0;
                        temps[(thn - 4)] = 0;
                        console.log(temps);
                        $.each(item, function(i, x) {
                            let y;
                            if (x.semester_keluar != null) {
                                y = x.semester_keluar;
                            } else {
                                y = x.semester_masuk;
                            }
                            temps[y] += 1;
                        });
                        $.each(temps, function(index, value) {
                            console.log(index, value);
                        });
                    });

                    // var options = {
                    //     colors: ['#0d6efd', '#ffc107', '#dc3545'],
                    //     series: [{
                    //         name: 'Tepat Waktu',
                    //         data: temp['ktw_tepat']
                    //     }, {
                    //         name: 'Tidak Tepat Waktu',
                    //         data: temp['ktw_tidak_tepat']
                    //     }, {
                    //         name: 'Tidak Lulus',
                    //         data: temp['ktw_tidak_lulus']
                    //     }],
                    //     legend: {
                    //         show: true,
                    //         position: 'top',
                    //         horizontalAlign: 'start'
                    //     },
                    //     chart: {
                    //         type: 'bar',
                    //         height: 'auto'
                    //     },
                    //     plotOptions: {
                    //         bar: {
                    //             horizontal: false,
                    //             columnWidth: '55%',
                    //             endingShape: 'rounded'
                    //         },
                    //     },
                    //     dataLabels: {
                    //         enabled: false
                    //     },
                    //     stroke: {
                    //         show: true,
                    //         width: 2,
                    //         colors: ['transparent']
                    //     },
                    //     xaxis: {
                    //         categories: ['2019', '2020', '2021', '2022', '2023'],
                    //     },
                    //     yaxis: {
                    //         title: {
                    //             text: 'Total'
                    //         }
                    //     },
                    //     fill: {
                    //         opacity: 1
                    //     }
                    // };

                    // var chart = new ApexCharts(document.querySelector("#barChart"), options);
                    // return chart.render();
                }
            });
        }

        $(document).ready(function() {

            let tahun = <?php echo json_encode($tahun); ?>;
            ajaxChart(tahun);

            let table = $('#table-data').DataTable({
                "bDestroy": true,
                processing: true,
                serverSide: true,
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
                ajax: {
                    url: "{{ route('pages-ktw-data') }}",
                    data: {
                        tahun: $('#tahun').val(),
                        id_sms: $('#sms').val(),
                        table: true,
                    }
                },
                "columns": [{
                        data: 'DT_RowIndex',
                        orderable: false,
                        searchable: false,
                        title: 'No.',
                        width: '5px',
                        className: 'text-center'
                    },
                    {
                        data: 'nm_pd',
                        title: 'Mahasiswa',
                    },
                    {
                        data: 'prodi',
                        title: 'Prodi',
                    },
                    {
                        data: 'jenjang',
                        title: 'Jenjang',
                    },
                    {
                        data: 'sks_lulus',
                        title: 'SKS Lulus',
                    },
                    {
                        data: 'sks_total',
                        title: 'SKS Diambil',
                    },
                    {
                        data: 'ip_mk',
                        title: 'IP Total',
                    },
                    {
                        data: 'ipk',
                        title: 'IPK',
                    },
                    {
                        data: 'semester_masuk',
                        title: 'Tahun Masuk',
                    },
                    {
                        data: 'semester_keluar',
                        title: 'Tahun Lulus',
                    },
                ],
            });
        });
    </script>
@endsection

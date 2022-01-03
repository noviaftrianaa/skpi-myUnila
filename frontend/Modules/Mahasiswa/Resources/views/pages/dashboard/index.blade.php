@extends('mahasiswa::components.master')
@section('title', 'Dashboard')
@section('content')
@section('css')
<style>
    .stats {
        background: #f2f5f8 !important;
        color: #000 !important
    }

    .articles {
        font-size: 10px;
        color: #a1aab9
    }

    .number1 {
        font-weight: 500
    }

    .followers {
        font-size: 12px;
        color: #a1aab9
    }

    .number2 {
        font-weight: 500
    }

    .rating {
        font-size: 10px;
        color: #a1aab9
    }

    .number3 {
        font-weight: 500
    }

    td {
        font-size: 13px
    }


}

body {
    background-color: #e7dfcf;
    position: relative;
    margin: 20px 30px
}

.container {
    max-width: 800px;
    background-color: white;
    padding: 0
}

.review {
    font-size: 30px;
    font-weight: 600;
}

.sub-review {
    font-size: 20px;
    font-weight: 300;
}

.name {
    font-size: 18px;
    color: #1F233C;
    margin: 0
}

.job {
    color: #c8c8c8;
    font-size: 14px
}

.carousel-inner {
    max-width: 800px
}

.fa-minus {
    font-size: 14px
}

.carousel-indicators {
    bottom: -20px;
    right: 0;
    margin: 0
}

.carousel-indicators [data-bs-target] {
    height: 10px;
    border: 2px solid black;
    width: 10px;
    background-color: inherit;
    border-radius: 50%
}

.carousel-indicators .active {
    border: 2px solid transparent;
    background-color: #1F233C
}

.left {
    color: rgb(20, 20, 20);
    font-weight: 600
}

.right {
    color: rgb(12, 12, 12);
    font-weight: 600
}

.carousel-control-next,
.carousel-control-prev {
    position: relative
}

@media (max-width:560px) {
    .modal-dialog{
        width: 350px;
        margin: auto;
        top: -70px
    }

    .modal-dialog .img-modal{
        display: block;
        margin-left: auto;
        margin-right: auto;
        margin-bottom: -50px;
        width: 50%!important;
    }

    .sub-review {
        font-size: 14px;
        font-weight: 200;
    }

    .review {
        font-size: 14px;
        font-weight: 600
    }

    .name {
        font-size: 13px
    }

    .job {
        font-size: 10px
    }

    .right {
        font-size: 12px
    }

    .left {
        font-size: 12px
    }

    .carousel-indicators [data-bs-target] {
        height: 8px;
        border: 1px solid black;
        width: 8px;
        background-color: inherit;
        border-radius: 50%
    }

    .carousel-indicators .active {
        border: 1px solid transparent;
        background-color: #1F233C
    }
}
</style>
@stop

{{-- modal --}}
<div class="modal fade" id="onload" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true"> <!-- Add this line to your code -->
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Tawaran Beasiswa</h5>
            </div>
            <div class="modal-body">
                <div class="container">
                    <div id="mycarousel" class="carousel slide" data-bs-ride="carousel">
                        <ol class="carousel-indicators">
                            <li data-bs-target="#mycarousel" data-bs-slide-to="0" class="active"></li>
                            <li data-bs-target="#mycarousel" data-bs-slide-to="1"></li>
                            <li data-bs-target="#mycarousel" data-bs-slide-to="2"></li>
                        </ol>
                        <div class="carousel-inner">
                            <div class="carousel-item active">
                                <div class="row">
                                    <div class="col-lg-6 "> <img src="{{ asset('assets/img/beasiswa/ic_graduation_cap_s1d4.png') }}" class="img-modal d-block w-100" alt="..."> </div>
                                    <div class="col-lg-6 ">
                                        <div class=" d-flex flex-column justify-content-center my-5 px-3">
                                            <p class="review text-center">Beasiswa S1 / D4</p>
                                            <p class="sub-review text-center">Khusus Calon Guru SMK, Pelaku Budaya, Beasiswa Prestasi Talenta dan Prestasi Akademik
                                                (Dalam & Luar Negeri)</p>
                                            <div class="name d-flex align-items-center justify-content-center mt-3">
                                                <a href="{{url('mahasiswa/beasiswa')}}" class="btn btn-sm btn-round mb-0 me-1 btn-primary py-1 px-3">Lihat Selengkapnya</a><br>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="carousel-item">
                                <div class="row">
                                    <div class="col-lg-6 "> <img src="{{ asset('assets/img/beasiswa/ic_graduation_cap_s2s3.png') }}" class="img-modal d-block w-100" alt="..."> </div>
                                    <div class="col-lg-6 ">
                                        <div class=" d-flex flex-column justify-content-center my-5 px-3">
                                            <p class="review text-center">Beasiswa S2 / S3 Non Dosen</p>
                                            <p class="sub-review text-center">Khusus GTK, Pelaku Budaya dan Beasiswa Prestasi Talenta
                                                (Dalam & Luar Negeri)</p>
                                            <div class="name d-flex align-items-center justify-content-center mt-3">
                                                <a href="{{url('mahasiswa/beasiswa')}}" class="btn btn-sm btn-round mb-0 me-1 btn-primary py-1 px-3">Lihat Selengkapnya</a><br>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="carousel-item">
                                <div class="row">
                                    <div class="col-lg-6 "> <img src="{{ asset('assets/img/beasiswa/ic_lpdp.png') }}" class="img-modal d-block w-100" alt="..."> </div>
                                    <div class="col-lg-6 ">
                                        <div class=" d-flex flex-column justify-content-center my-5 px-3">
                                            <p class="review text-center">Beasiswa S2 / S3 LPDP</p>
                                            <p class="sub-review text-center">(Dalam & Luar Negeri) ditujukan bagi setiap warganegara Indonesia yang telah lulus S1/D4 atau lulusan S2 dan ingin lanjut studi ke jenjang master maupun doktor.</p>
                                            <div class="name d-flex align-items-center justify-content-center mt-3">
                                                <a href="{{url('mahasiswa/beasiswa')}}" class="btn btn-sm btn-round mb-0 me-1 btn-primary py-1 px-3">Lihat Selengkapnya</a><br>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer mt-5">
                <button type="button" class="btn btn-danger btn-sm py-1 px-3" data-bs-dismiss="modal"><i class="fa fa-close"></i>&nbsp;&nbsp;Tutup</button>
            </div>
        </div>
    </div>
</div>
{{-- tutup modal --}}

<div class="container-fluid py-4">
    <div class="row">
      <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
        <div class="card">
          <div class="card-body p-3">
            <div class="row">
              <div class="col-8">
                <div class="numbers">
                  <p class="text-sm mb-0 text-capitalize font-weight-bold">SEMESTER SAAT INI</p>
                  <h5 class="font-weight-bolder mb-0">
                    8
                  </h5>
                </div>
              </div>
              <div class="col-4 text-end">
                <div class="icon icon-shape btn-primary shadow text-center border-radius-md">
                  <i class="fas fa-bookmark text-lg opacity-10" aria-hidden="true"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
        <div class="card">
          <div class="card-body p-3">
            <div class="row">
              <div class="col-8">
                <div class="numbers">
                  <p class="text-sm mb-0 text-capitalize font-weight-bold">IPK</p>
                  <h5 class="font-weight-bolder mb-0">
                    3.04
                  </h5>
                </div>
              </div>
              <div class="col-4 text-end">
                <div class="icon icon-shape btn-primary shadow text-center border-radius-md">
                  <i class="fas fa-ribbon text-lg opacity-10" aria-hidden="true"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
        <div class="card">
          <div class="card-body p-3">
            <div class="row">
              <div class="col-8">
                <div class="numbers">
                  <p class="text-sm mb-0 text-capitalize font-weight-bold">TOTAL SKS LULUS</p>
                  <h5 class="font-weight-bolder mb-0">
                    146
                  </h5>
                </div>
              </div>
              <div class="col-4 text-end">
                <div class="icon icon-shape btn-primary shadow text-center border-radius-md">
                  <i class="fa fa-star text-lg opacity-10" aria-hidden="true"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-xl-3 col-sm-6">
        <div class="card">
          <div class="card-body p-3">
            <div class="row">
              <div class="col-8">
                <div class="numbers">
                  <p class="text-sm mb-0 text-capitalize font-weight-bold">STATUS PEMBAYARAN</p>
                  <h5 class="font-weight-bolder mb-0">
                    Lunas
                  </h5>
                </div>
              </div>
              <div class="col-4 text-end">
                <div class="icon icon-shape btn-primary shadow text-center border-radius-md">
                  <i class="ni ni-money-coins text-lg opacity-10" aria-hidden="true"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">
        <div class="col-lg-4 mb-lg-0 mb-4">
          <div class="card z-index-2">
            <div class="card-body p-3">
                <h6 class="ms-2 mb-2"> Profil </h6>
                    <div class="d-flex align-items-center">
                        <div class="image"> <img src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=80" class="rounded" width="155"> </div>
                        <div class="ml-3 w-100 p-3">
                            <h5 class="mb-0 mt-0">Mizar Zulmi Ramadhan</h5>
                            <div class="p-3 mt-2 rounded text-white stats">
                                <div class="d-flex flex-column">
                                    <table>
                                        <tr>
                                          <td width="35%">NPM</td>
                                          <td>: 1717051073</td>
                                        </tr>
                                        <tr>
                                          <td>Fakultas</td>
                                          <td>: MIPA</td>
                                        </tr>
                                        <tr>
                                          <td>Prodi</td>
                                          <td>: S1 Ilmu Komputer</td>
                                        </tr>
                                        <tr>
                                          <td>Periode</td>
                                          <td>: 2017 Ganjil</td>
                                        </tr>
                                        <tr>
                                          <td>Status</td>
                                          <td>: Aktif</td>
                                        </tr>
                                      </table>
                                </div>
                            </div>
                            <div class="button mt-2 d-flex flex-row align-items-center">
                                <button class="btn btn-sm btn-round mb-0 me-1 btn-primary py-1 px-3">Detail</button>
                            </div>
                        </div>
                    </div>
            </div>
          </div>
        </div>
        <div class="col-lg-8 col-md-6 mb-md-0 mb-4">
            <div class="card">
              <div class="card-header pb-0">
                <div class="row">
                  <div class="col-lg-6 col-7">
                    <h6>Jadwal Kuliah</h6>
                    <p class="text-sm mb-0">
                    </p>
                  </div>
                  <div class="col-lg-6 col-5 my-auto text-end">
                    <div class="dropdown float-lg-end pe-4">
                      <a class="cursor-pointer" id="dropdownTable" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fa fa-ellipsis-v text-secondary"></i>
                      </a>
                      <ul class="dropdown-menu px-2 py-3 ms-sm-n4 ms-n5" aria-labelledby="dropdownTable">
                        <li><a class="dropdown-item border-radius-md" href="javascript:;">Hari ini</a></li>
                        <li><a class="dropdown-item border-radius-md" href="javascript:;">Besok</a></li>
                        <li><a class="dropdown-item border-radius-md" href="javascript:;">Jadwal Ujian</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card-body px-0 pb-2">
                <div class="table-responsive">
                  <table class="table align-items-center mb-3">
                    <thead>
                      <tr>
                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Tanggal & Waktu</th>
                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Jenis</th>
                        <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Kuliah</th>
                        <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Ruang</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div class="d-flex px-2 py-1">
                            <div class="d-flex flex-column justify-content-center">
                              <h6 class="mb-0 text-sm">22 Desember 2021 - 08:30</h6>
                            </div>
                          </div>
                        </td>
                        <td>
                            <span class="text-xs font-weight-bold"> Kuliah </span>
                        </td>
                        <td class="align-middle text-center text-sm">
                          <span class="text-xs font-weight-bold"> METODOLOGI PENELITIAN </span>
                        </td>
                        <td class="align-middle">
                          <div class="progress-wrapper w-75 mx-auto">
                            <div class="progress-info">
                              <div class="progress-percentage">
                                <span class="text-xs font-weight-bold">GIK Lt.1 A</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div class="d-flex px-2 py-1">
                            <div class="d-flex flex-column justify-content-center">
                              <h6 class="mb-0 text-sm">22 Desember 2021 - 13:30</h6>
                            </div>
                          </div>
                        </td>
                        <td>
                            <span class="text-xs font-weight-bold"> Kuliah </span>
                        </td>
                        <td class="align-middle text-center text-sm">
                          <span class="text-xs font-weight-bold"> ETIKA PROFESI </span>
                        </td>
                        <td class="align-middle">
                          <div class="progress-wrapper w-75 mx-auto">
                            <div class="progress-info">
                              <div class="progress-percentage">
                                <span class="text-xs font-weight-bold">GIK Lt.1 B</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div class="d-flex px-2 py-1">
                            <div class="d-flex flex-column justify-content-center">
                              <h6 class="mb-0 text-sm">22 Desember 2021 - 10:00</h6>
                            </div>
                          </div>
                        </td>
                        <td>
                            <span class="text-xs font-weight-bold"> Praktikum </span>
                        </td>
                        <td class="align-middle text-center text-sm">
                          <span class="text-xs font-weight-bold"> WEB LANJUT </span>
                        </td>
                        <td class="align-middle">
                          <div class="progress-wrapper w-75 mx-auto">
                            <div class="progress-info">
                              <div class="progress-percentage">
                                <span class="text-xs font-weight-bold">GIK Lt.1 B</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div class="d-flex px-2 py-1">
                            <div class="d-flex flex-column justify-content-center">
                              <h6 class="mb-0 text-sm">22 Desember 2021 - 15:30</h6>
                            </div>
                          </div>
                        </td>
                        <td>
                            <span class="text-xs font-weight-bold"> Praktikum </span>
                        </td>
                        <td class="align-middle text-center text-sm">
                          <span class="text-xs font-weight-bold"> MOBILE LANJUT </span>
                        </td>
                        <td class="align-middle">
                          <div class="progress-wrapper w-75 mx-auto">
                            <div class="progress-info">
                              <div class="progress-percentage">
                                <span class="text-xs font-weight-bold">MIPA T Lt.1 A</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>

                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
      </div>

    <div class="row my-4">
        <div class="col-lg-4 col-md-6">
            <div class="card h-100">
              <div class="card-header pb-0">
                <h6>Status Tugas Akhir</h6>
                <div class="p-3 mt-4 mb-3 rounded text-white stats">
                    <div class="d-flex flex-column">
                        <table>
                            <tr>
                              <td width="47%">Dosen PA</td>
                              <td>: Dr. Ir. KURNIA MULUDI, M.Sc.</td>
                            </tr>
                            <tr>
                              <td width="47%">Dosen Pembimbing 1</td>
                              <td>: Astria Hijriani, M.Kom.</td>
                            </tr>
                            <tr>
                              <td width="47%">Dosen Pembimbing/Pembahas</td>
                              <td>: Rangga Firdaus, S.Kom., M.Kom.</td>
                            </tr>
                            <tr>
                              <td width="47%">Pembahas 2</td>
                              <td>: Bambang Hermanto, S.Kom, M.Sc.</td>
                            </tr>
                          </table>
                    </div>
                </div>
              </div>
              <div class="card-body p-3">
                <div class="timeline timeline-one-side">
                  <div class="timeline-block mb-3">
                    <span class="timeline-step">
                      <i class="ni ni-bulb-61 text-warning text-gradient"></i>
                    </span>
                    <div class="timeline-content">
                      <h6 class="text-dark text-sm font-weight-bold mb-0">Seminar Proposal</h6>
                      <p class="text-secondary font-weight-bold text-xs mt-1 mb-0">22 DEC 2021</p>
                    </div>
                  </div>
                  <div class="timeline-block mb-3">
                    <span class="timeline-step">
                        <i class="ni ni-bulb-61 text-primary text-gradient"></i>
                    </span>
                    <div class="timeline-content">
                      <h6 class="text-dark text-sm font-weight-bold mb-0">Seminar Hasil</h6>
                      <p class="text-secondary font-weight-bold text-xs mt-1 mb-0">02 FEB 2022</p>
                    </div>
                  </div>
                  <div class="timeline-block mb-3">
                    <span class="timeline-step">
                        <i class="ni ni-bulb-61 text-success text-gradient"></i>
                    </span>
                    <div class="timeline-content">
                        <h6 class="text-dark text-sm font-weight-bold mb-0">Sidang Komprehensif</h6>
                        <p class="text-secondary font-weight-bold text-xs mt-1 mb-0">01 MAR 2022</p>
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        <div class="col-lg-4 mb-lg-0 mb-4">
            <div class="card z-index-2">
              <div class="card-body p-3">
                  <h6 class="ms-2 mb-5"> Perbandingan Nilai </h6>
                  <div class="chart d-flex justify-container-center">
                    <div id="piechart" style="width: 900px; height: 350px;"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4 mb-lg-0">
            <div class="card z-index-2">
              <div class="card-header pb-0">
                <h6>Indeks Prestasi</h6>
                <p class="text-sm mt-4">
                  <a href="#" class="btn btn-sm btn-round mb-0 me-1 btn-primary py-1 px-3"><i class="fa fa-download text-white"></i>&nbsp;&nbsp;Unduh Transkrip</a>
                </p>
              </div>
              <div class="card-body p-3">
                <div class="chart">
                  <canvas id="chart-line" class="chart-canvas" height="300"></canvas>
                </div>
              </div>
            </div>
          </div>
    </div>

@endsection

@section('js')
<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
<script>
    window.onload = () => {
        $('#onload').modal('show');
    }

    $(document).ready(function () {

        google.charts.load('current', {
            'packages': ['corechart']
        });
        google.charts.setOnLoadCallback(drawChart);

        function drawChart() {

            var data = google.visualization.arrayToDataTable([
                ['Task', 'Hours per Day'],
                ['A', 43],
                ['B+', 15],
                ['B', 36],
                ['C+', 24],
                ['C', 23],
                ['D', 3]
            ]);

            var options = {
                // title: 'Perbandingan Nilai'
            };

            var chart = new google.visualization.PieChart(document.getElementById('piechart'));

            chart.draw(data, options);
        }
    });


    var ctx2 = document.getElementById("chart-line").getContext("2d");

    var gradientStroke1 = ctx2.createLinearGradient(0, 230, 0, 50);

    gradientStroke1.addColorStop(1, 'rgba(203,12,159,0.2)');
    gradientStroke1.addColorStop(0.2, 'rgba(72,72,176,0.0)');
    gradientStroke1.addColorStop(0, 'rgba(203,12,159,0)'); //purple colors

    var gradientStroke2 = ctx2.createLinearGradient(0, 230, 0, 50);

    gradientStroke2.addColorStop(1, 'rgba(20,23,39,0.2)');
    gradientStroke2.addColorStop(0.2, 'rgba(72,72,176,0.0)');
    gradientStroke2.addColorStop(0, 'rgba(20,23,39,0)'); //purple colors

    new Chart(ctx2, {
      type: "bar",
      data: {
        labels: ["smst 1", "smst 2", "smst 3", "smst 4", "smst 5", "smst 6", "smst 7", "smst 8"],
        datasets: [{
            label: "IPS",
            tension: 0.4,
            borderWidth: 0,
            pointRadius: 0,
            borderColor: "#cb0c9f",
            borderWidth: 3,
            backgroundColor: gradientStroke1,
            fill: true,
            data: [2.7, 2.52, 3.19, 3.13, 3.29, 3.08, 3.75, 0.75],
            maxBarThickness: 6

          },
          {
            label: "IPK",
            tension: 0.4,
            borderWidth: 0,
            pointRadius: 0,
            borderColor: "#3A416F",
            borderWidth: 3,
            backgroundColor: gradientStroke2,
            fill: true,
            data: [2.7, 2.61, 2.79, 2.88, 2.96, 2.97, 3.04, 2.92],
            maxBarThickness: 6
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
          }
        },
        interaction: {
          intersect: false,
          mode: 'index',
        },
        scales: {
          y: {
            grid: {
              drawBorder: false,
              display: true,
              drawOnChartArea: true,
              drawTicks: false,
              borderDash: [5, 5]
            },
            ticks: {
              display: true,
              padding: 10,
              color: '#b2b9bf',
              font: {
                size: 11,
                family: "Open Sans",
                style: 'normal',
                lineHeight: 2
              },
            }
          },
          x: {
            grid: {
              drawBorder: false,
              display: false,
              drawOnChartArea: false,
              drawTicks: false,
              borderDash: [5, 5]
            },
            ticks: {
              display: true,
              color: '#b2b9bf',
              padding: 20,
              font: {
                size: 11,
                family: "Open Sans",
                style: 'normal',
                lineHeight: 2
              },
            }
          },
        },
      },
    });

  </script>

@stop

@extends('mahasiswa::layouts.master')
@section('title', 'Dashboard')
@section('content')
<div class="container-fluid py-4">
    <div class="row">
      <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
        <div class="card">
          <div class="card-body p-3">
            <div class="row">
              <div class="col-8">
                <div class="numbers">
                  <p class="text-sm mb-0 text-capitalize font-weight-bold">Semester Saat Ini</p>
                  <h5 class="font-weight-bolder mb-0">
                    8 ( aktif )
                  </h5>
                </div>
              </div>
              <div class="col-4 text-end">
                <div class="icon icon-shape bg-gradient-primary shadow text-center border-radius-md">
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
                <div class="icon icon-shape bg-gradient-primary shadow text-center border-radius-md">
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
                  <p class="text-sm mb-0 text-capitalize font-weight-bold">Total SKS Lulus</p>
                  <h5 class="font-weight-bolder mb-0">
                    146
                  </h5>
                </div>
              </div>
              <div class="col-4 text-end">
                <div class="icon icon-shape bg-gradient-primary shadow text-center border-radius-md">
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
                  <p class="text-sm mb-0 text-capitalize font-weight-bold">Pembayaran</p>
                  <h5 class="font-weight-bolder mb-0">
                    Lunas
                  </h5>
                </div>
              </div>
              <div class="col-4 text-end">
                <div class="icon icon-shape bg-gradient-primary shadow text-center border-radius-md">
                  <i class="ni ni-money-coins text-lg opacity-10" aria-hidden="true"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">
        <div class="col-lg-3 mb-lg-0 mb-4">
          <div class="card z-index-2">
            <div class="card-body p-3">
                <h6 class="ms-2 mb-3"> Perbandingan Nilai </h6>
                <div class="chart">
                  <canvas id="chart-pie" class="chart-canvas" height="100"></canvas>
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-9 mb-lg-0">
          <div class="card z-index-2">
            <div class="card-header pb-0">
              <h6>Indeks Prestasi</h6>
              <p class="text-sm">
                {{-- <i class="fa fa-arrow-up text-success"></i> --}}
                {{-- <span class="font-weight-bold">4% more</span> in 2021 --}}
                <a href="#" class="btn btn-sm btn-round mb-0 me-1 bg-gradient-dark"><i class="fa fa-download text-white"></i>&nbsp;&nbsp;Download Transkrip</a>
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

    <div class="row my-4">
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
                        <span class="text-xs font-weight-bold"> Wajib </span>
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
                        <span class="text-xs font-weight-bold"> Wajib </span>
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
                        <span class="text-xs font-weight-bold"> Pilihan </span>
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
                        <span class="text-xs font-weight-bold"> Pilihan </span>
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
      <div class="col-lg-4 col-md-6">
        <div class="card h-100">
          <div class="card-header pb-0">
            <h6>Status Tugas Akhir</h6>
            <p class="text-sm">

            </p>
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
    </div>
@endsection

@section('js')
<script>
    var ctx = document.getElementById("chart-pie").getContext("2d");

    new Chart(ctx, {
        type: 'pie',
        data: {
            datasets: [{
                data: [43, 15, 36, 24, 23, 5, 12],
                backgroundColor: ['rgb(255, 99, 132)', 'rgb(191, 76, 91)', 'rgb(255, 205, 86)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)', 'rgb(95, 191, 76)', 'rgb(172, 76, 191)' ],
            }, ],
            labels: ["A", "B+", "B", "C", "C+", "C", "D", "E"],
        },
        options: {
            plugins: {
                datalabels: {
                    formatter: (value) => {
                        return value + 'SKS';
                    }
                }
            }
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
      type: "line",
      data: {
        labels: ["1", "2", "3", "4", "5", "6", "7", "8"],
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
            display: false,
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

@extends('stakeholder::layouts.master')
@section('content')
    {{-- <p>
        This view is loaded from module: {!! config('stakeholder.name') !!}
    </p> --}}
    <div class="container-fluid py-4">
        <div class="row">
          <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
            <div class="card">
              <div class="card-body p-3">
                <div class="row">
                  <div class="col-8">
                    <div class="numbers">
                      <p class="text-sm mb-0 text-capitalize font-weight-bold">IPK</p>
                      <h5 class="font-weight-bolder mb-0">
                        4.00
                       </h5>
                    </div>
                  </div>
                  <div class="col-4 text-end">
                    <div class="icon icon-shape bg-gradient-primary shadow text-center border-radius-md">
                      <i class="ni ni-world text-lg opacity-10" aria-hidden="true"></i>
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
                      <p class="text-sm mb-0 text-capitalize font-weight-bold">Status SPP</p>
                      <h5 class="font-weight-bolder mb-0">
                        Lunas
                       </h5>
                    </div>
                  </div>
                  <div class="col-4 text-end">
                    <div class="icon icon-shape bg-gradient-primary shadow text-center border-radius-md">
                      <i class="ni ni-paper-diploma text-lg opacity-10" aria-hidden="true"></i>
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
                      <p class="text-sm mb-0 text-capitalize font-weight-bold">Semester Saat Ini</p>
                      <h5 class="font-weight-bolder mb-0">
                        5 (Aktif)
                       </h5>
                    </div>
                </div>
                <div class="col-4 text-end">
                  <div class="icon icon-shape bg-gradient-primary shadow text-center border-radius-md">
                    <i class="ni ni-paper-diploma text-lg opacity-10" aria-hidden="true"></i>
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
                    <p class="text-sm mb-0 text-capitalize font-weight-bold">Status Beasiswa</p>
                    <h6 class="font-weight-bolder mb-0">
                      Beasiswa PPA
                     </h6>
                      exp : 21/12/2022
                     </div>
              </div>
              <div class="col-4 text-end">
                <div class="icon icon-shape bg-gradient-primary shadow text-center border-radius-md">
                  <i class="ni ni-paper-diploma text-lg opacity-10" aria-hidden="true"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>         
        <div class="col-12 mt-4">
          <div class="card mb-4">
            <div class="card-header pb-0 p-3">
              <h6 class="mb-0">Profil Mahasiswa</h6>
            </div>
            <div class="col-12 mt-4">
            <div class="card-body p-0">
              <div class="col-lg-15 mb-lg-0 mb-4">
                <div class="card">
                  <div class="card-body p-3">
                    <div class="row">
                      <div class="col-lg-9">
                        <table>
                          <tbody>
                            <tr>
                              <td><strong>Nama </strong></td>
                              <td>: </td>
                              <td>Zuliana Nurfadlillah</td>
                            </tr>
                            <tr>
                              <td><strong>NPM </strong></td>
                              <td>: </td>
                              <td>151051048</td>
                            </tr>
                            <tr>
                              <td><strong>Tempat, tanggal lahir </strong></td>
                              <td>: </td>
                              <td>Bandar Lampung, 23 Februari 1998</td>
                            </tr>
                            <tr>
                              <td><strong>Alamat </strong></td>
                              <td>: </td>
                              <td>Jl. R.A Basyid No. 1234 Untung Suropati, Labuhan Dalam, Bandar Lampung</td>
                            </tr>
                          </tbody>
                          </table>
                        </div>
                      <div class="col-lg-3 ms-auto text-right mt-4 mt-lg-0">
                        <img src="../assets/img/shapes/waves-white.svg" class="position-absolute h-100 w-50 top-0 d-lg-block d-none" alt="waves">
                          <div class="position-relative d-flex align-items-center justify-content-center h-50">
                            <img class="w-80 position-relative z-index-20 pt-4" src="../assets/img/Mahasiswa.png" alt="rocket">
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-12 mt-4">
                <div class="card mb-4">
                  <div class="card-header pb-0 p-3">
                    <h6 class="mb-0">Indeks Prestasi</h6>
                  </div>
                  <div class="col-12 mt-4">
                  <div class="card-body p-0">
                    <div class="col-lg-15 mb-lg-0 mb-4">
                      <div class="card">
                        <div class="card-body p-3">
                          <div class="row">
                            <div class="col-lg-6">
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
                      </div>
                    </div>
                           
@endsection

@section('js')
<script>
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
    function goPrintChart(){
    printCharts([chart]);
    }
  </script>

@stop
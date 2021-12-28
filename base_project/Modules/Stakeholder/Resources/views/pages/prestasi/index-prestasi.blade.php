@extends('stakeholder::layouts.master')
@section('title', 'PDUT Universitas Lampung - Prestasi')
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
    font-size: 15px;
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
</style>
@stop

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
                    10 ( Aktif )
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
                    3.03
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
                  <p class="text-sm mb-0 text-capitalize font-weight-bold">Status Pembayaran</p>
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
                <i class="ni ni-trophy text-lg opacity-10" aria-hidden="true"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

    <div class="row mt-4">
        <div class="col-lg-12 mb-lg-0 mb-4">
          <div class="card z-index-2">
            <div class="card-body p-3">
                <h6 class="ms-2 mb-3"> Profil Mahasiswa</h6>
                    <div class="d-flex align-items-center">
                        <div class="image"> <img src="../assets/img/Mahasiswa.png" class="rounded" width="200"> </div>
                        <div class="ml-3 w-100 p-3">
                            <h4 class="mb-0 mt-0">Zuliana Nurfadlillah</h4>
                            <div class="p-3 mt-2 rounded text-white stats">
                                <div class="d-flex flex-column">
                                    <table>
                                        <tr>
                                          <td width="30%">NPM</td>
                                          <td width="70%">: 1517051048</td>
                                        </tr>
                                        <tr>
                                          <td>Tempat, tanggal lahir</td>
                                          <td>: Bandar Lampung, 23 Februari 1998</td>
                                        </tr>
                                        <tr>
                                          <td width="30%">Alamat</td>
                                          <td width="70%">: Jln. R.A Basyid No. 115 Untung Suropati, Labuhan Dalam, Tanjung Senang, Bandar Lampung</td>
                                        </tr>
                                        <tr>
                                          <td>Program Studi</td>
                                          <td>: S1 Ilmu Komputer</td>
                                        </tr>
                                        <tr>
                                          <td width="30%">Konsentrasi</td>
                                          <td width="70%">: -</td>
                                        </tr>
                                        <tr>
                                          <td>Pembimbing Akadamik</td>
                                          <td>: Febi Eka Febriansyah, S.T</td>
                                        </tr>
                                      </table>
                                </div>
                            </div>
                            <div class="button mt-2 d-flex flex-row align-items-center">
                                <button class="btn btn-sm btn-round mb-0 me-1 bg-gradient-dark">Detail</button>
                            </div>
                        </div>
                    </div>
            </div>
          </div>
        </div>
        <div class="row my-4">
        <div class="col-lg-12 mb-lg-0">
          <div class="card z-index-2">
            <div class="card-header pb-0">
              <h6>Indeks Prestasi</h6>
              <p class="text-sm">
                {{-- <i class="fa fa-arrow-up text-success"></i> --}}
                {{-- <span class="font-weight-bold">4% more</span> in 2021 --}}
                <a href="#" class="btn btn-sm btn-round mb-2 me-3 bg-gradient-dark"><i class="fa fa-download text-white"></i>&nbsp;&nbsp;Unduh</a>
                <a href="#" class="btn btn-sm btn-round mb-2 me-3 bg-gradient-dark"><i class="fa fa-print text-white"></i>&nbsp;&nbsp;Cetak</a>
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
      type: "bar",
      data: {
        labels: ["smst 1", "smst 2", "smst 3", "smst 4", "smst 5", "smst 6", "smst 7", "smst 8", "smst 9", "smst 10"],
        datasets: [{
            label: "IPS",
            tension: 0.4,
            borderWidth: 0,
            pointRadius: 0,
            borderColor: "#cb0c9f",
            borderWidth: 3,
            backgroundColor: gradientStroke1,
            fill: true,
            data: [2.7, 2.52, 3.19, 3.13, 3.29, 3.08, 3.75, 0.75, 1.50, 3.89],
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
            data: [2.7, 2.61, 2.79, 2.88, 2.96, 2.97, 3.04, 2.92, 3.29, 3.08],
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

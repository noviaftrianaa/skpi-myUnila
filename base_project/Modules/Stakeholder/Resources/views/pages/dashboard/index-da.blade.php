@extends('stakeholder::layouts.master')
@section('title', 'PDUT Universitas Lampung - Beranda')
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
                    3.03
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
                  <p class="text-sm mb-0 text-capitalize font-weight-bold">Status Pembayaran</p>
                  <h5 class="font-weight-bolder mb-0" style=color:#fe2200>
                    Belum Bayar
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
                   <label class="font-weight-bolder mb-0" style=color:#fe2200>Exp : 21/12/2022</label>
                </div>
              </div>
              <div class="col-4 text-end">
                <div class="icon icon-shape btn-primary shadow text-center border-radius-md">
                  <i class="ni ni-trophy text-lg opacity-10" aria-hidden="true"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row mt-4">
        <div class="col-lg-9 mb-lg-0 mb-4">
          <div class="card z-index-2">
            <div class="card-body p-3">
                <h5 class="ms-0 mb-2"> Profil Mahasiswa </h5>
                <hr>
                    <div class="d-flex align-items-center">
                      <div class="image"> <img src="../assets/img/Mahasiswa.png" class="rounded" width="155">
                      </div>
                        <div class="ml-3 w-100 p-1">
                            <h4 class="mb-0 mt-0">Zuliana Nurfadlillah</h4>
                            <div class="p-2 mt-2 rounded text-white stats">
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
                                          <td>: S1- Biologi Terapan</td>
                                        </tr>
                                        <tr>
                                          <td width="30%">Konsentrasi</td>
                                          <td width="70%">: -</td>
                                        </tr>
                                        <tr>
                                          <td>Pembimbing Akadamik</td>
                                          <td>: DR NUNING NURCAHYANI, M.Sc.</td>
                                        </tr>
                                      </table>
                                </div>
                            </div>
                            <div class="button mt-2 d-flex flex-row align-items-center">
                                <button class="btn btn-sm btn-round mb-0 me-1 btn-primary">Detail</button>
                            </div>
                        </div>
                    </div>
            </div>
          </div>
        </div>
        <div class="col-lg-3 mb-lg-0 mb-4">
            <div class="card z-index-2">
              <div class="card-header p-3">
                <div class="row">
                    <h5 class="ms-0 mb-2">Status Pembayaran / UKT</h5>
                    <hr>
                </div>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table align-items-center mb-2">
                    <thead>
                      <tr>
                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">No.</th>
                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Semester</th>
                        <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Ket.</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <div class="d-flex px-3 py-1">
                            <div class="d-flex flex-column justify-content-center">
                              <h6 class="mb-0 text-sm">1.</h6>
                            </div>
                          </div>
                        </td>
                        <td>
                            <span class="text-xs font-weight-bold"> Semester 10 </span>
                        </td>
                        <td class="align-middle text-center text-sm">
                          <span class="text-xs font-weight-bold">
                            <i class="fa fa-times" style="color:#fe2200"></i> 
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div class="d-flex px-3 py-1">
                            <div class="d-flex flex-column justify-content-center">
                              <h6 class="mb-0 text-sm">2.</h6>
                            </div>
                          </div>
                        </td>
                        <td>
                            <span class="text-xs font-weight-bold"> Semester 9 </span>
                        </td>
                        <td class="align-middle text-center text-sm">
                          <span class="text-xs font-weight-bold"> <i class="fa fa-check" style="color:#1a9601"></i> </span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div class="d-flex px-3 py-1">
                            <div class="d-flex flex-column justify-content-center">
                              <h6 class="mb-0 text-sm">3.</h6>
                            </div>
                          </div>
                        </td>
                        <td>
                            <span class="text-xs font-weight-bold"> Semester 8 </span>
                        </td>
                        <td class="align-middle text-center text-sm">
                          <span class="text-xs font-weight-bold"> <i class="fa fa-check" style="color:#1a9601"></i> </span>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div class="d-flex px-3 py-1">
                            <div class="d-flex flex-column justify-content-center">
                              <h6 class="mb-0 text-sm">4.</h6>
                            </div>
                          </div>
                        </td>
                        <td>
                            <span class="text-xs font-weight-bold"> Semester 7 </span>
                        </td>
                        <td class="align-middle text-center text-sm">
                          <span class="text-xs font-weight-bold">
                            <i class="fa fa-check" style="color:#1a9601"></i>
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                </div>
                
                <div class="mb-lg-2 mb-4 text-sm button mt-0 d-flex flex-row align-items-center">
                  <button class="btn btn-sm btn-round mb-0 me-1 btn-primary">Detail</button>
              </div>
              </div>
            </div>
        </div>
      </div>
      
      <div class="row mt-4">
        <div class="col-lg-12 mb-lg-0 mb-4 ">
          <div class="card z-index-2">
            <div class="card-header pb-0">
              <h5>Indeks Prestasi</h5>
              <hr>
              <p class="text-sm">
                <a href="#" class="btn btn-sm btn-round mb-2 me-3 btn-primary"><i class="fa fa-download text-white"></i>&nbsp;&nbsp;Unduh</a>
                <a href="#" class="btn btn-sm btn-round mb-2 me-3 btn-primary"><i class="fa fa-print text-white"></i>&nbsp;&nbsp;Cetak</a>
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
            data: [2.7, 2.52, 3.19, 3.13, 3.29, 3.08, 3.75, 2.75, 2.99, 3.01],
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
            data: [2.7, 2.61, 2.79, 2.88, 2.96, 2.97, 3.04, 2.92, 2.56, 2.77 ],
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

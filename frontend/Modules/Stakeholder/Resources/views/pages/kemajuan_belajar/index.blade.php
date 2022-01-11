@extends('stakeholder::layouts.master')
@section('title', 'PDUT Universitas Lampung - Kemajuan Belajar')
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
  <div class="row mt-2">
    <div class="col-lg-12 mb-lg-0 mb-4">
      <div class="card z-index-2">
        <div class="card-body p-3">
          <h5 class="ms-0 mb-2"> Kemajuan Belajar </h5>
          <hr>
          <div class="row nav-tabs-custom">
            <div class="d-flex align-items-center">
              <div class="ml-4 w-100 p-1">
                <div class="p-3 mt-0 rounded text-white stats">
                  <div class="col-md-15">
                    <div class="row">

                      <div class="col-sm-5" >
                        <div class="col-sm-23">
                          <div class="d-flex flex-column">
                            <table>
                              <tr>
                                <td width="30%">NPM</td>
                                <td width="45%">: 1517051048</td>
                              </tr>
                              <tr>
                                <td width="30%">Status Mahasiswa</td>
                                <td width="45%">: Aktif</td>
                              </tr>
                              <tr>
                                <td width="30%">Angkatan</td>
                                <td width="45%">: 2019</td>
                              </tr>
                              <tr>
                                <td width="30%">Tahun Kurikulum</td>
                                <td width="45%">: 2020</td>
                              </tr>
                            </table>
                          </div>
                        </div>
                      </div>

                      <div class="col-sm-7" >
                        <div class="col-sm-23">
                          <div class="d-flex flex-column">
                            <table>
                              <tr>
                                <td width="30%">Nama Mahasiswa</td>
                                <td width="45%">: Zuliana Nurfadlillah</td>
                              </tr>
                              <tr>
                                <td width="30%">Program Studi</td>
                                <td width="45%">: S1 - Biologi Terapan</td>
                              </tr>
                              <tr>
                                <td width="30%">Pembimbing Akadamik</td>
                                <td width="45%">: DR NUNING NURCAHYANI, M.Sc.</td>
                              </tr>
                              <tr>
                                <td width="30%">Semester / IPK</td>
                                <td width="45%">: 10 / 3.03</td>
                              </tr>
                            </table>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>

  <div class="row mt-4">
    <div class="col-lg-12 mb-lg-0 mb-4 ">
      <div class="card z-index-2">
        <div class="card-header pb-0">
          <h5>Perkuliahan Mahasiswa</h5>
          <hr>
          <p class="text-sm">
            <a href="#" class="btn btn-sm btn-round mb-2 me-3 btn-primary"><i class="fa fa-download text-white"></i>&nbsp;&nbsp;Unduh</a>
            <a href="#" class="btn btn-sm btn-round mb-2 me-3 btn-primary"><i class="fa fa-print text-white"></i>&nbsp;&nbsp;Cetak</a>
          </p>
        </div>
        <div class="card-body p-3">
          <div class="chart">
            <canvas id="chart-bars" class="chart-canvas" height="300"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="row my-4">
    <div class="col-lg-7 col-md-6">
      <div class="card h-100">
        <div class="card-header pb-0">
          <h6>SKS Lulus</h6>
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

    <div class="col-lg-5 mb-lg-0 mb-4"> 
      <div class="card z-index-2">
        <div class="card-header pb-0">
          <h6>SKS Tempuh</h6>
          <hr>
          <p class="text-sm">
            <a href="#" class="btn btn-sm btn-round mb-2 me-3 btn-primary"><i class="fa fa-download text-white"></i>&nbsp;&nbsp;Unduh</a>
            <a href="#" class="btn btn-sm btn-round mb-2 me-3 btn-primary"><i class="fa fa-print text-white"></i>&nbsp;&nbsp;Cetak</a>
          </p>
        </div>
        <div class="card-body p-3">
          <div class="chart">
            <canvas id="pie-chart" class="chart-canvas" height="300"></canvas>
          </div>
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
    var ctx = document.getElementById("chart-bars").getContext("2d");

    var gradientStroke1 = ctx.createLinearGradient(0, 230, 0, 50);

    gradientStroke1.addColorStop(1, 'rgba(203,12,159,0.2)');
    gradientStroke1.addColorStop(0.2, 'rgba(72,72,176,0.0)');
    gradientStroke1.addColorStop(0, 'rgba(203,12,159,0)'); //purple colors

    var gradientStroke2 = ctx.createLinearGradient(0, 230, 0, 50);

    gradientStroke2.addColorStop(1, 'rgba(20,23,39,0.2)');
    gradientStroke2.addColorStop(0.2, 'rgba(72,72,176,0.0)');
    gradientStroke2.addColorStop(0, 'rgba(20,23,39,0)'); //purple colors

    new Chart(ctx, {
      type: "bar",
      title: {
                    text: 'Semester'
                    },
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
    labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [{
        label: "Mobile apps",
        tension: 0.4,
        borderWidth: 0,
        pointRadius: 0,
        borderColor: "#cb0c9f",
        borderWidth: 3,
        backgroundColor: gradientStroke1,
        data: [50, 40, 300, 220, 500, 250, 400, 230, 500],
        maxBarThickness: 6

      },
      {
        label: "Websites",
        tension: 0.4,
        borderWidth: 0,
        pointRadius: 0,
        borderColor: "#3A416F",
        borderWidth: 3,
        backgroundColor: gradientStroke2,
        data: [30, 90, 40, 140, 290, 290, 340, 230, 400],
        maxBarThickness: 6

      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      display: false,
    },
    tooltips: {
      enabled: true,
      mode: "index",
      intersect: false,
    },
    scales: {
      yAxes: [{
        gridLines: {
          borderDash: [2],
          borderDashOffset: [2],
          color: '#dee2e6',
          zeroLineColor: '#dee2e6',
          zeroLineWidth: 1,
          zeroLineBorderDash: [2],
          drawBorder: false,
        },
        ticks: {
          suggestedMin: 0,
          suggestedMax: 500,
          beginAtZero: true,
          padding: 10,
          fontSize: 11,
          fontColor: '#adb5bd',
          lineHeight: 3,
          fontStyle: 'normal',
          fontFamily: "Open Sans",
        },
      }, ],
      xAxes: [{
        gridLines: {
          zeroLineColor: 'rgba(0,0,0,0)',
          display: false,
        },
        ticks: {
          padding: 10,
          fontSize: 11,
          fontColor: '#adb5bd',
          lineHeight: 3,
          fontStyle: 'normal',
          fontFamily: "Open Sans",
        },
      }, ],
    },
  },
});


   

  </script>

@stop

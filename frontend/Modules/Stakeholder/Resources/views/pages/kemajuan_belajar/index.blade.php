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
                <div class="chart">
                  <canvas id="piechart" class="chart-canvas" height="300"></canvas>
                </div>
                {{-- <div id="piechart" style="width: 900px; height: 350px;"></div> --}}
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
  </div>

</div>
@endsection

@section('js')
<script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
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

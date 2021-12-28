<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="apple-touch-icon" sizes="76x76" href="{{ asset('assets/img/apple-icon.png') }}">
    <link rel="icon" type="image/png" href="{{ asset('assets/img/favicon.png') }}">
    <title>@yield('title')</title>
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700" rel="stylesheet" />
    <link href="{{ asset('assets/css/nucleo-icons.css') }}" rel="stylesheet" />
    <link href="{{ asset('assets/css/nucleo-svg.css') }}" rel="stylesheet" />
    <script src="https://kit.fontawesome.com/42d5adcbca.js" crossorigin="anonymous"></script>
    <link href="{{ asset('assets/css/nucleo-svg.css') }}" rel="stylesheet" />
    <link id="pagestyle" href="{{ asset('assets/css/soft-ui-dashboard.css?v=1.0.3') }}" rel="stylesheet" />

</head>

<body class="g-sidenav-show  bg-gray-100">
    <style>
        .centered {
            position: fixed;
            top: 50%;
            left: 50%;
            /* bring your own prefixes */
            transform: translate(-50%, -50%);
        }

    </style>
    <main class="main-content position-relative max-height-vh-100 h-100 mt-1 border-radius-lg ">
        <div class="container centered">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-body p-3">
                        <div class="row">
                            <div class="col-md-3">
                                <div class="numbers">
                                    <p class="text-sm mb-0 text-capitalize font-weight-bold">PDUT Unila</p>
                                    <h5 class="font-weight-bolder mb-0">
                                        DASHBOARD
                                        <span class="text-success text-sm font-weight-bolder">List</span>
                                    </h5>
                                </div>
                            </div>
                            <div class="col-md-9 text-end pb-0 mb-0">
                                <div class="d-inline-flex p-2">
                                    <a class="btn bg-gradient-primary mb-0" href="{{ route('alumni.dashboard') }}"><i class="fas fa-users"></i>&nbsp;&nbsp;Alumni</a>
                                </div>
                                <div class="d-inline-flex p-2">
                                    <a class="btn bg-gradient-primary mb-0" href="{{ route('dosen.dashboard') }}"><i class="fas fa-chalkboard-teacher"></i>&nbsp;&nbsp;Dosen</a>
                                </div>
                                <div class="d-inline-flex p-2">
                                    <a class="btn bg-gradient-primary mb-0" href="{{ route('mahasiswa.dashboard') }}"><i class="fas fa-user-graduate"></i>&nbsp;&nbsp;Mahasiswa</a>
                                </div>
                                <div class="d-inline-flex p-2">
                                    <a class="btn bg-gradient-primary mb-0" href="{{ route('stakeholder.dashboard') }}"><i class="fas fa-user-friends"></i>&nbsp;&nbsp;Stakeholder</a>
                                </div>
                                <div class="d-inline-flex p-2">
                                    <a class="btn bg-gradient-primary mb-0" href="{{ route('tendik.dashboard') }}"><i class="fas fa-laptop-house"></i>&nbsp;&nbsp;Tendik</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script>
        var win = navigator.platform.indexOf('Win') > -1;
        if (win && document.querySelector('#sidenav-scrollbar')) {
            var options = {
                damping: '0.5'
            }
            Scrollbar.init(document.querySelector('#sidenav-scrollbar'), options);
        }
    </script>
    <!-- Github buttons -->
    <script async defer src="https://buttons.github.io/buttons.js"></script>
    <!-- Control Center for Soft Dashboard: parallax effects, scripts for the example pages etc -->
    <script src="{{ asset('assets/js/soft-ui-dashboard.min.js?v=1.0.3') }}"></script>
</body>

</html>

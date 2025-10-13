<!DOCTYPE html>
<html lang="en">
<head>
    <title>Single Sign On Universitas Lampung</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <link rel="apple-touch-icon" sizes="76x76" href="{{ asset('assets/img/apple-icon.png') }}">
    <link rel="icon" type="image/png" href="{{ asset('assets/img/unila.png') }}">
    <title>Login</title>
    <!--     Fonts and icons     -->
    <link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700" rel="stylesheet" />
    <!-- Nucleo Icons -->
    <link href="{{ asset('assets/css/nucleo-icons.css') }}" rel="stylesheet" />
    <link href="{{ asset('assets/css/nucleo-svg.css') }}" rel="stylesheet" />
    <!-- Font Awesome Icons -->
    <script src="https://kit.fontawesome.com/42d5adcbca.js" crossorigin="anonymous"></script>
    <link href="{{ asset('assets/css/nucleo-svg.css') }}" rel="stylesheet" />
    <!-- CSS Files -->
    <link id="pagestyle" href="{{ asset('assets/css/soft-ui-dashboard.css?v=1.0.3') }}" rel="stylesheet" />
    <link id="pagestyle" href="{{ asset('assets/css/sso.css') }}" rel="stylesheet" />
</head>
<body>

<div id="wrap">
    <div class="container">
        <div class="body d-md-flex align-items-center justify-content-between">
            <div class="box-1 mt-md-0 mt-5">
                <img src="{{ asset('assets/img/sso/bg-form.jpg') }}" class="" alt="">

            </div>
            <img src="{{ asset('assets/img/sso/logo-unila.png') }}" class="logo" alt="">
            <div class="box-2 d-flex flex-column h-100 ">
                <div class="text-center">
                    <p class="mb-1 mb-sm-0 h-1">Aplikasi Single Sign On (SSO) Unila</p>
                    <p class="text-muted mt-4">Login your account</p>

                    <div class="card-mobile d-flex flex-column">
                        <div class="input-field d-flex flex-column">
                        <form id="loginForm" class="form-horizontal" role="form" action="$(link-login-only)" method="post">
                            <input type="text" class="form-control input-lg" id="inputLogin" name="username" placeholder="Username" autofocus required>
                            <input type="password" class="form-control input-lg mt-3" id="inputPassword" name="password" placeholder="Password" required>
                            <button type="submit" class="mt-4 btn btn-primary text-white d-flex justify-content-center align-items-center"><i class="fa fa-sign-in" aria-hidden="true"></i>&nbsp;Login</button>
                            <div class="mt-3 text1"> <span class="text-muted mt-3 forget">Forget Password?</span> </div>
                            <div class="text2 mt-4 d-flex flex-row align-items-center"> </span> </div>
                        </form>
                        </div>
                    </div>
                </div>
                <div class="mt-auto">
                    <p class="footer text-muted mb-0 margin-top-mobile">
                        Created by <br> UPT TIK Universitas Lampung
                     <br> Help Desk: <a target="_blank" href="http://helpdesk.unila.ac.id" title="Help Desk">https://helpdesktik.unila.ac.id</a>
                     <br> <blink>Your IP Address : $(ip)<br>Your Mac Address : $(mac)</blink>
                </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>


<script src="{{ asset('assets/js/core/popper.min.js') }}"></script>
<script src="{{ asset('assets/js/core/bootstrap.min.js') }}"></script>
<script src="{{ asset('assets/js/plugins/perfect-scrollbar.min.js') }}"></script>
<script src="{{ asset('assets/js/plugins/smooth-scrollbar.min.js') }}"></script>
<script src="{{ asset('assets/js/plugins/chartjs.min.js') }}"></script>

{{-- $(if chap-id)
    <script type="text/javascript" src="md5.js"></script>
    <script type="text/javascript">
        $('#loginForm').submit(function () {
            var password = $('#inputPassword');
            password.val(hexMD5('$(chap-id)' + password.val() + '$(chap-challenge)'));
        });
    </script>
$(endif) --}}

</body>
</html>

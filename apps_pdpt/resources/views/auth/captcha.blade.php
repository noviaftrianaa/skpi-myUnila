<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Captcha Verification : One Data</title>
    <link rel="stylesheet"
        href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,400i,700&display=fallback">
    <link rel="stylesheet" href="{{ asset('master_template/plugins/fontawesome-free/css/all.min.css') }}">
    <link rel="stylesheet" href="{{ asset('master_template/plugins/icheck-bootstrap/icheck-bootstrap.min.css') }}">
    <link rel="stylesheet" href="{{ asset('master_template/dist/css/adminlte.min.css') }}">
    <link rel="icon" type="image/png" href="{{ asset('auth/img/logo.png') }}">
    <link rel="stylesheet" href="{{ asset('node_modules/font-awesome/css/font-awesome.css') }}">

    <style>
        .captcha-wrap {
            position: relative;
        }

        #CaptchaImageCode {
            text-align: center;
            margin-bottom: 15px;
            padding: 0px 0;
            overflow: hidden;
        }

        .capcode {
            font-size: 46px;
            display: block;
            -moz-user-select: none;
            -webkit-user-select: none;
            user-select: none;
            cursor: default;
            letter-spacing: 1px;
            font-family: 'Roboto Slab', serif;
            font-weight: 100;
            font-style: italic;
            width: 87%;
            height: 80px;
        }

        .ReloadBtn {
            background: url('/captcha/img/refresh.png') left top no-repeat;
            background-size: 100%;
            width: 32px;
            height: 32px;
            border: 0px;
            outline: none;
            position: absolute;
            bottom: 25px;
            right: 0;
            cursor: pointer;
        }

        .error {
            color: red;
            display: none;
        }
    </style>
</head>

<body class="hold-transition login-page light-mode">
    <div class="login-box">

        <div class="card ">
            <div class="card-header text-center mt-4">
                <a href="{{ url('/') }}"><img src="{{ asset('images/logo_unila_kampus_merdeka.png') }}"></a>
                <p class="text-sm mt-4"><strong>CAPTCHA VERIFICATION</strong><br/>One Data Dashboard</p>
            </div>
            <div class="card-body">
                <form action="{{ route('auth.login.captcha') }}" method="POST" enctype="multipart/form-data" id="formCaptcha">

                    <input type="hidden" name="_token" value="{{ csrf_token() }}">
                    <input type="hidden" name="_method" value="POST">

                    <div class="row">
                        <div class="col-12">
                            <div class="form-group form-group-default">
                                <div class="captcha-wrap">
                                    <div id="CaptchaImageCode">
                                        <canvas id="CapCode" class="capcode"></canvas>
                                    </div>
                                    <input type="button" class="ReloadBtn" onclick="CreateCaptcha()">
                                    <input type="hidden" name="check" value="{{ $check }}">
                                </div>

                                <div class="input-group">
                                    <input type="text" id="captcha-code" class="form-control text-center" placeholder="Enter Captcha" maxlength="6" required>
                                    <div class="input-group-prepend">
                                    <span class="input-group-text bg-dark"><i class="fas fa-barcode"></i></span>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div class="col-12 text-center">
                            <p id="captcha-error" class="error"></p>
                        </div>
                    </div>

                </form>

                <button type="Submit" class="btn btn-block btn-primary" onclick="CheckCaptcha(); Submit()">
                    Proses
                </button>

            </div>
        </div>
    </div>

    <script src="{{ asset('master_template/plugins/jquery/jquery.min.js') }}"></script>
    <script src="{{ asset('master_template/plugins/bootstrap/js/bootstrap.bundle.min.js') }}"></script>
    <script src="{{ asset('master_template/dist/js/adminlte.min.js') }}"></script>
    <script src="{{ asset('captcha/js/captcha.js') }}"></script>
</body>

</html>

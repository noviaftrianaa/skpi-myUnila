<style type="text/css">

    body {
        font-family: "Roboto", sans-seriff;
        color: #949393;
        margin: 0;
    }
    a, button {
    transition: 0.3s all ease-out;
    }
    a {
        color: #111;
        text-decoration: none;
    }
    a:hover {
        color: #0043ee;
    }
    .row {
        display: flex;
    }
    .container {
        width: 530px;
        margin: 170px auto;
    }
    #body-wrap .col-8 {
        width: 70%;
    }
    #body-wrap .col-4 {
        width: 30%;
        height: 950px;
        overflow: hidden;
    }
    header#header {
        margin-bottom: 70px;
    }
    .main-content {
        color: #fff;
    }
    .main-content h1 {
        font-size: 3em;
        font-weight: 700;
        color: #007BFF;
        margin-bottom: 0;
    }
    #countdown-clock {
        font-size: 30px;
        display: flex;
        flex-wrap: wrap;
        margin: 50px 0;
    }
    #countdown-clock .time{
        background-color: #f5f5f5;
        color: #007BFF;
        border-radius: 10px;
        padding: 20px;
        margin-right: 10px;
        margin-bottom: 10px;
        text-align: center;
    }
    #countdown-clock .time > span{
        font-weight: 700;
    }
    #countdown-clock .time small{
        padding-top: 5px;
        font-size: 12px;
        text-transform: uppercase;
        display: block;
    }
    .main-content p {
        font-size: 1.2em;
        color: #666;
        width: 70%;
    }

    @media (max-width: 999px) {
        .container {
            padding-left: 70px;
        }
        #body-wrap .col-4 {
            width: 40%;
            margin-left: -48px;
            z-index: -1;
        }
     }

    @media (max-width: 599px) {
        #body-wrap .col-8 {
            width: 100%;
        }
        .container {
            width: 100%;
        }
        #body-wrap .page-title {
            width: 98%;
        }
        #body-wrap .col-4 {
            width: 100%;
            margin-left: -438px;
            opacity: 0.1;
        }
     }

    @media (max-width: 540px) {
        .container {
            padding-right: 30px;
            padding-left: 30px;
        }
        .main-content h1 {
            font-size: 2.4em;
        }
        #form .form-group {
            flex-wrap: wrap;
        }
        .form-group input.form-control {
            width: 100%;
            margin-bottom: 10px;
            background: #e4edf7;
        }
        .form-group button.submit-button {
            width: 100%;
        }
        #body-wrap .col-4 {
            margin-left: -108px;
        }
     }

    </style>
<div class="row">
    <div class="col">
        <div class="card card-info">

    <div class="card-body">
        <div class="row">
            <div class="col-12">
                <div class="container">
                    <div class="main-content">
                        <div class="page-title">
                            <h1>Dashboard IKU 6 ada pada sistem SIKERMA UNILA</h1>
                            {{-- <div id="countdown-clock">
                                <div class="time">
                                    <span class="days">00</span>
                                    <small>Days</small>
                                </div>
                                <div class="time">
                                    <span class="hours">00</span>
                                    <small>Hours</small>
                                </div>
                                <div class="time">
                                    <span class="minutes">00</span>
                                    <small>Minutes</small>
                                </div>
                                <div class="time">
                                    <span class="seconds">00</span>
                                    <small>Seconds</small>
                                </div>
                            </div> --}}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

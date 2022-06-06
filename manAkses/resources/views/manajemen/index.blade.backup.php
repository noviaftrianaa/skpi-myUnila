@extends('template.default.app')
@section('title','Dashboard')

@push('css')
<link rel="stylesheet" type="text/css" href="{{ asset('slick/slick.css') }}"/>
<link rel="stylesheet" type="text/css" href="{{ asset('slick/slick-theme.css') }}"/>
<style>
    form .inner-form .input-field {
        height: 65px;
        width: 100%;
        position: relative;
    }
    form .inner-form .input-field input {
        height: 100%;
        width: 100%;
        background: transparent;
        border: 2px solid #343a40;
        border-bottom: 5px solid #17a2b8;
        display: block;
        width: 100%;
        padding: 10px 32px 10px 70px;
        font-size: 18px;
        color: #000;
        transition: all .2s ease-out, color .2s ease-out;
        border-radius: 10px;
    }
    form .inner-form .input-field input.placeholder {
        color: #000;
        font-size: 18px bold;
    }
    form .inner-form .input-field .btn-search {
        /* width: 70px; */
        display: -ms-flexbox;
        display: flex;
        -ms-flex-align: center;
        align-items: center;
        position: absolute;
        left: 20px;
        height: 100%;
        background: transparent;
        border: 0;
        padding: 0;
        cursor: pointer;
    }
    .new_style {
        padding: 25px;
    }
    @media only screen and (max-width: 960px) {
        .new_style {
            padding: 5px;
        }
    }
    .content-wrapper {
        background: url('/images/bg-dashboard.png');
        background-position: center;
        background-repeat: no-repeat;
        background-size: 100% 100%;
    }
    svg {
        color: #fff;
    }
</style>
@endpush

@push('js')
<script type="text/javascript" src="//code.jquery.com/jquery-1.11.0.min.js"></script>
<script type="text/javascript" src="//code.jquery.com/jquery-migrate-1.2.1.min.js"></script>
<script type="text/javascript" src="{{ asset('slick/slick.min.js') }}"></script>
<script>
    $(document).ready(function(){
        const mediaQuery = window.matchMedia("(max-width: 960px)");
        if(mediaQuery.matches) {
            $( ".apps" ).each(function() {
                $( this ).slick({
                    autoplay: true,
                    autoplaySpeed: 3000,
                    rows: 3,
                    slidesPerRow: 6,
                    mobileFirst: true,
                    respondTo: 'window'
                });
            });
            $( ".apps_search" ).each(function() {
                $( this ).slick({
                    autoplay: true,
                    autoplaySpeed: 3000,
                    rows: 3,
                    slidesPerRow: 6,
                    mobileFirst: true,
                    respondTo: 'window'
                });
            });
        } else {
            $( ".apps" ).each(function() {
                $( this ).slick({
                    autoplay: true,
                    autoplaySpeed: 3000,
                    rows: 2,
                    slidesPerRow: 12,
                    mobileFirst: true,
                    respondTo: 'window'
                });
            });
            $( ".apps_search" ).each(function() {
                $( this ).slick({
                    autoplay: true,
                    autoplaySpeed: 3000,
                    rows: 2,
                    slidesPerRow: 8,
                    mobileFirst: true,
                    respondTo: 'window'
                });
            });
        }

        $('#search').on('keyup change', function() {
            var name = $(this).val();
            if(name!='' && name!=' ') {
                $.ajax({
                    url: '/apps/' + name,
                    type: "GET",
                    dataType: "json",
                    success:function(data)
                    {
                        if(data){
                            $('.apps').hide();
                            $('.apps_search').show();
                            $(".apps_search").html("");
                            $.each(data, function(key, item){
                                var html = '<div> <a href="' + item.url + '" title="' + item.nm_aplikasi + '" alt="' + item.nm_aplikasi + '" target="_blank"> <div class="row"> <div class="col-12 text-center"> <img src="' + item.url_logo + '" class="img-fluid" alt="apps"> </div> </div> <div class="row"> <div class="col-12 text-center"> <p class="text-xs text-warning"><b>' + item.nm_aplikasi + '</b></p> </div> </div> </a> </div>';
                                $(".apps_search").append(html);
                            });
                        } else {
                            $('.apps').show();
                            $(".apps_search").html("");
                        }
                    }
                });
            } else {
                $('.apps').show();
                $(".apps_search").html("");
            }
        });
    });
</script>
@endpush

@section('content')
<div class="row">
    <div class="col-sm-2 col-1"></div>
    <div class="col-sm-8 col-10">
        <div class="row new_style">
            <div class="col-12 text-center">
                <form>
                    <div class="inner-form">
                        <div class="input-field">
                            <button class="btn-search" type="button">
                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="24" viewBox="0 0 24 24">
                                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                                </svg>
                            </button>
                            <input id="search" type="text" placeholder="Search apps" />
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <div class="row mt-4">
            <div class="apps ml-3 mr-3">
                @foreach($app_inter AS $items)
                <div>
                    <a href="{{ $items->url }}" title="{{$items->nm_aplikasi}}" alt="{{$items->nm_aplikasi}}" target="_blank">
                        <div class="row">
                            <div class="col-12">
                                <img src="{{ (!is_null($items->largeobject)) ? 'data:image/' . $items->largeobject->mime_type . ';base64,' . $items->largeobject->blob_content : asset('auth/img/logo.png') }}" class="img-fluid" min-width="100%" min-height="100%" alt="apps">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12 text-center">
                                <p class="text-xs text-default"><b>{{$items->nm_aplikasi}}</b></p>
                            </div>
                        </div>
                    </a>
                </div>
                @endforeach
            </div>
            <div class="apps_search ml-3 mr-3"></div>
        </div>
    </div>
    <div class="col-sm-2 col-1"></div>
</div>

@endsection
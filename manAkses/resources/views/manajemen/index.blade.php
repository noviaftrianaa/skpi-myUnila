@extends('template.default.app')
@section('title','Dashboard')

@push('css')
<link rel="stylesheet" href="{{ asset('owlcarousel/dist/assets/owl.carousel.min.css') }}">
<link rel="stylesheet" href="{{ asset('owlcarousel/dist/assets/owl.theme.default.min.css') }}">
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
    ::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
        color: black;
        opacity: 1; /* Firefox */
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
    /* .search {
        transform: translate(0, 70%);
    } */
    .owl-carousel img {
        width:  auto; /*or 70%, or what you want*/
        height: 65px; /*or 70%, or what you want*/
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        margin-top: 30px;
        transform: translate(0, -50%);
    }
    .owl-prev, .owl-next
    {
        position: absolute;
    }
    .owl-prev
    {
        left: -30px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 40px !important;
        background-color: transparent !important;
        outline: none !important;
    }
    .owl-next
    {
        right: -30px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 40px !important;
        background-color: transparent !important;
        outline: none !important;
    }
    @media only screen and (max-width: 1366px) {
        .new_style {
            padding: 5px;
        }
        .owl-carousel img {
            width:  auto; /*or 70%, or what you want*/
            height: 50px; /*or 70%, or what you want*/
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            margin-top: 30px;
            transform: translate(0, -50%);
        }
        .search {
            transform: translate(0, 70%);
        }
    }
    @media only screen and (min-width: 1366px) {
        .new_style {
            padding: 25px;
        }
        .owl-carousel img {
            width:  auto; /*or 70%, or what you want*/
            height: 70px; /*or 70%, or what you want*/
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            margin-top: 30px;
            transform: translate(0, -50%);
        }
        .search {
            transform: translate(0, 50%);
        }
    }
</style>
@endpush

@push('js')
<script src="{{ asset('owlcarousel/dist/owl.carousel.min.js') }}"></script>
<script>
    $(document).ready(function(){
        var owls = $(".owl-carousel").owlCarousel({
            loop:true,
            nav: true,
            margin:20,
            responsiveClass:true,
            autoplay:true,
            autoplayTimeout:4000,
            responsive:{
                0:{
                    items:4,
                    nav:true,
                    loop:true
                },
                960:{
                    items:8,
                    nav:true,
                    loop:true
                },
                1366:{
                    items:10,
                    nav:true,
                    loop:true
                }
            }
        });
        $(".owl-carousel").on('mousewheel', '.owl-stage', function (e) {
            if (e.deltaY>0) {
                owl.trigger('next.owl');
            } else {
                owl.trigger('prev.owl');
            }
            e.preventDefault();
        });

        //SEARCH
        $('#search').on('keyup change', function() {
            var name = $(this).val();
            if(name!='' && name!=' ') {
                $.ajax({
                    url: '/apps/' + name,
                    type: "GET",
                    dataType: "json",
                    success:function(data)
                    {
                        console.log(data);
                        if(data != ''){
                            $('.apps').hide();
                            $('.apps_search').show();
                            $(".apps_search").html("");
                            $(".info-error").html("");
                            $.each(data, function(key, item){
                                var html = '<div id="'+key+'"> <a href="' + item.url + '" id="' + key + '" title="' + item.nm_aplikasi + '" alt="' + item.nm_aplikasi + '" target="_blank"> <div class="row"> <div class="col-12 text-center"> <img id="' + key + '" src="' + item.url_logo + '" class="img-responsive" alt="apps"> </div> </div> <div class="row"> <div class="col-12 text-center"> <span class="text-xs text-warning" id="' + key + '" style="font-weight: bold">' + item.nm_aplikasi + '</span> </div> </div> </a> </div>';
                                $(".apps_search").append(html);
                                owls.trigger('refresh.owl.carousel');
                            });
                        } else {
                            $('.apps').show();
                            $(".apps_search").html("");
                            $(".info-error").html('<div class="alert alert-warning text-center" style="padding:0"> <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button> <span style="font-weight: bold;"><i class="icon fas fa-info-circle"></i> APLIKASI TIDAK DITEMUKAN!</span> </div>');
                            owls.trigger('refresh.owl.carousel');
                        }
                    }
                });
            } else {
                $('.apps').show();
                $(".apps_search").html("");
                $("#search").val("");
                $(".info-error").html("");
                owls.trigger('refresh.owl.carousel');
            }
        });
    });
</script>
@endpush

@section('content')
<div class="row search">
    <div class="col-sm-1 col-12"></div>
    <div class="col-sm-10 col-12">
        <div class="row new_style">
            <div class="col-12 text-center mb-4">
                <div class="info-error"></div>
                <form>
                    <div class="inner-form">
                        <div class="input-field">
                            <button class="btn-search" type="button">
                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="24" viewBox="0 0 24 24">
                                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                                </svg>
                            </button>
                            <input id="search" type="text" placeholder="Search apps ..." />
                        </div>
                    </div>
                </form>
            </div>
            <div class="col-sm-1 col-1"></div>
            <div class="col-sm-10 col-10">
                <div class="owl-carousel apps">
                    @foreach($app_inter AS $items)
                    <div>
                        <a href="{{ $items->url }}" title="{{$items->nm_aplikasi}}" alt="{{$items->nm_aplikasi}}" target="_blank">
                            <div class="row">
                                <div class="col-12 text-center">
                                    <img src="{{ (!is_null($items->largeobject)) ? 'data:image/' . $items->largeobject->mime_type . ';base64,' . $items->largeobject->blob_content : asset('auth/img/logo.png') }}" class="img-responsive" alt="apps">
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-12 text-center">
                                    <span class="text-xs text-warning" style="font-weight: bold">{{ $items->nm_aplikasi }}</span>
                                </div>
                            </div>
                        </a>
                    </div>
                    @endforeach
                </div>
                <div class="owl-carousel apps_search"></div>
            </div>
            <div class="col-sm-1 col-1"></div>
        </div>
    </div>
    <div class="col-sm-1 col-12"></div>
</div>

@endsection
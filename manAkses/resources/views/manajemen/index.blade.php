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
        /* border-radius: 10px; */
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
    ::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
        color: black;
        opacity: 1; /* Firefox */
    }
    /* .card {
        border-radius: 10px;
        border-left: 5px solid #17a2b8;
    } */
    .content-wrapper {
        background: url('/images/bg-dashboard.png');
        background-position: center;
        background-repeat: no-repeat;
        background-size: 100% 100%;
    }
    svg {
        color: #fff;
    }
    @media only screen and (max-width: 1366px) {
        .new_style {
            padding: 0;
        }
    }
    @media only screen and (min-width: 1366px) {
        .new_style {
            padding: 20px;
        }
    }
    .apps > a {
        background: #fff;
    }
    .apps > a:hover > .card {
        background: #F0FFF0;
    }
    .apps_search > a:hover > .card {
        background: #F0FFF0;
    }
</style>
@endpush

@push('js')
<script>

    function fetch_data(page) {
        var l = window.location;
        $.ajax({
            url: l.origin + l.pathname + "?page=" + page,
            success: function(satwork) {
                $('.wrapper').html('');
                $('.wrapper').html(satwork);
            }
        });
    }

    $(document).ready(function(){
        //SEARCH
        $('#search').on('keyup change', function() {
            var name = $(this).val();
            console.log(name);
            if(name != "" && name != " ") {
                $.ajax({
                    url: '/apps/' + name,
                    type: "GET",
                    dataType: "json",
                    success:function(data)
                    {
                        if(data != ''){
                            $('.apps').hide();
                            $('.apps_search').show();
                            $(".apps_search").html("");
                            $(".info-error").html("");
                            $.each(data, function(key, item){
                                // var html = '<div class="col-md-2 col-6"> <a href="'+item.url+'" alt="'+item.nm_aplikasi+'" title="'+item.nm_aplikasi+'" target="_blank"> <div class="card"> <div class="row"> <div class="col-4 p-3"> <img id="' + key + '" src="' + item.url_logo + '" class="img-responsive" alt="apps" height="40" width="100%"> </div> <div class="col-8 pr-3" style="margin-top: auto; margin-bottom: auto;word-wrap: break-word;"> <span class="text-bold text-sm">'+item.nm_aplikasi+'</span> </div> </div> </div> </a> </div>';
                                var html = '<a class="col-md-3 col-12 px-0" href="'+item.url+'" alt="'+item.nm_aplikasi+'" title="'+item.nm_aplikasi+'" target="_blank"> <div class="card h-100"> <div class="col-12 px-3 pt-3"> <div class="ribbon-wrapper ribbon-lg"> <div class="ribbon bg-info" style="font-size:10px">'+item.nm_aplikasi+'</div> </div> <div class="col-11" style="margin-top: auto; margin-bottom: auto;word-wrap: break-word;"> <img id="' + key + '" src="' + item.url_logo + '" class="img-responsive mb-2" alt="apps" height="25px"><br> <span class="text-bold text-sm">'+item.ket_aplikasi+'</span><br> <small class="text-info">'+item.url+'</small> </div> </div> </div> </a>';
                                $(".apps_search").append(html);
                            });
                        } else {
                            $('.apps').show();
                            $(".apps_search").html("");
                            $(".info-error").html('<div class="alert alert-warning text-center" style="padding:0"> <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button> <span style="font-weight: bold;"><i class="icon fas fa-info-circle"></i> APLIKASI TIDAK DITEMUKAN!</span> </div>');
                        }
                    }
                });
            } else {
                $('.apps').show();
                $(".apps_search").html("");
                $("#search").val("");
                $(".info-error").html("");
            }
        });

        //Paginate
        $(document).on('click', '.paginate a', function(event) {
            event.preventDefault();
            var page = $(this).attr('href').split('page=')[1];
            fetch_data(page);
        });
    });
</script>
@endpush

@section('content')
<div class="row search">
    <div class="col-sm-12 col-12">
        <div class="row new_style">
            <div class="col-12 text-center mb-4 px-0">
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
            <div class="col-12">
                <div class="row apps">
                    @foreach($app_inter AS $items)
                    <a class="col-md-3 col-6 px-0" href="{!! $items->url !!}" alt="{!! $items->nm_aplikasi !!}" title="{!! $items->nm_aplikasi !!}" target="_blank">
                        <div class="card h-100">
                            <div class="col-12 px-3 pt-3">
                                <div class="ribbon-wrapper ribbon-lg">
                                    <div class="ribbon bg-info" style="font-size:10px">
                                        {!! $items->nm_aplikasi !!}
                                    </div>
                                </div>
                                <div class="col-11" style="margin-top: auto; margin-bottom: auto;word-wrap: break-word;">
                                    <img src="{{ (!is_null($items->largeobject)) ? 'data:image/' . $items->largeobject->mime_type . ';base64,' . $items->largeobject->blob_content : asset('auth/img/logo.png') }}" class="img-responsive mb-2" alt="apps" height="25px"><br>
                                    <span class="text-bold text-sm">{!! $items->ket_aplikasi !!}</span><br>
                                    <small class="text-primary">{!! $items->url !!}</small>
                                </div>
                            </div>
                        </div>
                    </a>
                    <!-- <div class="col-md-3 col-6">
                        <a href="{!! $items->url !!}" alt="{!! $items->nm_aplikasi !!}" title="{!! $items->nm_aplikasi !!}" target="_blank">
                            <div class="card">
                                <div class="row">
                                    <div class="col-4 p-3">
                                        <img src="{{ (!is_null($items->largeobject)) ? 'data:image/' . $items->largeobject->mime_type . ';base64,' . $items->largeobject->blob_content : asset('auth/img/logo.png') }}" class="img-responsive" alt="apps" height="50">
                                    </div>
                                    <div class="col-8 pr-3" style="margin-top: auto; margin-bottom: auto;word-wrap: break-word;">
                                        <span class="text-bold text-sm">{!! $items->nm_aplikasi !!}</span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div> -->
                    @endforeach
                    <div class="col-md-12 col-12 text-center my-4 paginate">
                        {!! $app_inter->links() !!}
                    </div>
                </div>
                <div class="row apps_search"></div>
            </div>
        </div>
    </div>
</div>

@endsection

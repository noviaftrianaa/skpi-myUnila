<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Document</title>
    {!! Html::style('bower_components/sweetalert/dist/sweetalert.css') !!}
    {!! Html::script('bower_components/jquery/dist/jquery.min.js') !!}
</head>
<body>
{!! Html::script('bower_components/sweetalert/dist/sweetalert.min.js') !!}
@include('sweet::alert')
<script type="text/javascript">
    var url = "{{ url('/') }}";
    swal({
        title: "Maaf!",
        text: "Anda Tidak memiliki hak akses ini",
        type: "warning",
        showCancelButton: false,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "OK",
        closeOnConfirm: false
    }, function(){
        window.location.href = url;
    });
</script>
</body>
</html>
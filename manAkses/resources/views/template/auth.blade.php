<!--
Author: W3layouts
Author URL: http://w3layouts.com
-->
<!DOCTYPE html>
<html lang="id">

<head>
  <title>@yield('title')</title>
  <!-- Meta tag Keywords -->
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta charset="UTF-8" />
  <!-- //Meta tag Keywords -->
  <link href="//fonts.googleapis.com/css2?family=Karla:wght@400;700&display=swap" rel="stylesheet">
  <!--/Style-CSS -->
  <link rel="stylesheet" href="{{asset('css/style.css')}}" type="text/css" media="all" />
  <!--//Style-CSS -->
</head>

<body>
  <!-- form section start -->
  <section class="w3l-workinghny-form" style="background: url() no-repeat;">
    
    @yield('content')
    
  </section>
  <!-- //form section start -->

  <script src="{!! asset('node_modules/sweetalert/dist/sweetalert.min.js') !!}"></script>
  @include('sweet::alert')
  
</body>

</html>
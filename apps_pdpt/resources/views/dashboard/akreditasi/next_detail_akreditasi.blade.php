<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Detail Mahasiswa</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-KK94CHFLLe+nY2dmCWGMq91rCGa5gtU4mk92HdvYe+M/SXH301p5ILy+dN9+nJOZ" crossorigin="anonymous">
    <style>
        body{
            background-color: #454d55;
        }
        table{
            margin-top: 30px;
            max-width: 60%;
            margin-left: 20%;
        }
        th{
            vertical-align: middle;
            text-align: center;
            color: #FFFFFF;
        }
        th.tabel{
            background-color: #007BFF;
        }
        th.tabel2{
            background-color: #3498DB;
        }
        td{
            color: #FFFFFF;
            text-align: center;
        }
        td.dalam{
            background-color: #007BFF;
            font-weight: 500;
        }
        h2{
            text-align: center;
            color: #FFFFFF;
            font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
        
        }
    </style>  
  </head>
  <body>
    <div class="container">
        <div style="padding-top: 50px;">
            <h2>LIST MAHASISWA</h2>
        </div>
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th class="tabel" scope="col">No</th>
                    <th class="tabel" scope="col">Nama Mahasiswa Baru</th>
                    <th class="tabel" scope="col">NPM</th>
                </tr>
                <tr>
                    <th class="tabel2">1</th>
                    <th class="tabel2">2</th>
                    <th class="tabel2">3</th>
                </tr>
                @php
                $idx = 1;
            @endphp
            @foreach ($mahasiswa as $mhs)
            </thead>
            <tbody style="background-color: #343A40;">
                <tr>
                    <td class="dalam">{{$idx++}}</td>
                    <td>{{$mhs->nama}}</td>
                    <td>{{$mhs->npm}}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ENjdO4Dr2bkBIFxQpeoTz1HIcje39Wm4jDKdf19U8gI4ddQ3GYNS7NTKfAdVQSZe" crossorigin="anonymous"></script>
  </body>
</html>
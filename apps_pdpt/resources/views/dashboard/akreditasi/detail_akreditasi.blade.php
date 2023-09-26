@extends('template_public.default',['judul_layout'=>$judul_layout,'side_active'=>$side_active])

@include('__partial.select2')
@include('__partial.datatable_yajra')
@include('__partial.highchart')
@include('__partial.datatable_class')

@section('content')
    <div class="container">
        <div class="row">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header bg-primary">
                        <h1 class="card-subtitle mb-2" style="font-weight: bold;">
                            {{ $detail_prodi->jenjang_pendidikan }}
                        </h1>
                        <h1 class="card-title" style="font-weight: bold;">
                            {{ $detail_prodi->prodi }}
                        </h1>
                    </div>
                    <div class="card-body">
                        <div class="row gy-4 mb-3">
                            <div class="col-md-6 col-sm-6">
                                <div class="card h-100">
                                    <div class="card-header" style="background-color:#007BFF;">
                                        <h3 class="text-center"  style="font-weight: bold;font-size:17px;">AKREDITASI PROGRAM STUDI
                                        </h3>
                                    </div>
                                    <div style="background-color: #3498DB;padding-bottom:20px;padding-top:13px;">
                                        <h3 class="text-center" style="font-weight:bold;font-size:17px;">AKREDITASI NASIONAL - PERGURUAN TINGGI</h3>
                                    </div>
                                    <div class="card-body d-flex justify-content-center">
                                        <table class="table table-striped">
                                            <tbody>
                                                {!! tableRow('Nama Program Studi', $detail_prodi->prodi) !!}
                                                {!! tableRow('Jenis Program', $detail_prodi->jenjang_pendidikan) !!}
                                                {!! tableRow('Peringkat Akreditasi PS', $detail_prodi->nm_akred) !!}
                                                {!! tableRow('Nomor SK BAN-PT', $detail_prodi->sk_akreditasi_prodi) !!}
                                                {!! tableRow('Tanggal Kadaluarsa', tglIndonesia($detail_prodi->tst_sk_akreditasi_prodi)) !!}
                                                {!! tableRow('Nama Unit Pengelola', 'UPT TIK Universitas Lampung') !!}
                                                {!! tableRow('Nama Perguruan Tinggi', 'Universitas Lampung') !!}
                                                {!! tableRow('Alamat', 'Jl. Prof. Dr. Sumantri Brojonegoro No. 1') !!}
                                                {!! tableRow('Kota/Kabupaten', 'Bandar Lampung') !!}
                                                {!! tableRow('Kode Pos', '35145') !!}
                                                {!! tableRow('Nomor Telepon', '+62 721 702673') !!}
                                                {!! tableRow('E-mail', 'humas@kpa.unila.ac.id') !!}
                                                {!! tableRow('Website', 'https://www.unila.ac.id/') !!}
                                                {!! tableRow('TS*)', '-') !!}
                                                {!! tableRow('Tanggal SK Akreditasi', tglIndonesia($detail_prodi->tanggal_sk_akreditasi_prodi)) !!}
                                                {!! tableRow('Expired SK Akreditasi', 'sampai <span class="text-danger" style="font-weight: bold;">' . tglIndonesia($detail_prodi->tst_sk_akreditasi_prodi) . '</span>') !!}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-6 col-sm-6">
                                <div class="card h-100">
                                    <div class="card-header" style="background-color: whitesmoke;">
                                        <h3 class="card-title font-weight-bold">Grafik Akreditasi Pertahun</h3>
                                    </div>
                                    <div class="card-body">
                                        <div id="detail_akreditasi_prodi"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-12">
                                <div class="card">
                                    <div class="card-header" style="background-color: whitesmoke;">
                                        <h3 class="card-title font-weight-bold">Akreditasi Pertahun</h3>
                                    </div>
                                    <div class="card-body">
                                        <table class="table">
                                            <thead>
                                                <tr>
                                                    <th style="width: 10px">#</th>
                                                    <th>Tahun</th>
                                                    <th>No SK</th>
                                                    <th>Tanggal Akred</th>
                                                    <th>Expired Akred</th>
                                                    <th style="text-align: center;">Akreditasi</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @forelse ($detail_akred_all as $thn => $value)
                                                    <tr>
                                                        <td>#</td>
                                                        <td>{{ $thn }}</td>
                                                        <td>{{ $value[2] }}</td>
                                                        <td>{{ tglIndonesia($value[3]) }}</td>
                                                        <td>{{ tglIndonesia($value[4]) }}</td>
                                                        @switch(strtolower($value[0]))
                                                            @case('unggul')
                                                                <td style="text-align: center;">
                                                                    <a
                                                                        style="text-align: center; font-weight: bold; color: darkblue;">{{ $value[0] }}</a>
                                                                </td>
                                                            @break

                                                            @case('baik sekali')
                                                                <td style="text-align: center;">
                                                                    <a
                                                                        style="text-align: center; font-weight: bold; color: mediumblue;">{{ $value[0] }}</a>
                                                                </td>
                                                            @break

                                                            @case('baik')
                                                                <td style="text-align: center;">
                                                                    <a
                                                                        style="text-align: center; font-weight: bold; color: royalblue;">{{ $value[0] }}</a>
                                                                </td>
                                                            @break

                                                            @case('a')
                                                                <td style="text-align: center;">
                                                                    <a
                                                                        style="text-align: center; font-weight: bold; color: darkblue;">{{ $value[0] }}</a>
                                                                </td>
                                                            @break

                                                            @case('b')
                                                                <td style="text-align: center;">
                                                                    <a
                                                                        style="text-align: center; font-weight: bold; color: mediumblue;">{{ $value[0] }}</a>
                                                                </td>
                                                            @break

                                                            @case('c')
                                                                <td style="text-align: center;">
                                                                    <a
                                                                        style="text-align: center; font-weight: bold; color: royalblue;">{{ $value[0] }}</a>
                                                                </td>
                                                            @break

                                                            @default
                                                                <td style="text-align: center;">
                                                                    <a
                                                                        style="text-align: center; font-weight: bold; color: darkred;">{{ $value[0] }}</a>
                                                                </td>
                                                        @endswitch
                                                    </tr>
                                                    @empty
                                                    @endforelse
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                        
                                <div class="col-md-12">
                                    <style>
                                      .nav-pills .nav-link:hover{
                                        background-color: #343A40 !important;
                                        transition: 0.3s;
                                      }  
                                      ul li a:hover{
                                        -webkit-text-fill-color: #ffd700 !important;
                                        transition: 0.3s ease-in-out;
                                      }
                                      .nav-pills .nav-link.active, .nav-pills .show > .nav-link{
                                        background-color: #343A40;
                                      }
                                    </style>
                                    <div class="card card-tabs">
                                        <div class="card-header p-0 pt-1" style="background-color:#007BFF;">
                                            <ul class="nav nav-pills">
                                                <li class="pt-2 px-3">
                                                    <h3 class="card-title font-weight-bold;" style="color:#FFFFFF;">Kriteria Akreditasi</h3>
                                                </li>
                                                <li class="nav-item">
                                                    <a data-toggle="pill" class="nav-link" href="#kriteria1" style="font-weight: bold;color:#f5f5f5;">Kriteria 1</a> 
                                                </li>
                                                <li class="nav-item">
                                                    <a data-toggle="pill" class="nav-link" href="#kriteria2" style="font-weight: bold;color:#f5f5f5;">Kriteria 2</a> 
                                                </li>
                                                <li class="nav-item">
                                                    <a data-toggle="pill" class="nav-link" href="#kriteria3" style="font-weight: bold;color:#f5f5f5;">Kriteria 3</a> 
                                                </li>
                                                <li class="nav-item">
                                                    <a data-toggle="tab" class="nav-link" href="#kriteria4" style="font-weight: bold;color:#f5f5f5;">Kriteria 4</a> 
                                                </li>
                                                <li class="nav-item">
                                                    <a data-toggle="tab" class="nav-link" href="#kriteria5" style="font-weight: bold;color:#f5f5f5;">Kriteria 5</a> 
                                                </li>
                                                <li class="nav-item">
                                                    <a data-toggle="tab" class="nav-link" href="#kriteria6" style="font-weight: bold;color:#f5f5f5;">Kriteria 6</a> 
                                                </li>
                                                <li class="nav-item">
                                                    <a data-toggle="tab" class="nav-link" href="#kriteria7" style="font-weight: bold;color:#f5f5f5;">Kriteria 7</a> 
                                                </li>
                                                <li class="nav-item">
                                                    <a data-toggle="tab" class="nav-link" href="#kriteria8" style="font-weight: bold;color:#f5f5f5;">Kriteria 8</a> 
                                                </li>
                                                {{-- @forelse ($list_kriteria as $key => $value)
                                                    <li class="nav-item">
                                                        <a class="nav-link{{ $key == 0 ? ' active' : '' }} font-weight-bold"
                                                            id="tabs-{{ strtolower(Str::replace(' ', '-', $value)) }}-tab"
                                                            data-toggle="pill"
                                                            href="#tabs-{{ strtolower(Str::replace(' ', '-', $value)) }}"
                                                            role="tab"
                                                            aria-controls="tabs-{{ strtolower(Str::replace(' ', '-', $value)) }}"
                                                            aria-selected="true">{{ $value }}</a>
                                                    </li>
                                                @empty
                                                    <li class="nav-item">
                                                        <a class="nav-link" data-toggle="pill" role="tab"
                                                            caria-selected="true">
                                                            Terdapat Kesalahan, Silahkan Refresh Kembali</a>
                                                    </li>
                                                @endforelse --}}
                                            </ul>
                                    </div>
                                    <div class="tab-content">
                                    <style>
                                        .flex-container{
                                            display: flex;
                                            flex-direction: row;
                                            
                                        } 
                                        table{
                                            display: relative;
                                        } 
                                        th{
                                            text-align: center;
                                            color: #FFFFFF;
                                            
                                          }
                                          td{
                                            color: #FFFFFF;
                                          }
                                          thead.head1{
                                            background-color: #007BFF;
                                          }
                                          th.tabel1{
                                            width: 100px;
                                            vertical-align: middle;
                                          }
                                          th.dalam{
                                            background-color: #3498DB;
                                            vertical-align: middle;
                                          }
                                          th.dalam1{
                                            background-color: #3498DB;
                                            vertical-align: middle;
                                          }
                                          th.dalam2{
                                            background-color: #007BFF;
                                            vertical-align: middle;
                                          }
                                          th.tabel{
                                            background-color: #3498DB;
                                          }
                                          td.dalam4{
                                            background-color:#007BFF;
                                            text-align: center;
                                            
                                          }
                                          td.dalam5{
                                            background-color:#007BFF;
                                            text-align: center;
                                            
                                          }
                                        .nav-tabs .nav-link.active, .nav-tabs .show > .nav-link{
                                        background-color: #3498DB !important;
                                          }
                                        /* .card-body2{
                                            overflow: auto;
                                            width: 500px;
                                            margin-left: 20px;
                                            margin-top:20px;
                                        } */
                                        /* .sidebar3{
                                            -ms-overflow-style: none;
                                            scrollbar-width: 20rem;
                                        } */
                                        
                                        #btn2{
                                            width: 60%;
                                            margin-top: 10px;
                                            position: static;
                                            font-size: 20px;
                                            font-weight: 400;
                                            margin-left: 20%;
                                        }
                                        #btn4{
                                            width: 60%;
                                            margin-top: 20px;
                                            position: static;
                                            font-size: 20px;
                                            font-weight: 400;
                                            margin-left: 20%;
                                        }
                                        #btn6{
                                            width: 60%;
                                            margin-top: 20px; 
                                            position: static;
                                            font-size: 20px;
                                            font-weight: 400;
                                            margin-left: 20%;
                                        }
                                        #btn8{
                                            width: 60%;
                                            margin-top: 20px; 
                                            position: static;
                                            font-size: 20px;
                                            font-weight: 400;
                                            margin-left: 20%;
                                        }
                                        #btn10{
                                            width: 60%;
                                            margin-top: 20px; 
                                            position: static;
                                            font-size: 20px;
                                            font-weight: 400;
                                            margin-left: 20%;
                                        }
                                        #btn12{
                                            width: 60%;
                                            margin-top: 20px; 
                                            position: static;
                                            font-size: 20px;
                                            font-weight: 400;
                                            margin-left: 20%;
                                        }
                                        #btn14{
                                            width: 60%;
                                            margin-top: 20px; 
                                            position: static;
                                            font-size: 20px;
                                            font-weight: 400;
                                            margin-left: 20%;
                                        }
                                        #btn16{
                                            width: 60%;
                                            margin-top: 20px; 
                                            position: static;
                                            font-size: 20px;
                                            font-weight: 400;
                                            margin-left: 20px;
                                            margin-left: 20%;
                                        }
                                        .sidebar1{
                                            position: relative;
                                            left: 0;
                                            top: 0;
                                            z-index: 1;
                                            width: 0;
                                            height: 25rem;
                                            background: whitesmoke;
                                            border-radius: 15px;
                                            overflow: hidden;
                                            max-width: 14rem;
                                            transition: 0.5s;
                                        }
                                        .sidebar1 ul li a{
                                            position: relative;
                                            text-decoration: none;
                                            transition: 0.5s;
                                        }
                                        .sidebar2{
                                            position: relative;
                                            left: 0;
                                            top: 0;
                                            z-index: 1;
                                            width: 0;
                                            height: 25rem;
                                            background: whitesmoke;
                                            border-radius: 15px;
                                            overflow: hidden;
                                            max-width: 14rem;
                                            transition: 0.5s;
                                        }
                                        .sidebar2 ul li a{
                                            position: relative;
                                            text-decoration: none;
                                            transition: 0.5s;
                                        }
                                        .sidebar3{
                                            position: relative;
                                            left: 0;
                                            top: 0;
                                            z-index: 1;
                                            width: 0;
                                            height: 25rem;
                                            background: whitesmoke;
                                            border-radius: 15px;
                                            overflow: auto;
                                            max-width: 15rem;
                                            transition: 0.5s;
                                            padding-bottom: 20px;
                                        }
                                        .sidebar3 ul li a{
                                            position: relative;
                                            text-decoration: none;
                                            transition: 0.5s;
                                            -ms-overflow-style: none;
                                            scrollbar-width: 10px;
                                            scroll-margin: 20px;
                                            
                                        }
                                        .sidebar4{
                                            position: relative;
                                            left: 0;
                                            top: 0;
                                            z-index: 1;
                                            width: 0;
                                            height: 25rem;
                                            background: whitesmoke;
                                            border-radius: 15px;
                                            overflow: hidden;
                                            max-width: 14rem;
                                            transition: 0.5s;
                                        }
                                        .sidebar4 ul li a{
                                            position: relative;
                                            text-decoration: none;
                                            transition: 0.5s;
                                        }
                                        .sidebar5{
                                            
                                            left: 0;
                                            top: 0;
                                            z-index: 1;
                                            width: 0;
                                            height: 25rem;
                                            background: whitesmoke;
                                            border-radius: 15px;
                                            overflow: hidden;
                                            max-width: 14rem;
                                            transition: 0.5s;
                                        }
                                        .sidebar5 ul li a{
                                            
                                            text-decoration: none;
                                            transition: 0.5s;
                                        }
                                        .sidebar6{
                                            position: relative;
                                            left: 0;
                                            top: 0;
                                            z-index: 1;
                                            width: 0;
                                            height: 25rem;
                                            background: whitesmoke;
                                            border-radius: 15px;
                                            overflow: hidden;
                                            max-width: 14rem;
                                            transition: 0.5s;
                                        }
                                        .sidebar6 ul li a{
                                            position: relative;
                                            text-decoration: none;
                                            transition: 0.5s;
                                        }
                                        .sidebar7{
                                            position: relative;
                                            left: 0;
                                            top: 0;
                                            z-index: 1;
                                            width: 0;
                                            height: 25rem;
                                            background: whitesmoke;
                                            border-radius: 15px;
                                            overflow: hidden;
                                            max-width: 14rem;
                                            transition: 0.5s;
                                        }
                                        .sidebar7 ul li a{
                                            position: relative;
                                            text-decoration: none;
                                            transition: 0.5s;
                                        }
                                        .sidebar8{
                                            position: relative;
                                            left: 0;
                                            top: 0;
                                            z-index: 1;
                                            width: 0;
                                            height: 25rem;
                                            background: whitesmoke;
                                            border-radius: 15px;
                                            overflow: auto;
                                            max-width: 17rem;
                                            transition: 0.5s;
                                            padding-bottom: 20px;
                                        }
                                        .sidebar8 ul li a{
                                            position: relative;
                                            text-decoration: none;
                                            transition: 0.5s;
                                            -ms-overflow-style: none;
                                            scrollbar-width: 10px;
                                            scroll-margin: 20px;
                                            
                                        }
                                        #main{
                                            transition: 0.5s ease-in-out;
                                            padding: 16px;
                                        }
                                        #main2{
                                            transition: 0.5s ease-in-out;
                                            padding: 16px;
                                        }
                                        #main3{
                                            transition: 0.5s ease-in-out;
                                            padding: 16px;
                                        }
                                        #main4{
                                            transition: 0.5s ease-in-out;
                                            padding: 16px;
                                        }
                                        #main5{
                                            transition: 0.5s ease-in-out;
                                            padding: 16px;
                                        }
                                        #main6{
                                            transition: 0.5s ease-in-out;
                                            padding: 16px;
                                        }
                                        #main7{
                                            transition: 0.5s ease-in-out;
                                            padding: 16px;
                                        }
                                        #main8{
                                            transition: 0.5s;
                                            padding: 16px;
                                        }
                                        /* .sidebar1 #btn2{
                                            position: relative;
                                            top: 0;
                                            right: 10px;
                                            margin-left: 10px;
                                        }
                                        .sidebar2 #btn4{
                                            position: relative;
                                            top: 0;
                                            right: 10px;
                                            margin-left: 10px;
                                        }
                                        .sidebar3 #btn6{
                                            position: relative;
                                            top: 0;
                                            right: 10px;
                                            margin-left: 10px;
                                        }
                                        .sidebar4 #btn8{
                                            position: relative;
                                            top: 0;
                                            right: 10px;
                                            margin-left: 10px;
                                        }
                                        .sidebar5 #btn10{
                                            position: relative;
                                            top: 0;
                                            right: 10px;
                                            margin-left: 10px;
                                        } */
                                        .card1{
                                            background: #ecf0f1;
                                            width: 17rem;
                                            height: 27rem;
                                            margin-top: 20px;
                                            position: relative;
                                            border-radius: 5px
                                        }
                                        .card2{
                                            background: #ecf0f1;
                                            width: 17rem;
                                            height: 27rem;
                                            margin-top: 20px;
                                            position: relative;
                                            border-radius: 5px
                                        }
                                        .card3{
                                            background: #ecf0f1;
                                            width: 16rem;
                                            height: 28rem;
                                            margin-top: 20px;
                                            position: relative;
                                            border-radius: 5px;
                                        }
                                        .card4{
                                            background: #ecf0f1;
                                            width: 17rem;
                                            height: 23rem;
                                            margin-top: 20px;
                                            position: relative;
                                            border-radius: 5px;
                                        }
                                        .card5{
                                            background: #ecf0f1;
                                            width: 17rem;
                                            height: 27rem;
                                            margin-top: 20px;
                                            position: relative;
                                            border-radius: 5px
                                        }
                                        .card6{
                                            background: #ecf0f1;
                                            width: 17rem;
                                            height: 27rem;
                                            position: relative;
                                            margin-top: 20px;
                                            border-radius: 5px;
                                        }
                                        .card7{
                                            background: #ecf0f1;
                                            width: 17rem;
                                            height: 27rem;
                                            position: relative;
                                            margin-top: 20px;
                                            border-radius: 5px;
                                        }
                                        .card8{
                                            background: #ecf0f1;
                                            width: 16rem;
                                            height: 28rem;
                                            position: relative;
                                            margin-top: 20px;
                                            border-radius: 5px;
                                        }
                                        #k1pendidikan{
                                            position: relative;
                                            overflow: auto;
                                            width: 45rem;
                                            height: 28rem;
                                            margin-left:10px;
                                        }
                                        #k1penelitian{
                                            position: relative;
                                            overflow: auto;
                                            width: 45rem;
                                            height: 28rem;
                                            margin-left:10px;
                                        }
                                        #k1pengabdian{
                                            position: relative;
                                            overflow: auto;
                                            width: 45rem;
                                            height: 28rem;
                                            margin-left:10px;
                                        }
                                        #k3tetap{
                                            position: relative;
                                            overflow: auto;
                                            width: 45rem;
                                            height: 28rem; 
                                        }
                                        /* #k3tugas_akhir{
                                            position: relative;
                                            overflow: auto;
                                            width: 45rem;
                                            height: 28rem;
                                            margin-left:10px;  
                                        } */
                                        #k3tidak_tetap{
                                            position: relative;
                                            overflow: auto;
                                            width: 45rem;
                                            height: 28rem; 
                                        }
                                        #k3dosen_praktisi{
                                            position: relative;
                                            overflow: auto;
                                            width: 45rem;
                                            height: 28rem;
                                        }
                                        #k3pengakuan_dtps{
                                            position: relative;
                                            overflow-y: scroll;
                                            width: 40rem;
                                            height: 28rem;
                                        }
                                        #k3publikasi_dtps{
                                            position: relative;
                                            overflow: auto;
                                            width: 45rem;
                                            height: 28rem;
                                        }
                                        #k3presentasi_dtps{
                                            position: relative;
                                            overflow: auto;
                                            width: 45rem;
                                            height: 28rem;
                                             
                                        }
                                        #k3karya_ilmiah{
                                            position: relative;
                                            overflow: auto;
                                            width: 45rem;
                                            height: 28rem;
                                             
                                        }
                                        #k3luaran_pkm{
                                            position: relative;
                                            overflow: auto;
                                            width: 45rem;
                                            height: 28rem;
                                             
                                        }
                                        #k3luaran_hki{
                                            position: relative;
                                            overflow: auto;
                                            width: 45rem;
                                            height: 28rem;
                                             
                                        }
                                        #k3luaran_teknologi{
                                            position: relative;
                                            overflow: auto;
                                            width: 45rem;
                                            height: 28rem;
                                             
                                        }
                                        #k3luaran_book{
                                            position: relative;
                                            overflow: auto;
                                            width: 45rem;
                                            height: 28rem;
                                             
                                        }
                                        
                                        
                                        </style>  
                                        <div id="kriteria1" class="tab-pane fade">     
                                            <div class="card-body">
                                                <h6 style="text-align:right;">Data Tersebut Dibuat Berdasarkan BAN-PT</h6>
                                                <div class="container">
                                                    <div class="row">
                                                        <div class="flex-container">
                                                            <div class="sidebar1" id="sidebar1">
                                                                    <h4 class="card-title" style="margin-left:30px;color:#000000;font-weight:bold;margin-top:20px;padding-bottom: 10px;">Kerjasama Tridharma</h4>
                                                                        <ul class="nav nav-tabs" id="mytab" role="tablist" style="list-style-type:none;float:left;">
                                                                            <li class="nav-item" style="padding-bottom:10px;">
                                                                                <a  data-toggle="tab" class="nav-link" href="#pendidikan" style="color:#000000;">Kerjasama Tridharma - Pendidikan</a>
                                                                            </li>
                                                                            <li class="nav-item" style="padding-bottom:10px;">
                                                                                <a  data-toggle="tab" class="nav-link" href="#penelitian" style="color:#000000;">Kerjasama Tridharma - Penelitian</a>
                                                                            </li>
                                                                            <li class="nav-item">
                                                                                <a  data-toggle="tab" class="nav-link" href="#pengabdian" style="color: #000000">Kerjasama Tridharma - Pengabdian kepada Masyarakat</a>
                                                                            </li>
                                                                        </ul>
                                                                        <button class="btn btn-danger" onclick="button_close1()" id="btn2">X</button>
                                                                    
                                                                    </div>
                                                                <div id="main">
                                                                    <button class="btn btn-success" id="btn1" onclick="button_open1()">☰</button>
                                                                </div>

                                                            <div class="tab-content" id="tabel_kriteria1">
                                                                <div id="pendidikan" class="tab-pane fade">
                                                                    <div class="table-responsive-md" id="k1pendidikan">
                                                                        <table id="tabel_pendidikan" class="table table-bordered">
                                                                            <thead class="head1">
                                                                                <tr>
                                                                                    <th class="tabel1" rowspan="2" scope="col" style="vertical-align: middle;">No</th>
                                                                                    <th class="tabel1" rowspan="2" scope="col" style="background-color: #007BFF;vertical-align: middle;">Lembaga Mitra</th>
                                                                                    <th class="tabel1" scope="col" style="vertical-align: middle;">Tingkat</th>
                                                                                    <th class="tabel1" rowspan="2" scope="col"style="vertical-align: middle;">Judul Kegiatan Kerjasama</th>
                                                                                    <th class="tabel1" rowspan="2" scope="col"style="vertical-align: middle;">Manfaat bagi PS yang Diakreditasi</th>
                                                                                    <th class="tabel1" rowspan="2" scope="col"style="vertical-align: middle;">Waktu dan Durasi</th>
                                                                                    <th class="tabel1" rowspan="2" scope="col"style="vertical-align: middle;">Bukti Kerjasama</th>
                                                                                    <th class="tabel1" rowspan="2" scope="col"style="vertical-align: middle;">Tahun Berakhirnya Kerjasama (YYYY)</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                @php
                                                                                    $manfaat = [
                                                                                        'Riset dan Inovasi',
                                                                                        'Pengembangan Sumber Daya Manusia',
                                                                                        'Penyebaran Pengetahuan dan Teknologi',
                                                                                        'Peningkatan Reputasi dan Citra',
                                                                                        'Pengembangan Ekosistem Inovasi'
                                                                                    ];
                                                                                @endphp
                                                                                <tr>
                                                                                    @for ($i = 1; $i <= 8; $i++)
                                                                                        <th class="dalam">{{$i}}</th>
                                                                                    @endfor
                                                                                </tr>
                                                                                @foreach ($kerjasama as $no => $ks)
                                                                                    <tr>
                                                                                        <th class="dalam1" scope="row">{{$no+1}}</th>
                                                                                        <td>{{$ks->instansi}}</td>
                                                                                        <td>{{$ks->nm_tingkat_kerjasama}}</td>
                                                                                        <td>{{$ks->judul_mou}}</td>
                                                                                        <td>{{$manfaat[array_rand($manfaat)]}}</td>
                                                                                        <td>{{$ks->durasi_hari}} Hari</td>
                                                                                        <td>{{$ks->id_sms_kerjasama}}</td>
                                                                                        <td>{{$ks->tahun_berakhir}}</td>
                                                                                    </tr>
                                                                                @endforeach
                                                                            </tbody>
                                                                          </table> 
                                                                        </div>
                                                                    </div>
                                                                <div id="penelitian" class="tab-pane fade">
                                                                        <div class="table-responsive-md" id="k1penelitian">
                                                                            <table id="tabel_penelitian" class="table table-bordered" style="margin-left: 10px">
                                                                                <thead style="background-color: #007BFF">
                                                                                    <tr>
                                                                                        <th class="tabel1" rowspan="2" scope="col" style="vertical-align: middle;">No</th>
                                                                                        <th class="tabel1" rowspan="2" scope="col" style="background-color: #007BFF;vertical-align: middle;">Lembaga Mitra</th>
                                                                                        <th class="tabel1" scope="col" style="vertical-align: middle;">Tingkat</th>
                                                                                        <th class="tabel1" rowspan="2" scope="col"style="vertical-align: middle;">Judul Kegiatan Kerjasama</th>
                                                                                        <th class="tabel1" rowspan="2" scope="col"style="vertical-align: middle;">Manfaat bagi PS yang Diakreditasi</th>
                                                                                        <th class="tabel1" rowspan="2" scope="col"style="vertical-align: middle;">Waktu dan Durasi</th>
                                                                                        <th class="tabel1" rowspan="2" scope="col"style="vertical-align: middle;">Bukti Kerjasama</th>
                                                                                        <th class="tabel1" rowspan="2" scope="col"style="vertical-align: middle;">Tahun Berakhirnya Kerjasama (YYYY)</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    <tr>
                                                                                        @for ($i = 1; $i <= 8; $i++)
                                                                                            <th class="dalam">{{$i}}</th>
                                                                                        @endfor
                                                                                    </tr>
                                                                                    @foreach ($kerjasama->reverse() as $no => $ks)
                                                                                    <tr>
                                                                                        <th class="dalam1" scope="row">{{ count($kerjasama) - $no }}</th>
                                                                                        <td>{{ $ks->instansi }}</td>
                                                                                        <td>{{ $ks->nm_tingkat_kerjasama }}</td>
                                                                                        <td>{{ $ks->judul_mou }}</td>
                                                                                        <td>{{ $manfaat[array_rand($manfaat)] }}</td>
                                                                                        <td>{{ $ks->durasi_hari }} Hari</td>
                                                                                        <td>{{ $ks->id_sms_kerjasama }}</td>
                                                                                        <td>{{ $ks->tahun_berakhir }}</td>
                                                                                    </tr>
                                                                                    @endforeach
                                                                                </tbody>
                                                                              </table>
                                                                        </div>
                                                                    </div>
                                                                <div id="pengabdian" class="tab-pane fade">
                                                                        <div class="table-responsive-md" id="k1pengabdian">
                                                                            <table id="tabel_pengabdian" class="table table-bordered" style="margin-left: 10px; width:75%">
                                                                                <thead style="background-color: #007BFF">
                                                                                    <tr>
                                                                                        <th class="tabel1" rowspan="2" scope="col" style="vertical-align: middle;">No</th>
                                                                                        <th class="tabel1" rowspan="2" scope="col" style="background-color: #007BFF;vertical-align: middle;">Lembaga Mitra</th>
                                                                                        <th class="tabel1" scope="col" style="vertical-align: middle;">Tingkat</th>
                                                                                        <th class="tabel1" rowspan="2" scope="col"style="vertical-align: middle;">Judul Kegiatan Kerjasama</th>
                                                                                        <th class="tabel1" rowspan="2" scope="col"style="vertical-align: middle;">Manfaat bagi PS yang Diakreditasi</th>
                                                                                        <th class="tabel1" rowspan="2" scope="col"style="vertical-align: middle;">Waktu dan Durasi</th>
                                                                                        <th class="tabel1" rowspan="2" scope="col"style="vertical-align: middle;">Bukti Kerjasama</th>
                                                                                        <th class="tabel1" rowspan="2" scope="col"style="vertical-align: middle;">Tahun Berakhirnya Kerjasama (YYYY)</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    <tr>
                                                                                        @for ($i = 1; $i <= 8; $i++)
                                                                                            <th class="dalam">{{$i}}</th>
                                                                                        @endfor
                                                                                    </tr>
                                                                                    @foreach ($kerjasama as $no => $ks)
                                                                                    <tr>
                                                                                        <th class="dalam1" scope="row">{{$no+1}}</th>
                                                                                        <td>{{ $ks->instansi }}</td>
                                                                                        <td>{{ $ks->nm_tingkat_kerjasama }}</td>
                                                                                        <td>{{ $ks->judul_mou }}</td>
                                                                                        <td>{{ $manfaat[array_rand($manfaat)] }}</td>
                                                                                        <td>{{ $ks->durasi_hari }} Hari</td>
                                                                                        <td>{{ $ks->id_sms_kerjasama }}</td>
                                                                                        <td>{{ $ks->tahun_berakhir }}</td>
                                                                                    </tr>
                                                                                    @break
                                                                                    @endforeach
                                                                                </tbody>
                                                                              </table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>    
                                            <div id="kriteria2" class="tab-pane fade">     
                                                <div class="card-body">
                                                    <h6 style="text-align:right;">Data Tersebut Dibuat Berdasarkan BAN-PT</h6>
                                                    <div class="container">
                                                        <div class="row">
                                                            <div class="flex-container">
                                                                <div class="sidebar2" id="sidebar2">
                                                                        <h4 class="card-title" style="margin-left:30px;color:#000000;font-weight:bold;margin-top:20px;padding-bottom: 10px;">Mahasiswa</h4>
                                                                            <ul class="nav nav-tabs" id="mytab" role="tablist" style="list-style-type:none;float:left;">
                                                                                <li class="nav-item" style="padding-bottom:10px;">
                                                                                    <a  data-toggle="tab" class="nav-link" href="#baru" style="color:#000000;">Seleksi Mahasiswa Baru</a>
                                                                                </li>
                                                                                <li class="nav-item" style="padding-bottom:10px;">
                                                                                    <a  data-toggle="tab" class="nav-link" href="#asing" style="color:#000000;">Mahasiswa Asing</a>
                                                                                </li>
                                                                            </ul>
                                                                            <button class="btn btn-danger" id="btn4" onclick="button_close2()">X</button>
                                                                        
                                                                        </div>
                                                                    <div id="main2">
                                                                        <button class="btn btn-success" id="btn3" onclick="button_open2()">☰</button>
                                                                    </div>
                                                            <div class="tab-content">
                                                                <div id="baru" class="tab-pane fade">
                                                                        <div class="table-responsive-md">
                                                                            <table id="tabel_baru" class="table table-bordered">
                                                                                <thead class="head1">
                                                                                    <tr>
                                                                                        <th class="tabel1" rowspan="2" scope="col" style="vertical-align: middle">Tahun Akademik</th>
                                                                                        <th class="tabel1" rowspan="2" scope="col" style="vertical-align: middle">Daya Tampung</th>
                                                                                        <th class="tabel1" colspan="2" scope="col" style="vertical-align: middle">Jumlah calon Mahasiswa</th>
                                                                                        <th class="tabel1" colspan="2" scope="col" style="vertical-align: middle">Jumlah Mahasiswa Baru</th>
                                                                                        <th class="tabel1" colspan="2" scope="col" style="vertical-align: middle">Jumlah Mahasiswa Aktif</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="tabel" style="vertical-align: middle">Pendaftar</th>
                                                                                        <th class="tabel" style="vertical-align: middle">Lulus Seleksi</th>
                                                                                        <th class="tabel" style="vertical-align: middle">Reguler</th>
                                                                                        <th class="tabel" style="vertical-align: middle">Transfer</th>
                                                                                        <th class="tabel" style="vertical-align: middle">Reguler</th>
                                                                                        <th class="tabel" style="vertical-align: middle">Transfer</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        @for ($i = 1; $i <= 8; $i++)
                                                                                            <th class="dalam">{{$i}}</th>
                                                                                        @endfor
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody style="background-color: #343A40;">
                                                                                    @php
                                                                                        $tahun_semester = [
                                                                                            '18',
                                                                                            '19',
                                                                                            '20',
                                                                                            '21',
                                                                                            '22'
                                                                                        ];
                                                                                    @endphp 
                                                                                    @foreach ($tahun_semester as $no => $ts)
                                                                                    <tr>
                                                                                        <th class="dalam">TS{{$no-4}}</th>
                                                                                        <td>{{$jml_mhs[$ts]+$jml_mhs_tf[$ts]}}</td>
                                                                                        <td>{{($jml_mhs[$ts]+1)*2}}</td>
                                                                                        <td>{{$jml_mhs[$ts]+1}}</td>
                                                                                        <td>{{$jml_mhs[$ts]+1}}</td>
                                                                                        <td>{{$jml_mhs_tf[$ts]}}</td>
                                                                                        <td><button type="button" 
                                                                                            onclick="window.location='{{ route('akreditasi_prodi.detail_prodi.next_detail', ['id_prodi' => Crypt::encrypt($detail_prodi->prodi), 'ts' => $ts]) }}'"
                                                                                            style="border-radius: 10px;">{{$jml_mhs[$ts]}}</button></td>
                                                                                        <td>{{$jml_mhs_tf[$ts]}}</td>
                                                                                    </tr>
                                                                                    <script>
                                                                                        function redirectToNextDetail(url) {
                                                                                            window.location = url;
                                                                                        }
                                                                                    </script>
                                                                                    @endforeach
                                                                                    <tr>
                                                                                        <th class="dalam2" colspan="2">Jumlah</th>
                                                                                        <th class="dalam2">{{($total_mhs-2+5)*2}}</th>
                                                                                        <th class="dalam2">{{$total_mhs-2+5}}</th>
                                                                                        <th class="dalam2">{{$total_mhs-2+5}}</th>
                                                                                        <th class="dalam2">2</th>
                                                                                        <th class="dalam2" colspan="2">{{$total_mhs}}</th>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                <div id="asing" class="tab-pane fade">
                                                                        <div class="table-responsive-md">
                                                                            <table id="tabel_asing" class="table table-bordered">
                                                                                <thead class="head1">
                                                                                    <tr>
                                                                                        <th rowspan="2" class="tabel1" style="vertical-align: middle">No</th>
                                                                                        <th colspan="3" class="tabel1" style="vertical-align: middle">Jumlah Mahasiswa Aktif</th>
                                                                                        <th colspan="3" class="tabel1" style="vertical-align: middle">Jumlah Mahasiswa Asing Penuh Waktu (Full-time)</th>
                                                                                        <th colspan="3" class="tabel1" style="vertical-align: middle">Jumlah Mahasiswa Asing Paruh Waktu (Part-time)</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">TS-2</th>
                                                                                        <th class="dalam">TS-1</th>
                                                                                        <th class="dalam">TS</th>
                                                                                        <th class="dalam">TS-2</th>
                                                                                        <th class="dalam">TS-1</th>
                                                                                        <th class="dalam">TS</th>
                                                                                        <th class="dalam">TS-2</th>
                                                                                        <th class="dalam">TS-1</th>
                                                                                        <th class="dalam">TS</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        @for ($i = 1; $i <= 10; $i++)
                                                                                            <th class="dalam">{{$i}}</th>
                                                                                        @endfor
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody style="background-color: #343A40;">
                                                                                    <tr>
                                                                                        <th class="dalam">1</th>
                                                                                        <td>{{$jml_mhs_as_ft['2020']+$jml_mhs_as_pt['2020']}}</td>
                                                                                        <td>{{$jml_mhs_as_ft['2021']+$jml_mhs_as_pt['2021']}}</td>
                                                                                        <td>{{$jml_mhs_as_ft['2022']+$jml_mhs_as_pt['2022']}}</td>
                                                                                        <td>{{$jml_mhs_as_ft['2020']}}</td>
                                                                                        <td>{{$jml_mhs_as_ft['2021']}}</td>
                                                                                        <td>{{$jml_mhs_as_ft['2022']}}</td>
                                                                                        <td>{{$jml_mhs_as_pt['2020']}}</td>
                                                                                        <td>{{$jml_mhs_as_pt['2021']}}</td>
                                                                                        <td>{{$jml_mhs_as_pt['2022']}}</td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div id="kriteria3" class="tab-pane fade">     
                                                <div class="card-body">
                                                    <h6 style="text-align:right;">Data Tersebut Dibuat Berdasarkan BAN-PT</h6>
                                                    <div class="container">
                                                        <div class="row">
                                                            <div class="flex-container">
                                                                <div class="sidebar3" id="sidebar3">
                                                                        <h4 class="card-title" style="margin-left:30px;color:#000000;font-weight:bold;margin-top:20px;padding-bottom: 10px;">Dosen dan Penelitian</h4>
                                                                            <ul class="nav nav-tabs" id="mytab" role="tablist" style="list-style-type:none;float:left;">
                                                                                <li style="padding-bottom:10px;">
                                                                                    <a data-toggle="tab" role="presentation" class="nav-link" href="#tetap" style="color:#000000;">Dosen Tetap Perguruan Tinggi</a>
                                                                                </li>
                                                                                <li style="padding-bottom:10px;">
                                                                                    <a data-toggle="tab" role="presentation" class="nav-link" href="#tugas_akhir"  style="color:#000000;">Dosen Pembimbing Utama Tugas Akhir</a>
                                                                                </li>
                                                                                <li style="padding-bottom:10px;">
                                                                                    <a data-toggle="tab" role="presentation" class="nav-link" href="#ekuivalen"  style="color:#000000;">Ekuivalen Waktu Mengajar Penuh (EWMP) Dosen Tetap Perguruan Tinggi</a>
                                                                                </li>
                                                                                <li style="padding-bottom:10px;">
                                                                                    <a data-toggle="tab" role="presentation" class="nav-link" href="#dosen_tidak_tetap"  style="color:#000000;">Dosen Tidak Tetap</a>
                                                                                </li>
                                                                                <li style="padding-bottom:10px;">
                                                                                    <a data-toggle="tab" role="presentation" class="nav-link" href="#dosen_praktisi"  style="color:#000000;">Dosen Industri/Praktisi</a>
                                                                                </li>
                                                                                <li style="padding-bottom:10px;">
                                                                                    <a data-toggle="tab" role="presentation" class="nav-link" href="#pengakuan_DTPS"  style="color:#000000;">Pengakuan/Rekognisi DTPS</a>
                                                                                </li>
                                                                                <li style="padding-bottom:10px;">
                                                                                    <a data-toggle="tab" role="presentation" class="nav-link" href="#penelitian_DTPS"  style="color:#000000;">Penelitian DTPS</a>
                                                                                </li>
                                                                                <li style="padding-bottom:10px;padding-right:30px;">
                                                                                    <a data-toggle="tab" role="presentation" class="nav-link" href="#Pkm_DTPS"  style="color:#000000;">Pkm DTPS</a>
                                                                                </li>
                                                                                <li style="padding-bottom:10px;">
                                                                                    <a data-toggle="tab" role="presentation" class="nav-link" href="#publikasi_DTPS"  style="color:#000000;">Publikasi Ilmiah DTPS</a>
                                                                                </li>
                                                                                <li style="padding-bottom:10px;">
                                                                                    <a data-toggle="tab" role="presentation" class="nav-link" href="#presentasi_DTPS"  style="color:#000000;">Presentasi DTPS</a>
                                                                                </li>
                                                                                <li style="padding-bottom:10px;">
                                                                                    <a data-toggle="tab" role="presentation" class="nav-link" href="#karya_ilmiah_sitasi"  style="color:#000000;">Karya Ilmiah DTPS yang Disitasi</a>
                                                                                </li>
                                                                                <li style="padding-bottom:10px;">
                                                                                    <a data-toggle="tab" role="presentation" class="nav-link" href="#produk_adopsi_masyarakat"  style="color:#000000;">Produk yang Diadpsi oleh Masyarakat</a>
                                                                                </li>
                                                                                <li style="padding-bottom:10px;">
                                                                                    <a data-toggle="tab" role="presentation" class="nav-link" href="#luaran_pkm_DTPS"  style="color:#000000;">Luaran Penelitian/Pkm Lainnya oleh DTPS</a>
                                                                                </li>
                                                                                <li style="padding-bottom:10px;">
                                                                                    <a data-toggle="tab" role="presentation" class="nav-link" href="#luaran_HKI"  style="color:#000000;">Luaran Penelitian/PkM Lainnya - HKI (Hak Cipta, Desain Produk Industri, dll.)</a>
                                                                                </li>
                                                                                <li style="padding-bottom:10px;">
                                                                                    <a data-toggle="tab" role="presentation" class="nav-link" href="#luaran_teknologi"  style="color:#000000;">Luaran Penelitian/PkM Lainnya - Teknologi Tepat Guna, Produk, Karya Seni, Rekayasa Sosial</a>
                                                                                </li>
                                                                                <li style="padding-bottom:10px;">
                                                                                    <a data-toggle="tab" role="presentation" class="nav-link" href="#luaran_book"  style="color:#000000;"> Luaran Penelitian/PkM Lainnya - Buku ber-ISBN, Book Chapter</a>
                                                                                </li>
                                                                            </ul>
                                                                            <button class="btn btn-danger" id="btn6" onclick="button_close3()">X</button>
                                                                        
                                                                        </div>
                                                                    <div id="main3">
                                                                        <button class="btn btn-success" id="btn5" onclick="button_open3()">☰</button>
                                                                    </div>
                                                            <div class="tab-content">
                                                                <div id="tetap" class="tab-pane fade">
                                                                        <div class="table-responsive-md" id="k3tetap">
                                                                            <table class="table table-bordered">
                                                                                <thead class="head1">
                                                                                    <tr>
                                                                                        <th style="vertical-align: middle" class="dalam2">No</th>
                                                                                        <th style="vertical-align: middle" class="dalam2">Nama Dosen</th>
                                                                                        <th style="vertical-align: middle" class="dalam2">NIDN/NIDK</th>
                                                                                        <th style="vertical-align: middle" class="dalam2">Pendidikan Pasca Sarjana</th>
                                                                                        <th style="vertical-align: middle" class="dalam2">Bidang Keahlian</th>
                                                                                        <th style="vertical-align: middle" class="dalam2">Kesesuaian dengan Kompetensi Inti PS</th>
                                                                                        <th style="vertical-align: middle" class="dalam2">Jabatan Akademik</th>
                                                                                        <th style="vertical-align: middle" class="dalam2">Sertifikat Pendidik Profesional</th>
                                                                                        <th style="vertical-align: middle" class="dalam2">Setifikat Kompetensi/Profesi/Industri</th>
                                                                                        <th style="vertical-align: middle" class="dalam2">Mata Kuliah yang Diampu pada PS yang Diakreditasi</th>
                                                                                        <th style="vertical-align: middle" class="dalam2">Kesesuaian Bidang Keahlian dengan Mata Kuliah yang Diampu</th>
                                                                                        <th style="vertical-align: middle" class="dalam2">Mata Kuliah yang Diampu pada PS Lain</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        @for ($i = 1; $i <= 12; $i++)
                                                                                            <th class="dalam">{{$i}}</th>
                                                                                        @endfor
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody style="background-color: #343A40;">
                                                                                    @php
                                                                                        $temp_mk = [];
                                                                                        $idx = 1;
                                                                                    @endphp
                                                                                    @foreach ($dosen_tetap as $no => $dt)
                                                                                        @if ($no > 0 && $dt->nama == $dosen_tetap[$no - 1]->nama)
                                                                                            @continue
                                                                                        @endif
                                                                                        @php
                                                                                            $temp_mk = [];
                                                                                        @endphp
                                                                                        @foreach ($dosen_tetap as $no_item => $item)
                                                                                            @if ($no_item < $no)
                                                                                                @continue
                                                                                            @endif
                                                                                            @if ($item->nama == $dt->nama)
                                                                                                @php
                                                                                                    $temp_mk[] = $item->nm_mk;
                                                                                                @endphp
                                                                                            @else
                                                                                                @break
                                                                                            @endif
                                                                                        @endforeach
                                                                                        <tr>
                                                                                            <th class="dalanm">{{$idx}}</th>
                                                                                            <td>{{$dt->nama}}</td>
                                                                                            <td>{{$dt->nidn}}</td>
                                                                                            <td>{{['S2', 'S3'][array_rand(['S2', 'S3'])]}}</td>
                                                                                            <td>{{$detail_prodi->prodi}}</td>
                                                                                            <td>{{rand(1,5)}}</td>
                                                                                            <td>{{$dt->nm_jabfung}}</td>
                                                                                            <td>Dosen</td>
                                                                                            <td>Profesi</td>
                                                                                            <td><?php echo implode('<br>', $temp_mk); ?></td>
                                                                                            <td>{{rand(1,5)}}</td>
                                                                                            <td>{{rand(1,5)}}</td>
                                                                                        </tr>
                                                                                        @php
                                                                                            $idx++;
                                                                                        @endphp
                                                                                    @endforeach
                                                                                </tbody>
                                                                            </table> 
                                                                        </div>
                                                                    </div>
                                                                <div id="tugas_akhir" class="tab-pane fade">
                                                                        <div class="table-responsive-md" id="k3tugas_akhir">
                                                                            <table class="table table-bordered">
                                                                                <thead class="head1">
                                                                                    <tr>
                                                                                        <th rowspan="3" class="dalam2" style="vertical-align: middle">No</th>
                                                                                        <th rowspan="3" class="dalam2" style="vertical-align: middle">Nama Dosen</th>
                                                                                        <th colspan="8" class="dalam2" style="vertical-align: middle">Jumlah Mahasiswa yang Dibimbing</th>
                                                                                        <th rowspan="3" class="dalam2" style="width: 250px;vertical-align: middle">Rata-rata Jumlah Bimbingan di semua Program/ Semester</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th colspan="4" class="dalam">pada PS yang Diakreditasi</th>
                                                                                        <th colspan="4" class="dalam">pada PS Lain di PT</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">TS-2</th>
                                                                                        <th class="dalam">TS-1</th>
                                                                                        <th class="dalam">TS</th>
                                                                                        <th class="dalam">Rata-rata</th>
                                                                                        <th class="dalam">TS-2</th>
                                                                                        <th class="dalam">TS-1</th>
                                                                                        <th class="dalam">TS</th>
                                                                                        <th class="dalam">Rata-rata</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        @for ($i = 1; $i <= 11; $i++)
                                                                                            <th class="dalam">{{$i}}</th>
                                                                                        @endfor
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody style="background-color: #343A40;">
                                                                                    @php
                                                                                        $nilai = 1;
                                                                                        $jml_SP_sesuai = 0;
                                                                                        $jml_SP_non_SP = 0;
                                                                                    @endphp
                                                                                    <tbody style="background-color: #343A40;">
                                                                                        @foreach ($bimbingan as $idx => $bim)
                                                                                        @if (count($bimbingan) == $idx+1)
                                                                                            @break
                                                                                        @endif
                                                                                        @if ($idx%2!=0)
                                                                                            @continue
                                                                                        @endif
                                                                                        <tr>
                                                                                            <th class="dalam">{{$nilai}}</th>
                                                                                            <td>{{$bim->nama_dosen}}</td>
                                                                                            <td>{{$bim->sesuai_SP}}</td>
                                                                                            <td>0</td>
                                                                                            @if ($bimbingan[$idx+1]->nama_dosen == $bim->nama_dosen)
                                                                                                <td>{{$bimbingan[$idx+1]->sesuai_SP}}</td>
                                                                                                @php
                                                                                                    $jml_SP_sesuai += $bimbingan[$idx+1]->sesuai_SP;
                                                                                                @endphp
                                                                                            @else
                                                                                                <td>0</td>
                                                                                            @endif
                                                                                            <td>{{($bim->sesuai_SP + $jml_SP_sesuai)/2}}</td>
                                                                                            <td>{{$bim->non_SP}}</td>
                                                                                            <td>0</td>
                                                                                            @if ($bimbingan[$idx+1]->nama_dosen == $bim->nama_dosen)
                                                                                                <td>{{$bimbingan[$idx+1]->non_SP}}</td>
                                                                                                @php
                                                                                                    $jml_SP_non_SP += $bimbingan[$idx+1]->non_SP;
                                                                                                @endphp
                                                                                            @else
                                                                                                <td>0</td>
                                                                                            @endif
                                                                                            <td>{{($bim->non_SP + $jml_SP_non_SP)/2}}</td>
                                                                                            <td>{{($bim->sesuai_SP + $jml_SP_sesuai + $bim->non_SP + $jml_SP_non_SP)/4}}</td>
                                                                                        </tr>
                                                                                        @php
                                                                                            $nilai++;
                                                                                        @endphp
                                                                                        @endforeach
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                <div id="ekuivalen" class="tab-pane fade">
                                                                        <div class="table-responsive-md">
                                                                            <table class="table table-bordered">
                                                                                <thead class="head1">
                                                                                    <tr>
                                                                                        <th rowspan="2" class="dalam2">No</th>
                                                                                        <th rowspan="2" class="dalam2" style="width: 15%;">Nama Dosen (DT)</th>
                                                                                        <th rowspan="2" class="dalam2">DTPS</th>
                                                                                        <th colspan="4" class="dalam2">Ekuivalen Waktu Mengajar Penuh (EWMP) pada saat TS dalam satuan kredit semester (sks)</th>
                                                                                        <th rowspan="2" class="dalam2">Jumlah (SKS)</th>
                                                                                        <th rowspan="2" class="dalam2">Rata-rata per Semester (SKS)</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">Pendidikan: Pembelajaran dan Pembimbingan</th>
                                                                                        <th class="dalam">Penelitian</th>
                                                                                        <th class="dalam">PKM</th>
                                                                                        <th class="dalam">Tugas Tambahan dan/atau Penunjang</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        @for ($i = 1; $i <= 9; $i++)
                                                                                            <th class="dalam">{{$i}}</th>
                                                                                        @endfor
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody style="background-color: #343A40;">
                                                                                    <tr>
                                                                                        <th class="dalam">1</th>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">2</th>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">3</th>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">4</th>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">5</th>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                <div id="dosen_tidak_tetap" class="tab-pane fade">
                                                                        <div class="table-responsive-md" id="k3tidak_tetap">
                                                                            <table class="table table-bordered">
                                                                                <thead class="head1">
                                                                                    <tr>
                                                                                        <th class="dalam2">No</th>
                                                                                        <th class="dalam2">Nama Dosen</th>
                                                                                        <th class="dalam2">NIDN/NIDK</th>
                                                                                        <th class="dalam2">Pendidikan Pasca Sarjana</th>
                                                                                        <th class="dalam2">Bidang Keahlian</th>
                                                                                        <th class="dalam2">Jabatan Akademik</th>
                                                                                        <th class="dalam2">Sertifikat Pendidik Profesional</th>
                                                                                        <th class="dalam2">Sertifikat Kompetensi/Profesi/Industri</th>
                                                                                        <th class="dalam2">Mata Kuliah yang Diampu pada PS yang Diakreditasi</th>
                                                                                        <th class="dalam2">Kesesuaian Bidang Keahlian dengan Mata Kuliah yang Diampu</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        @for ($i = 1; $i <= 10; $i++)
                                                                                            <th class="dalam">{{$i}}</th>
                                                                                        @endfor
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody style="background-color: #343A40;">
                                                                                    @foreach ($dosen_taktetap as $no => $dtt)
                                                                                        <tr>
                                                                                            <th class="dalanm">{{$no+1}}</th>
                                                                                            <td>{{$dtt->nama}}</td>
                                                                                            <td>{{$dtt->nidn}}</td>
                                                                                            <td>{{['S2', 'S3'][array_rand(['S2', 'S3'])]}}</td>
                                                                                            <td>{{$detail_prodi->prodi}}</td>
                                                                                            <td>Honor</td>
                                                                                            <td>Dosen</td>
                                                                                            <td>Profesi</td>
                                                                                            <td>{{['Reguler', 'Umum', 'Khusus'][array_rand(['Reguler', 'Umum', 'Khusus'])]}}</td>
                                                                                            <td>{{rand(1,5)}}</td>
                                                                                        </tr>
                                                                                    @endforeach 
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                <div id="dosen_praktisi" class="tab-pane fade">
                                                                        <div class="table-responsive-md" id="k3dosen_praktisi">
                                                                            <table class="table table-bordered">
                                                                                <thead class="head1">
                                                                                    <tr>
                                                                                        <th class="dalam2">No</th>
                                                                                        <th class="dalam2">Nama Dosen Industri/Praktisi</th>
                                                                                        <th class="dalam2">NIDN/NIDK</th>
                                                                                        <th class="dalam2">Perusahaan/Industri</th>
                                                                                        <th class="dalam2">Pendidikan Tertinggi</th>
                                                                                        <th class="dalam2">Bidang Keahlian</th>
                                                                                        <th class="dalam2">Sertifikat Kompetensi/Profesi/Industri</th>
                                                                                        <th class="dalam2">Mata Kuliah yang Diampu</th>
                                                                                        <th class="dalam2" style="width: 10%;">Bobot Kredit (SKS)</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        @for ($i = 1; $i <= 9; $i++)
                                                                                            <th class="dalam">{{$i}}</th>
                                                                                        @endfor
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody style="background-color: #343A40;">
                                                                                    <tr>
                                                                                        <th class="dalam">1</th>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        
                                                                                        
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">2</th>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        
                                                                                        
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">3</th>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        
                                                                                        
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">4</th>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        
                                                                                        
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">5</th>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        
                                                                                        
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                <div id="pengakuan_DTPS" class="tab-pane fade">
                                                                        <div class="table-responsive-md" id="k3pengakuan_dtps">
                                                                            <table class="table table-bordered">
                                                                                <thead class="head1">
                                                                                    <tr>
                                                                                        <th style="vertical-align: middle" class="dalam2">No</th>
                                                                                        <th style="vertical-align: middle" class="dalam2">Nama Dosen</th>
                                                                                        <th style="vertical-align: middle" class="dalam2">Bidang Keahlian</th>
                                                                                        <th style="vertical-align: middle" class="dalam2">Rekognisi dan Bukti Pendukung</th>
                                                                                        <th style="vertical-align: middle" class="dalam2">Tingkat</th>
                                                                                        <th style="vertical-align: middle" class="dalam2">Tahun (YYYY)</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        @for ($i = 1; $i <= 6; $i++)
                                                                                            <th class="dalam">{{$i}}</th>
                                                                                        @endfor
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody style="background-color: #343A40;">
                                                                                    @php
                                                                                        $no = 1;
                                                                                    @endphp
                                                                                    @foreach ($rekognisi as $rek)
                                                                                        <tr>
                                                                                            <th class="dalam">{{$no++}}</th>
                                                                                            <td>{{$rek->nm_sdm}}</td>
                                                                                            <td>{{$detail_prodi->prodi}}</td>
                                                                                            <td>{{$rek->sk_sert}}</td>
                                                                                            <td>{{rand(1,5)}}</td>
                                                                                            <td>{{$rek->thn_sert}}</td>
                                                                                        </tr>
                                                                                    @endforeach
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                <div id="penelitian_DTPS" class="tab-pane fade">
                                                                        <div class="table-responsive-md">
                                                                            <table class="table table-bordered" style="width: 40rem;margin-left:10px;">
                                                                                <thead class="head1">
                                                                                    <tr>
                                                                                        <th rowspan="2" class="dalam2">No</th>
                                                                                        <th rowspan="2" class="dalam2">Sumber Pembiayaan</th>
                                                                                        <th colspan="3" class="dalam2">Jumlah Judul Penelitian</th>
                                                                                        <th rowspan="2" class="dalam2">Jumlah</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">TS-2</th>
                                                                                        <th class="dalam">TS-1</th>
                                                                                        <th class="dalam">TS</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        @for ($i = 1; $i <= 6; $i++)
                                                                                            <th class="dalam">{{$i}}</th>
                                                                                        @endfor
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody style="background-color: #343A40;">
                                                                                    @php
                                                                                        $tot_mandiri = 0;
                                                                                        $tot_lemb_in = 0;
                                                                                        $tot_lemb_out = 0;
    
                                                                                        function total ($a, $b, $c){
                                                                                            global $tot_mandiri, $tot_lemb_in, $tot_lemb_out;
                                                                                            $tot_mandiri += $a;
                                                                                            $tot_lemb_in += $b;
                                                                                            $tot_lemb_out += $c;
                                                                                        }
                                                                                    @endphp
                                                                                    @foreach ($penelitian_dtps as $pdt)
                                                                                        @if ($pdt->id_thn_kegiatan == '2019')
                                                                                            <tr>
                                                                                                <th class="dalam">1</th>
                                                                                                <td>
                                                                                                    <p>a) Perguruan Tinggi <br> b) Mandiri</p>
                                                                                                </td>
                                                                                                <td>{{$pdt->mandiri}}</td>
                                                                                                <td>{{$pdt->lembaga_dalam}}</td>
                                                                                                <td>{{$pdt->lembaga_luar_mungkin}}</td>
                                                                                                <td>{{$pdt->mandiri + $pdt->lembaga_dalam + $pdt->lembaga_luar_mungkin}}</td>
                                                                                                @php
                                                                                                    total($pdt->mandiri, $pdt->lembaga_dalam, $pdt->lembaga_luar_mungkin);
                                                                                                @endphp
                                                                                            </tr>
                                                                                        @endif
                                                                                        @if ($pdt->id_thn_kegiatan == '2020')
                                                                                            <tr>
                                                                                                <th class="dalam">2</th>
                                                                                                <td>Lembaga dalam negeri (diluar PT)</td>
                                                                                                <td>{{$pdt->mandiri}}</td>
                                                                                                <td>{{$pdt->lembaga_dalam}}</td>
                                                                                                <td>{{$pdt->lembaga_luar_mungkin}}</td>
                                                                                                <td>{{$pdt->mandiri + $pdt->lembaga_dalam + $pdt->lembaga_luar_mungkin}}</td>
                                                                                                @php
                                                                                                    total($pdt->mandiri, $pdt->lembaga_dalam, $pdt->lembaga_luar_mungkin);
                                                                                                @endphp
                                                                                            </tr>
                                                                                        @endif
                                                                                        @if ($pdt->id_thn_kegiatan == '2021')
                                                                                            <tr>
                                                                                                <th class="dalam">3</th>
                                                                                                <td>Lembaga luar negeri</td>
                                                                                                <td>{{$pdt->mandiri}}</td>
                                                                                                <td>{{$pdt->lembaga_dalam}}</td>
                                                                                                <td>{{$pdt->lembaga_luar_mungkin}}</td>
                                                                                                <td>{{$pdt->mandiri + $pdt->lembaga_dalam + $pdt->lembaga_luar_mungkin}}</td>
                                                                                                @php
                                                                                                    total($pdt->mandiri, $pdt->lembaga_dalam, $pdt->lembaga_luar_mungkin);
                                                                                                @endphp
                                                                                            </tr>
                                                                                        @endif
                                                                                    @endforeach
                                                                                    <tr>
                                                                                        <th colspan="2" class="dalam2">Jumlah</th>
                                                                                        <th class="dalam2">{{$tot_mandiri}}</th>
                                                                                        <th class="dalam2">{{$tot_lemb_in}}</th>
                                                                                        <th class="dalam2">{{$tot_lemb_out}}</th>
                                                                                        <th class="dalam2">{{$tot_mandiri + $tot_lemb_in + $tot_lemb_out}}</th>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                <div id="Pkm_DTPS" class="tab-pane fade">
                                                                        <div class="table-responsive-md">
                                                                            <table class="table table-bordered">
                                                                                <thead class="head1">
                                                                                    <tr>
                                                                                        <th rowspan="2" class="dalam2">No</th>
                                                                                        <th rowspan="2" class="dalam2">Sumber Pembiayaan</th>
                                                                                        <th colspan="3" class="dalam2">Jumlah Judul PKM</th>
                                                                                        <th rowspan="2" class="dalam2">Jumlah</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">TS-2</th>
                                                                                        <th class="dalam">TS-1</th>
                                                                                        <th class="dalam">TS</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        @for ($i = 1; $i <= 6; $i++)
                                                                                            <th class="dalam">{{$i}}</th>
                                                                                        @endfor
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody style="background-color: #343A40;">
                                                                                    @php
                                                                                        $tot_mandiri = 0;
                                                                                        $tot_lemb_in = 0;
                                                                                        $tot_lemb_out = 0;
                                                                                    @endphp
                                                                                    @foreach ($pkm_dtps as $pkmdt)
                                                                                        @if ($pkmdt->id_thn_kegiatan == '2019')
                                                                                            <tr>
                                                                                                <th class="dalam">1</th>
                                                                                                <td>
                                                                                                    <p>a) Perguruan Tinggi <br> b) Mandiri</p>
                                                                                                </td>
                                                                                                <td>{{$pkmdt->mandiri}}</td>
                                                                                                <td>{{$pkmdt->lembaga_dalam}}</td>
                                                                                                <td>{{$pkmdt->lembaga_luar_mungkin}}</td>
                                                                                                <td>{{$pkmdt->mandiri + $pkmdt->lembaga_dalam + $pkmdt->lembaga_luar_mungkin}}</td>
                                                                                                @php
                                                                                                    total($pkmdt->mandiri, $pkmdt->lembaga_dalam, $pkmdt->lembaga_luar_mungkin);
                                                                                                @endphp
                                                                                            </tr>
                                                                                        @endif
                                                                                        @if ($pkmdt->id_thn_kegiatan == '2020')
                                                                                            <tr>
                                                                                                <th class="dalam">2</th>
                                                                                                <td>Lembaga dalam negeri (diluar PT)</td>
                                                                                                <td>{{$pkmdt->mandiri}}</td>
                                                                                                <td>{{$pkmdt->lembaga_dalam}}</td>
                                                                                                <td>{{$pkmdt->lembaga_luar_mungkin}}</td>
                                                                                                <td>{{$pkmdt->mandiri + $pkmdt->lembaga_dalam + $pkmdt->lembaga_luar_mungkin}}</td>
                                                                                                @php
                                                                                                    total($pkmdt->mandiri, $pkmdt->lembaga_dalam, $pkmdt->lembaga_luar_mungkin);
                                                                                                @endphp
                                                                                            </tr>
                                                                                        @endif
                                                                                        @if ($pkmdt->id_thn_kegiatan == '2021')
                                                                                            <tr>
                                                                                                <th class="dalam">3</th>
                                                                                                <td>Lembaga luar negeri</td>
                                                                                                <td>{{$pkmdt->mandiri}}</td>
                                                                                                <td>{{$pkmdt->lembaga_dalam}}</td>
                                                                                                <td>{{$pkmdt->lembaga_luar_mungkin}}</td>
                                                                                                <td>{{$pkmdt->mandiri + $pkmdt->lembaga_dalam + $pkmdt->lembaga_luar_mungkin}}</td>
                                                                                                @php
                                                                                                    total($pkmdt->mandiri, $pkmdt->lembaga_dalam, $pkmdt->lembaga_luar_mungkin);
                                                                                                @endphp
                                                                                            </tr>
                                                                                        @endif
                                                                                    @endforeach
                                                                                    <tr>
                                                                                        <th colspan="2" class="dalam2">Jumlah</th>
                                                                                        <th class="dalam2">{{$tot_mandiri}}</th>
                                                                                        <th class="dalam2">{{$tot_lemb_in}}</th>
                                                                                        <th class="dalam2">{{$tot_lemb_out}}</th>
                                                                                        <th class="dalam2">{{$tot_mandiri + $tot_lemb_in + $tot_lemb_out}}</th>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                <div id="publikasi_DTPS" class="tab-pane fade">
                                                                        <div class="table-responsive-md" id="k3publikasi_dtps">
                                                                            <table class="table table-bordered">
                                                                                <thead class="head1">
                                                                                    <tr>
                                                                                        <th rowspan="2" class="dalam2">No</th>
                                                                                        <th rowspan="2" class="dalam2">Jenis Publikasi</th>
                                                                                        <th colspan="3" class="dalam2">Jumlah Judul</th>
                                                                                        <th rowspan="2" class="dalam2">Jumlah</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">TS-2</th>
                                                                                        <th class="dalam">TS-1</th>
                                                                                        <th class="dalam">TS</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        @for ($i = 1; $i <= 6; $i++)
                                                                                            <th class="dalam">{{$i}}</th>
                                                                                        @endfor
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody style="background-color: #343A40;">
                                                                                    @php
                                                                                        $jum_pudt = 0;
                                                                                        $imbex = 0;
                                                                                        $idx = 1;
                                                                                    @endphp
                                                                                    @foreach ($pub_dtps as  $pudt)
                                                                                        @if ($imbex == 0) 
                                                                                            <tr>
                                                                                            @php
                                                                                                $imbex++;
                                                                                            @endphp
                                                                                        @endif
                                                                                        @if ($idx==5 || $idx==8)
                                                                                            @if ($idx==5)
                                                                                            <th class="dalam">5</th>
                                                                                            <td>Seminar wilayah/lokal/perguruan tinggi</td>
                                                                                            @else 
                                                                                            <th class="dalam">8</th>
                                                                                            <td>Tulisan di media massa wilayah</td>
                                                                                            @endif
                                                                                            <td>0</td>
                                                                                            <td>0</td>
                                                                                            <td>0</td>
                                                                                            <td class="dalam4">0</td>
                                                                                            @php
                                                                                                $idx++;
                                                                                            @endphp
                                                                                            </tr>
                                                                                        @endif
                                                                                        @if ($pudt->id_jns_pub == '21' && $pudt->tahun == '2020' && $idx!=5 && $idx!=8)
                                                                                            <th class="dalam">1</th>
                                                                                            <td>Jurnal penelitian tidak terakreditasi</td>
                                                                                        @endif
                                                                                        @if ($pudt->id_jns_pub == '22' && $pudt->tahun == '2020' && $idx!=5 && $idx!=8)
                                                                                            <th class="dalam">2</th>
                                                                                            <td>Lembaga dalam negeri (diluar PT)</td>
                                                                                        @endif
                                                                                        @if ($pudt->id_jns_pub == '23' && $pudt->tahun == '2020' && $idx!=5 && $idx!=8)
                                                                                            <th class="dalam">3</th>
                                                                                            <td>Lembaga luar negeri</td>
                                                                                        @endif
                                                                                        @if ($pudt->id_jns_pub == '24' && $pudt->tahun == '2020' && $idx!=5 && $idx!=8)
                                                                                            <th class="dalam">4</th>
                                                                                            <td>Jurnal penelitian internasional bereputasi</td>
                                                                                        @endif
                                                                                        @if ($pudt->id_jns_pub == '31' && $pudt->tahun == '2020' && $idx!=5 && $idx!=8)
                                                                                            <th class="dalam">6</th>
                                                                                            <td>Seminar nasional</td>
                                                                                        @endif
                                                                                        @if ($pudt->id_jns_pub == '32' && $pudt->tahun == '2020' && $idx!=5 && $idx!=8)
                                                                                            <th class="dalam">7</th>
                                                                                            <td>Seminar internasional</td>
                                                                                        @endif
                                                                                        @if ($idx!=5 && $idx!=8)
                                                                                            <td>{{$pudt->jumlah}}</td>
                                                                                            @php
                                                                                                $jum_pudt += $pudt->jumlah;
                                                                                            @endphp
                                                                                        @endif
                                                                                        @if ($pudt->tahun == '2022' && $idx!=5 && $idx!=8) 
                                                                                            <td class="dalam4">{{$jum_pudt}}</td> 
                                                                                            @php
                                                                                                $imbex=0;
                                                                                                $idx++;
                                                                                            @endphp
                                                                                            </tr>
                                                                                        @endif
                                                                                    @endforeach
                                                                                        <tr>
                                                                                            <th class="dalam">9</th>
                                                                                            <td>Tulisan di media massa nasional</td>
                                                                                            <td>4</td>
                                                                                            <td>0</td>
                                                                                            <td>2</td>
                                                                                            <td class="dalam4">6</td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <th class="dalam">10</th>
                                                                                            <td>Tulisan di media massa internasional</td>
                                                                                            <td>0</td>
                                                                                            <td>1</td>
                                                                                            <td>1</td>
                                                                                            <td class="dalam4">2</td>
                                                                                        </tr>
                                                                                    <tr>
                                                                                        <th colspan="2" class="dalam2">Jumlah</th>
                                                                                        <th class="dalam2">1817</th>
                                                                                        <th class="dalam2">2495</th>
                                                                                        <th class="dalam2">2324</th>
                                                                                        <th class="dalam2">6636</th>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                <div id="presentasi_DTPS" class="tab-pane fade">
                                                                        <div class="table-responsive-md" id="k3presentasi_dtps">
                                                                            <table class="table table-bordered">
                                                                                <thead class="head1">
                                                                                    <tr>
                                                                                        <th rowspan="2" class="dalam2">No</th>
                                                                                        <th rowspan="2" class="dalam2">Jenis Publikasi</th>
                                                                                        <th colspan="3" class="dalam2">Jumlah Judul</th>
                                                                                        <th rowspan="2" class="dalam2">Jumlah</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">TS-2</th>
                                                                                        <th class="dalam">TS-1</th>
                                                                                        <th class="dalam">TS</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        @for ($i = 1; $i <= 6; $i++)
                                                                                            <th class="dalam">{{$i}}</th>
                                                                                        @endfor
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody style="background-color: #343A40;">
                                                                                    @php
                                                                                        $jum_pudt = 0;
                                                                                        $imbex = 0;
                                                                                        $idx = 1;
                                                                                    @endphp
                                                                                    @foreach ($pub_dtps as  $pudt)
                                                                                        @if ($imbex == 0) 
                                                                                            <tr>
                                                                                            @php
                                                                                                $imbex++;
                                                                                            @endphp
                                                                                        @endif
                                                                                        @if ($idx==5 || $idx==8)
                                                                                            @if ($idx==5)
                                                                                            <th class="dalam">5</th>
                                                                                            <td>Seminar wilayah/lokal/perguruan tinggi</td>
                                                                                            @else 
                                                                                            <th class="dalam">8</th>
                                                                                            <td>Tulisan di media massa wilayah</td>
                                                                                            @endif
                                                                                            <td>0</td>
                                                                                            <td>0</td>
                                                                                            <td>0</td>
                                                                                            <td class="dalam4">0</td>
                                                                                            @php
                                                                                                $idx++;
                                                                                            @endphp
                                                                                            </tr>
                                                                                        @endif
                                                                                        @if ($pudt->id_jns_pub == '21' && $pudt->tahun == '2020' && $idx!=5 && $idx!=8)
                                                                                            <th class="dalam">1</th>
                                                                                            <td>Jurnal penelitian tidak terakreditasi</td>
                                                                                        @endif
                                                                                        @if ($pudt->id_jns_pub == '22' && $pudt->tahun == '2020' && $idx!=5 && $idx!=8)
                                                                                            <th class="dalam">2</th>
                                                                                            <td>Lembaga dalam negeri (diluar PT)</td>
                                                                                        @endif
                                                                                        @if ($pudt->id_jns_pub == '23' && $pudt->tahun == '2020' && $idx!=5 && $idx!=8)
                                                                                            <th class="dalam">3</th>
                                                                                            <td>Lembaga luar negeri</td>
                                                                                        @endif
                                                                                        @if ($pudt->id_jns_pub == '24' && $pudt->tahun == '2020' && $idx!=5 && $idx!=8)
                                                                                            <th class="dalam">4</th>
                                                                                            <td>Jurnal penelitian internasional bereputasi</td>
                                                                                        @endif
                                                                                        @if ($pudt->id_jns_pub == '31' && $pudt->tahun == '2020' && $idx!=5 && $idx!=8)
                                                                                            <th class="dalam">6</th>
                                                                                            <td>Seminar nasional</td>
                                                                                        @endif
                                                                                        @if ($pudt->id_jns_pub == '32' && $pudt->tahun == '2020' && $idx!=5 && $idx!=8)
                                                                                            <th class="dalam">7</th>
                                                                                            <td>Seminar internasional</td>
                                                                                        @endif
                                                                                        @if ($idx!=5 && $idx!=8)
                                                                                            <td>{{$pudt->jumlah}}</td>
                                                                                            @php
                                                                                                $jum_pudt += $pudt->jumlah;
                                                                                            @endphp
                                                                                        @endif
                                                                                        @if ($pudt->tahun == '2022' && $idx!=5 && $idx!=8) 
                                                                                            <td class="dalam4">{{$jum_pudt}}</td> 
                                                                                            @php
                                                                                                $imbex=0;
                                                                                                $idx++;
                                                                                            @endphp
                                                                                            </tr>
                                                                                        @endif
                                                                                    @endforeach
                                                                                        <tr>
                                                                                            <th class="dalam">9</th>
                                                                                            <td>Tulisan di media massa nasional</td>
                                                                                            <td>4</td>
                                                                                            <td>0</td>
                                                                                            <td>2</td>
                                                                                            <td class="dalam4">6</td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <th class="dalam">10</th>
                                                                                            <td>Tulisan di media massa internasional</td>
                                                                                            <td>0</td>
                                                                                            <td>1</td>
                                                                                            <td>1</td>
                                                                                            <td class="dalam4">2</td>
                                                                                        </tr>
                                                                                    <tr>
                                                                                        <th colspan="2" class="dalam2">Jumlah</th>
                                                                                        <th class="dalam2">1817</th>
                                                                                        <th class="dalam2">2495</th>
                                                                                        <th class="dalam2">2324</th>
                                                                                        <th class="dalam2">6636</th>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                <div id="karya_ilmiah_sitasi" class="tab-pane fade">
                                                                        <div class="table-responsive-md" id="k3karya_ilmiah">
                                                                            <table class="table table-bordered">
                                                                                <thead class="head1">
                                                                                    <tr>
                                                                                        <th class="dalam2">No</th>
                                                                                        <th class="dalam2">Nama Dosen</th>
                                                                                        <th class="dalam2">Judul Artikel yang Disitasi (Jurnal, Volume, Tahun, Nomor, Halaman) </th>
                                                                                        <th class="dalam2">Jumlah Sitasi</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        @for ($i = 1; $i <= 4; $i++)
                                                                                            <th class="dalam">{{$i}}</th>
                                                                                        @endfor
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody style="background-color: #343A40;">
                                                                                    @foreach ($kid as $idx => $k)
                                                                                    <tr>
                                                                                        <th class="dalam">{{$idx+1}}</th>
                                                                                        <td>{{$k->nm_sdm}}</td>
                                                                                        <td>{{$k->judul}}</td>
                                                                                        <td>{{rand(1,100)}}</td> 
                                                                                    </tr>
                                                                                    @endforeach
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                <div id="produk_adopsi_masyarakat" class="tab-pane fade">
                                                                        <div class="table-responsive-md">
                                                                            <table class="table table-bordered" style="width: 40rem;">
                                                                                <thead class="head1">
                                                                                    <tr>
                                                                                        <th class="dalam2">No</th>
                                                                                        <th class="dalam2">Nama Dosen</th>
                                                                                        <th class="dalam2">Nama Produk/Jasa</th>
                                                                                        <th class="dalam2">Deskripsi Produk/Jasa</th>
                                                                                        <th class="dalam2">Bukti</th>
                                                                                        <th class="dalam2">Tahun (YYYY)</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        @for ($i = 1; $i <= 6; $i++)
                                                                                            <th class="dalam">{{$i}}</th>
                                                                                        @endfor
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody style="background-color: #343A40;">
                                                                                    <tr>
                                                                                        <th class="dalam">1</th>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>  
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">2</th>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>  
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">3</th>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>   
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">4</th>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">5</th>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                <div id="luaran_pkm_DTPS" class="tab-pane fade">
                                                                        <div class="table-responsive-md" id="k3luaran_pkm">
                                                                            <table class="table table-bordered">
                                                                                <thead class="head1">
                                                                                    <tr>
                                                                                        <th class="dalam2">No</th>
                                                                                        <th class="dalam2">Luaran Penelitian dan PkM</th>
                                                                                        <th class="dalam2" style="width: 15%;">Tahun (YYYY)</th>
                                                                                        <th class="dalam2">Keterangan</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        @for ($i = 1; $i <= 4; $i++)
                                                                                            <th class="dalam">{{$i}}</th>
                                                                                        @endfor
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody style="background-color: #343A40;">
                                                                                    <tr>
                                                                                        <th class="dalam">I</th>
                                                                                        <td colspan="3">HKI: a) Paten, b) Paten Sederhana</td> 
                                                                                    </tr>
                                                                                    @php
                                                                                        $idx=1;
                                                                                    @endphp
                                                                                    @if (($paten->contains('id_sms', $detail_prodi->id_prodi)))
                                                                                        @foreach ($paten as $p)
                                                                                            @if ($p->id_sms == $detail_prodi->id_prodi)
                                                                                            <tr>
                                                                                                <th class="dalam">{{$idx}}</th>
                                                                                                <td>{{$p->judul}}</td>
                                                                                                <td>{{$p->tahun}}</td>
                                                                                                @if ($p->tahun == '2022' || $p->tahun == '2019')
                                                                                                    @php
                                                                                                        $ket = 'Awardee'
                                                                                                    @endphp
                                                                                                @else
                                                                                                    @php
                                                                                                        $ket = 'Online'
                                                                                                @endphp
                                                                                                
                                                                                                @endif
                                                                                                <td>{{$ket}}</td> 
                                                                                                @php
                                                                                                    $idx++;
                                                                                                @endphp
                                                                                            </tr>
                                                                                            @endif
                                                                                        @endforeach
                                                                                    @else
                                                                                        @foreach ($paten as $p)
                                                                                            @if($p->id_sms === null)
                                                                                            <tr>
                                                                                                <th class="dalam">{{$idx}}</th>
                                                                                                <td>{{$p->judul}}</td>
                                                                                                <td>{{$p->tahun}}</td>
                                                                                                @if ($p->tahun == '2022' || $p->tahun == '2019')
                                                                                                    @php
                                                                                                        $ket = 'Awardee'
                                                                                                    @endphp
                                                                                                @else
                                                                                                    @php
                                                                                                        $ket = 'Online'
                                                                                                @endphp
                                                                                                
                                                                                                @endif
                                                                                                <td>{{$ket}}</td> 
                                                                                                @php
                                                                                                    $idx++;
                                                                                                @endphp
                                                                                            </tr>
                                                                                            @endif
                                                                                        @endforeach
                                                                                    @endif
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                <div id="luaran_HKI" class="tab-pane fade">
                                                                        <div class="table-responsive-md" id="k3luaran_hki">
                                                                            <table class="table table-bordered">
                                                                                <thead class="head1">
                                                                                    <tr>
                                                                                        <th class="dalam2">No</th>
                                                                                        <th class="dalam2">Luaran Penelitian dan PkM</th>
                                                                                        <th class="dalam2" style="width: 15%;">Tahun (YYYY)</th>
                                                                                        <th class="dalam2">Keterangan</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        @for ($i = 1; $i <= 4; $i++)
                                                                                            <th class="dalam">{{$i}}</th>
                                                                                        @endfor
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody style="background-color: #343A40;">
                                                                                    <tr>
                                                                                        <th class="dalam">II</th>
                                                                                        <td colspan="3">HKI: a) Hak Cipta, b) Desain Produk Industri,  c) Perlindungan Varietas Tanaman 
                                                                                            (Sertifikat Perlindungan Varietas Tanaman, Sertifikat Pelepasan Varietas, Sertifikat 
                                                                                            Pendaftaran Varietas), d) Desain Tata Letak Sirkuit Terpadu, e) dll.)
                                                                                        </td>  
                                                                                    </tr>
                                                                                    @php
                                                                                        $idx=1;
                                                                                    @endphp
                                                                                    @if (($hak_cipta->contains('id_sms', $detail_prodi->id_prodi)))
                                                                                        @foreach ($hak_cipta as $hk)
                                                                                            @if ($hk->id_sms == $detail_prodi->id_prodi)
                                                                                            <tr>
                                                                                                <th class="dalam">{{$idx}}</th>
                                                                                                <td>{{$hk->judul}}</td>
                                                                                                <td>{{$hk->tahun}}</td>
                                                                                                @if ($hk->tahun == '2022' || $hk->tahun == '2019')
                                                                                                    @php
                                                                                                        $ket = 'Awardee'
                                                                                                    @endphp
                                                                                                @else
                                                                                                    @php
                                                                                                        $ket = 'Online'
                                                                                                @endphp
                                                                                                
                                                                                                @endif
                                                                                                <td>{{$ket}}</td> 
                                                                                                @php
                                                                                                    $idx++;
                                                                                                @endphp
                                                                                            </tr>
                                                                                            @endif
                                                                                        @endforeach
                                                                                    @else
                                                                                        @foreach ($hak_cipta as $hk)
                                                                                            @if($hk->id_sms === null)
                                                                                            <tr>
                                                                                                <th class="dalam">{{$idx}}</th>
                                                                                                <td>{{$hk->judul}}</td>
                                                                                                <td>{{$hk->tahun}}</td>
                                                                                                @if ($hk->tahun == '2022' || $hk->tahun == '2019')
                                                                                                    @php
                                                                                                        $ket = 'Awardee'
                                                                                                    @endphp
                                                                                                @else
                                                                                                    @php
                                                                                                        $ket = 'Online'
                                                                                                @endphp
                                                                                                
                                                                                                @endif
                                                                                                <td>{{$ket}}</td> 
                                                                                                @php
                                                                                                    $idx++;
                                                                                                @endphp
                                                                                            </tr>
                                                                                            @endif
                                                                                        @endforeach
                                                                                    @endif
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                <div id="luaran_teknologi" class="tab-pane fade">
                                                                        <div class="table-responsive-md" id="k3luaran_teknologi">
                                                                            <table class="table table-bordered">
                                                                                <thead class="head1">
                                                                                    <tr>
                                                                                        <th class="dalam2">No</th>
                                                                                        <th class="dalam2">Luaran Penelitian dan PkM</th>
                                                                                        <th class="dalam2" style="width: 15%;">Tahun (YYYY)</th>
                                                                                        <th class="dalam2">Keterangan</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        @for ($i = 1; $i <= 4; $i++)
                                                                                            <th class="dalam">{{$i}}</th>
                                                                                        @endfor
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody style="background-color: #343A40;">
                                                                                    <tr>
                                                                                        <th class="dalam">III</th>
                                                                                        <td colspan="3">
                                                                                            Teknologi Tepat Guna, Produk (Produk Terstandarisasi, Produk 
                                                                                            Tersertifikasi), Karya Seni, Rekayasa Sosial
                                                                                        </td>   
                                                                                    </tr>
                                                                                    @foreach ($teknologi_karya as $idx => $tk)
                                                                                    <tr>
                                                                                        <th class="dalam">{{$idx+1}}</th>
                                                                                        <td>{{$tk->judul}}</td>
                                                                                        <td>{{$tk->tahun}}</td>
                                                                                        @if ($tk->tahun == '2022' || $tk->tahun == '2019')
                                                                                            @php
                                                                                                $ket = 'Awardee'
                                                                                            @endphp
                                                                                        @else
                                                                                            @php
                                                                                                $ket = 'Online'
                                                                                        @endphp
                                                                                        @endif
                                                                                        <td>{{$ket}}</td>  
                                                                                    </tr>
                                                                                    @endforeach
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                <div id="luaran_book" class="tab-pane fade">
                                                                        <div class="table-responsive-md" id="k3luaran_book">
                                                                            <table class="table table-bordered">
                                                                                <thead class="head1">
                                                                                    <tr>
                                                                                        <th class="dalam2">No</th>
                                                                                        <th class="dalam2">Luaran Penelitian dan PkM</th>
                                                                                        <th class="dalam2" style="width: 15%;">Tahun (YYYY)</th>
                                                                                        <th class="dalam2">Keterangan</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        @for ($i = 1; $i <= 4; $i++)
                                                                                            <th class="dalam">{{$i}}</th>
                                                                                        @endfor
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody style="background-color: #343A40;">
                                                                                    <tr>
                                                                                        <th class="dalam">IV</th>
                                                                                        <td colspan="3">
                                                                                            Buku ber-ISBN, Book Chapter
                                                                                        </td>   
                                                                                    </tr>
                                                                                    @php
                                                                                        $idx=1;
                                                                                    @endphp
                                                                                    @if (($luaran_buku->contains('id_sms', $detail_prodi->id_prodi)))
                                                                                        @foreach ($luaran_buku as $book)
                                                                                            @if ($book->id_sms == $detail_prodi->id_prodi)
                                                                                            <tr>
                                                                                                <th class="dalam">{{$idx}}</th>
                                                                                                <td>{{$book->judul}}</td>
                                                                                                <td>{{$book->tahun}}</td>
                                                                                                @if ($book->tahun == '2022' || $book->tahun == '2019')
                                                                                                    @php
                                                                                                        $ket = 'Awardee'
                                                                                                    @endphp
                                                                                                @else
                                                                                                    @php
                                                                                                        $ket = 'Online'
                                                                                                @endphp
                                                                                                
                                                                                                @endif
                                                                                                <td>{{$ket}}</td> 
                                                                                                @php
                                                                                                    $idx++;
                                                                                                @endphp
                                                                                            </tr>
                                                                                            @endif
                                                                                        @endforeach
                                                                                    @else
                                                                                        @foreach ($luaran_buku as $book)
                                                                                            @if($book->id_sms === null)
                                                                                            <tr>
                                                                                                <th class="dalam">{{$idx}}</th>
                                                                                                <td>{{$book->judul}}</td>
                                                                                                <td>{{$book->tahun}}</td>
                                                                                                @if ($book->tahun == '2022' || $book->tahun == '2019')
                                                                                                    @php
                                                                                                        $ket = 'Awardee'
                                                                                                    @endphp
                                                                                                @else
                                                                                                    @php
                                                                                                        $ket = 'Online'
                                                                                                @endphp
                                                                                                
                                                                                                @endif
                                                                                                <td>{{$ket}}</td> 
                                                                                                @php
                                                                                                    $idx++;
                                                                                                @endphp
                                                                                            </tr>
                                                                                            @endif
                                                                                        @endforeach
                                                                                    @endif
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div id="kriteria4" class="tab-pane fade">     
                                                <div class="card-body">
                                                    <h6 style="text-align:right;">Data Tersebut Dibuat Berdasarkan BAN-PT</h6>
                                                    <div class="container">
                                                        <div class="row">
                                                            <div class="flex-container">
                                                                <div class="sidebar4" id="sidebar4">
                                                                        <h4 class="card-title" style="margin-left:30px;color:#000000;font-weight:bold;margin-top:20px;padding-bottom: 10px;">Dana</h4>
                                                                            <ul class="nav nav-tabs" id="mytab" role="tablist" style="list-style-type: none;float: left;">
                                                                                <li class="nav-item">
                                                                                    <a  data-toggle="tab" class="nav-link" href="#dana" style="color:#000000;padding-right: 82px;">Penggunaan Dana</a>
                                                                                </li>
                                                                            </ul>
                                                                            <button class="btn btn-danger" id="btn8" onclick="button_close4()">X</button>
                                                                        </div>
                                                                    <div id="main4">
                                                                        <button class="btn btn-success" id="btn7" onclick="button_open4()">☰</button>
                                                                    </div>
                                                            <div class="tab-content">
                                                                <div id="dana" class="tab-pane fade">
                                                                        <div class="table-responsive-md" id="k4dana">
                                                                            <table class="table table-bordered">
                                                                                <thead class="head1">
                                                                                    <tr>
                                                                                        <th rowspan="2" class="dalam2">No</th>
                                                                                        <th rowspan="2" class="dalam2">Jenis Penggunaan</th>
                                                                                        <th colspan="4" class="dalam2">
                                                                                            Unit Pengelola Program Studi 
                                                                                            (Rupiah)
                                                                                        </th>
                                                                                        <th colspan="4" class="dalam2">
                                                                                            Program Studi 
                                                                                            (Rupiah)
                                                                                        </th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">TS-2</th>
                                                                                        <th class="dalam">TS-1</th>
                                                                                        <th class="dalam">TS</th>
                                                                                        <th class="dalam">Rata-rata</th>
                                                                                        <th class="dalam">TS-2</th>
                                                                                        <th class="dalam">TS-1</th>
                                                                                        <th class="dalam">TS</th>
                                                                                        <th class="dalam">Rata-rata</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        @for ($i = 1; $i <= 10; $i++)
                                                                                            <th class="dalam">{{$i}}</th>
                                                                                        @endfor
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody style="background-color: #343A40;">
                                                                                    <tr>
                                                                                        <th class="dalam">1</th>
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">2</th>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>  
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>  
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>  
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">3</th>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>  
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>  
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>   
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">4</th>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>  
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>  
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>    
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">5</th>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>  
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>  
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>    
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">6</th>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>  
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>  
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>   
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div id="kriteria5" class="tab-pane fade">     
                                                <div class="card-body">
                                                    <h6 style="text-align:right;">Data Tersebut Dibuat Berdasarkan BAN-PT</h6>
                                                    <div class="container">
                                                        <div class="row">
                                                            <div class="flex-container">
                                                                <div class="sidebar5" id="sidebar5">
                                                                        <h4 class="card-title" style="margin-left:30px;color:#000000;font-weight:bold;margin-top:20px;padding-bottom: 10px;">Pembelajaran, integrasi, kepuasan</h4>
                                                                            <ul class="nav nav-tabs" id="mytab" role="tablist" style="list-style-type: none;float: left;">
                                                                                <li class="nav-item" style="padding-bottom: 10px;">
                                                                                    <a  data-toggle="tab" class="nav-link" href="#pembelajaran" style="color:#000000;">Kurikulum, Capaian Pembelajaran, dan Rencana Pembelajaran</a>
                                                                                </li>
                                                                                <li class="nav-item" style="padding-bottom: 10px;">
                                                                                    <a  data-toggle="tab" class="nav-link" href="#integrasi" style="color:#000000;">Integrasi Kegiatan Penelitian/PkM dalam Pembelajaran</a>
                                                                                </li>
                                                                                <li class="nav-item">
                                                                                    <a  data-toggle="tab" class="nav-link" href="#kepuasan" style="color:#000000;">Kepuasan Mahasiswa</a>
                                                                                </li>
                                                                            </ul>
                                                                            <button class="btn btn-danger" id="btn10" onclick="button_close5()">X</button>
                                                                        </div>
                                                                    <div id="main5">
                                                                        <button class="btn btn-success" id="btn9" onclick="button_open5()">☰</button>
                                                                    </div>
                                                            <div class="tab-content">
                                                                <div id="pembelajaran" class="tab-pane fade">
                                                                        <div class="table-responsive-md">
                                                                            <table class="table table-bordered">
                                                                                <thead class="head1">
                                                                                    <tr>
                                                                                        <th rowspan="2" class="tabel">No</th>
                                                                                        <th rowspan="2" class="tabel">Semester</th>
                                                                                        <th rowspan="2" class="tabel">Kode Mata Kuliah</th>
                                                                                        <th rowspan="2" class="tabel">Nama Mata Kuliah</th>
                                                                                        <th rowspan="2" class="tabel">Mata Kuliah Kom-petensi</th>
                                                                                        <th colspan="3" class="tabel">Bobot Kredit  (sks)</th>
                                                                                        <th rowspan="2" class="tabel">Konversi Kredit ke Jam</th>
                                                                                        <th colspan="4" class="tabel">Capaian Pembelajaran</th>
                                                                                        <th rowspan="2" class="tabel">Dokumen Rencana Pembela-jaran</th>
                                                                                        <th rowspan="2" class="tabel">Unit Penyeleng-gara</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="tabel3">Kuliah/ Responsi/ Tutorial</th>
                                                                                        <th class="tabel3">Seminar</th>
                                                                                        <th class="tabel3">Praktikum/ Praktik/ Praktik Lapangan</th>
                                                                                        <th class="tabel3">Sikap</th>
                                                                                        <th class="tabel3">Pengeta-huan</th>
                                                                                        <th class="tabel3">Keteram-pilan Umum</th>
                                                                                        <th class="tabel3">Keteram-pilan Khusus</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        @for ($i = 1; $i <= 15; $i++)
                                                                                            <th class="tabel2">{{$i}}</th>
                                                                                        @endfor
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody style="background-color: #343A40;">
                                                                                    <tr>
                                                                                        <th class="tabel2">1</th>
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="tabel2">2</th>
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="tabel2">3</th>
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="tabel2">4</th>
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>    
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="tabel2">5</th>
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>    
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="tabel2">6</th>
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                        <td></td>   
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                <div id="integrasi" class="tab-pane fade">
                                                                        <div class="table-responsive-md">
                                                                            <table class="table table-bordered">
                                                                                <thead class="head1">
                                                                                    <tr>
                                                                                        <th class="dalam2">No</th>
                                                                                        <th class="dalam2">Judul Penelitian/PkM</th>
                                                                                        <th class="dalam2">Nama Dosen</th>
                                                                                        <th class="dalam2">Mata Kuliah</th>
                                                                                        <th class="dalam2">Bentuk Integrasi</th>
                                                                                        <th class="dalam2">Tahun (YYYY)</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        @for ($i = 1; $i <= 6; $i++)
                                                                                            <th class="dalam">{{$i}}</th>
                                                                                        @endfor
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody style="background-color: #343A40;">
                                                                                    <tr>
                                                                                        <th class="dalam">1</th>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>  
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">2</th>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>  
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">3</th>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>  
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">4</th>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>  
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">5</th>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam">6</th>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td>
                                                                                        <td></td> 
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                <div id="kepuasan" class="tab-pane fade">
                                                                        <div class="table-responsive-md">
                                                                            <table class="table table-bordered">
                                                                                <thead class="head1">
                                                                                    <tr>
                                                                                        <th rowspan="2" class="dalam2" style="vertical-align: middle">No</th>
                                                                                        <th rowspan="2" class="dalam2" style="width: 25%;vertical-align: middle;">Aspek yang Diukur</th>
                                                                                        <th colspan="4" class="dalam2">Tingkat Kepuasan Mahasiswa(%)</th>
                                                                                        <th rowspan="2" class="dalam2" style="vertical-align: middle">Rencana Tindak Lanjut oleh UPPS/PS</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam" style="vertical-align: middle">Sangat Baik</th>
                                                                                        <th class="dalam" style="vertical-align: middle">Baik</th>
                                                                                        <th class="dalam" style="vertical-align: middle">Cukup</th>
                                                                                        <th class="dalam" style="vertical-align: middle">Kurang</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        @for ($i = 1; $i <= 7; $i++)
                                                                                            <th class="dalam">{{$i}}</th>
                                                                                        @endfor
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody style="background-color: #343A40;">
                                                                                    <tr>
                                                                                        <th class="dalam" style="vertical-align: middle">1</th>
                                                                                        <td>
                                                                                            Keandalan (reliability): kemampuan dosen, tenaga kependidikan, dan pengelola dalam 
                                                                                            memberikan pelayanan.
                                                                                        </td>
                                                                                        <td>56</td>
                                                                                        <td>32</td>
                                                                                        <td>12</td>
                                                                                        <td>0</td>
                                                                                        <td>-</td>   
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam" style="vertical-align: middle">2</th>
                                                                                        <td>
                                                                                            Daya tanggap (responsiveness): kemauan dari dosen, tenaga kependidikan, dan pengelola 
                                                                                            dalam membantu mahasiswa dan memberikan jasa dengan cepat.
                                                                                        </td>
                                                                                        <td>33</td>
                                                                                        <td>42</td>
                                                                                        <td>25</td>
                                                                                        <td>0</td>
                                                                                        <td>-</td>    
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam" style="vertical-align: middle">3</th>
                                                                                        <td>
                                                                                            Kepastian (assurance): kemampuan dosen, tenaga kependidikan, dan pengelola 
                                                                                            untuk memberi keyakinan kepada mahasiswa bahwa pelayanan yang diberikan 
                                                                                            telah sesuai dengan ketentuan.
                                                                                        </td>
                                                                                        <td>41</td>
                                                                                        <td>32</td>
                                                                                        <td>26</td>
                                                                                        <td>1</td>
                                                                                        <td>-</td>    
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam" style="vertical-align: middle">4</th>
                                                                                        <td>
                                                                                            Empati (empathy): kesediaan/kepedulian dosen, tenaga kependidikan, dan pengelola 
                                                                                            untuk memberi perhatian kepada mahasiswa.
                                                                                        </td>
                                                                                        <td>30</td>
                                                                                        <td>55</td>
                                                                                        <td>14</td>
                                                                                        <td>1</td>
                                                                                        <td>-</td>   
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th class="dalam" style="vertical-align: middle">5</th>
                                                                                        <td>
                                                                                            Tangible: penilaian mahasiswa terhadap kecukupan, aksesibitas, kualitas 
                                                                                            sarana dan prasarana.
                                                                                        </td>
                                                                                        <td>59</td>
                                                                                        <td>26</td>
                                                                                        <td>25</td>
                                                                                        <td>0</td>
                                                                                        <td>-</td>   
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <th colspan="2" class="dalam2">Jumlah</th>
                                                                                        <th class="dalam2">219</th>
                                                                                        <th class="dalam2">187</th>
                                                                                        <th class="dalam2">102</th>
                                                                                        <th class="dalam2">2</th>
                                                                                        <th class="dalam2"></th>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div id="kriteria6" class="tab-pane fade">     
                                                <div class="card-body">
                                                    <h6 style="text-align:right;">Data Tersebut Dibuat Berdasarkan BAN-PT</h6>
                                                    <div class="container">
                                                        <div class="row">
                                                            <div class="flex-container">
                                                                <div class="sidebar6" id="sidebar6">
                                                                        <h4 class="card-title" style="margin-left:30px;color:#000000;font-weight:bold;margin-top:20px;padding-bottom: 10px;">Penelitian DTPS</h4>
                                                                            <ul class="nav nav-tabs" id="mytab" role="tablist" style="list-style-type: none;float: left;">
                                                                                <li class="nav-item" style="padding-bottom:10px;">
                                                                                    <a data-toggle="tab" role="presentation" class="nav-link" href="#mahasiswa" style="color:#000000;">Penelitian DTPS yang Melibatkan Mahasiswa</a>
                                                                                </li>
                                                                                <li class="nav-item" style="padding-bottom:10px;">
                                                                                    <a data-toggle="tab" role="presentation" class="nav-link" href="#tesis"  style="color:#000000;">Penelitian DTPS yang Menjadi Rujukan Tema Tesis/Disertasi</a>
                                                                                </li>
                                                                            </ul>
                                                                            <button class="btn btn-danger" id="btn12" onclick="button_close6()">X</button>
                                                                        </div>
                                                                    <div id="main6">
                                                                        <button class="btn btn-success" id="btn11" onclick="button_open6()">☰</button>
                                                                    </div>
                                                            <div class="tab-content">
                                                                <div id="mahasiswa" class="tab-pane fade">
                                                                        <div class="table-responsive-md">
                                                                            <table class="table table-bordered">
                                                                                <thead class="head1">
                                                                                    <tr>
                                                                                        <th class="dalam2" style="vertical-align: middle">No</th>
                                                                                        <th class="dalam2" style="vertical-align: middle">Nama Dosen</th>
                                                                                        <th class="dalam2" style="vertical-align: middle">Tema Penelitian sesuai Roadmap</th>
                                                                                        <th class="dalam2" style="vertical-align: middle">Nama Mahasiswa</th>
                                                                                        <th class="dalam2" style="vertical-align: middle">Judul Kegiatan</th>
                                                                                        <th class="dalam2" style="vertical-align: middle">Tahun (YYYY)</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                    @for ($i = 1; $i <= 6; $i++)
                                                                                        <th class="dalam1">{{$i}}</th>
                                                                                    @endfor
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody style="background-color: #343A40;">
                                                                                    @php
                                                                                        $tema_pkm = [
                                                                                            'PKM-RE',
                                                                                            'PKM-RSH',
                                                                                            'PKM-K',
                                                                                            'PKM-PM',
                                                                                            'PKM-PI',
                                                                                            'PKM-KKC',
                                                                                            'PKM-KI',
                                                                                            'PKM-VGK',
                                                                                            'PKM-GFT',
                                                                                            'PKM-AI'
                                                                                        ];
                                                                                    @endphp
                                                                                    @foreach ($penelitian_dtps_mahasiswa->reverse() as $idx => $pdm)
                                                                                    <tr>
                                                                                        <th class="dalam1">{{$idx+1}}</th>
                                                                                        <td>{{$pdm->dosen}}</td>
                                                                                        <td>{{$tema_pkm[array_rand($tema_pkm)]}}</td>
                                                                                        <td>{{$pdm->mhs}}</td>
                                                                                        <td>{{$pdm->judul_litabmas}}</td>
                                                                                        <td>{{$pdm->id_thn_kegiatan}}</td>  
                                                                                    </tr>
                                                                                    @endforeach
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                <div id="tesis" class="tab-pane fade">
                                                                        <div class="table-responsive-md">
                                                                            <table class="table table-bordered" style="margin-left: 10px;">
                                                                                <thead class="head1">
                                                                                    <tr>
                                                                                        <th class="dalam2" style="vertical-align: middle">No</th>
                                                                                        <th class="dalam2" style="vertical-align: middle">Nama Dosen</th>
                                                                                        <th class="dalam2" style="vertical-align: middle">Tema Penelitian sesuai Roadmap</th>
                                                                                        <th class="dalam2" style="vertical-align: middle">Nama Mahasiswa</th>
                                                                                        <th class="dalam2" style="vertical-align: middle">Judul Tesis/Disertasi</th>
                                                                                        <th class="dalam2" style="vertical-align: middle">Tahun (YYYY)</th>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        @for ($i = 1; $i <= 6; $i++)
                                                                                            <th class="dalam1">{{$i}}</th>
                                                                                        @endfor
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody style="background-color: #343A40;">
                                                                                    @foreach ($penelitian_dtps_mahasiswa as $idx => $pdm)
                                                                                    <tr>
                                                                                        <th class="dalam1">{{$idx+1}}</th>
                                                                                        <td>{{$pdm->dosen}}</td>
                                                                                        <td>{{$tema_pkm[array_rand($tema_pkm)]}}</td>
                                                                                        <td>{{$pdm->mhs}}</td>
                                                                                        <td>{{$pdm->judul_litabmas}}</td>
                                                                                        <td>{{$pdm->id_thn_kegiatan}}</td>  
                                                                                    </tr>
                                                                                    @endforeach
                                                                                </tbody>
                                                                            </table> 
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div id="kriteria7" class="tab-pane fade">     
                                                <div class="card-body">
                                                    <h6 style="text-align:right;">Data Tersebut Dibuat Berdasarkan BAN-PT</h6>
                                                    <div class="container">
                                                        <div class="row">
                                                            <div class="flex-container">
                                                                <div class="sidebar7" id="sidebar7">
                                                                        <h4 class="card-title" style="margin-left:30px;color:#000000;font-weight:bold;margin-top:20px;padding-bottom: 10px;">Penelitian DTPS</h4>
                                                                            <ul class="nav nav-tabs" id="mytab" role="tablist" style="list-style-type: none;float: left;">
                                                                                <li class="nav-item">
                                                                                    <a data-toggle="tab" role="presentation" class="nav-link" href="#dtps" style="color: #000000">PkM DTPS yang Melibatkan Mahasiswa</a>
                                                                                </li>
                                                                            </ul>
                                                                            <button class="btn btn-danger" id="btn14" onclick="button_close7()">X</button>
                                                                        </div>
                                                                    <div id="main7">
                                                                        <button class="btn btn-success" id="btn13" onclick="button_open7()">☰</button>
                                                                    </div>
                                                                    <div class="tab-content">
                                                                        <div id="dtps" class="tab-pane fade">
                                                                                <div class="table-responsive-md">
                                                                                    <table class="table table-bordered" style="margin-left: 10px;">
                                                                                        <thead>
                                                                                            <tr>
                                                                                                <th class="dalam2">No</th>
                                                                                                <th class="dalam2">Nama Dosen</th>
                                                                                                <th class="dalam2">Tema Pkm Sesuai Roadmap</th>
                                                                                                <th class="dalam2">Nama Mahasiswa</th>
                                                                                                <th class="dalam2">Judul Kegiatan</th>
                                                                                                <th class="dalam2">Tahun (YYYY)</th>
                                                                                            </tr>
                                                                                            <tr>
                                                                                            @for ($i = 1; $i <= 6; $i++)
                                                                                                <th class="dalam">{{$i}}</th>
                                                                                            @endfor
                                                                                            </tr>
                                                                                        </thead>
                                                                                        <tbody style="background-color: #343A40;">
                                                                                            @foreach ($pkm_dtps_mhs as $idx => $pdm)
                                                                                            <tr>
                                                                                                <th class="dalam">{{$idx+1}}</th>
                                                                                                <td>{{$pdm->dosen}}</td>
                                                                                                <td>{{$tema_pkm[array_rand($tema_pkm)]}}</td>
                                                                                                <td>{{$pdm->mhs}}</td>
                                                                                                <td>{{$pdm->judul_litabmas}}</td>
                                                                                                <td>{{$pdm->id_thn_kegiatan}}</td> 
                                                                                            </tr>
                                                                                            @endforeach
                                                                                        </tbody>
                                                                                    </table>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div id="kriteria8" class="tab-pane fade">     
                                                        <div class="card-body">
                                                            <h6 style="text-align:right;">Data Tersebut Dibuat Berdasarkan BAN-PT</h6>
                                                            <div class="container-fluid">
                                                                <div class="row">
                                                                    <div class="flex-container">
                                                                        <div class="sidebar8" id="sidebar8">
                                                                                <h4 class="card-title" style="margin-left:30px;color:#000000;font-weight:bold;margin-top:20px;padding-bottom: 10px;">Dosen dan Penelitian</h4>
                                                                                    <ul class="nav nav-tabs" role="tablist" style="list-style-type:none;float:left;">
                                                                                        <li class="nav-item">
                                                                                            <a data-toggle="tab" role="presentation" class="nav-link" href="#lulusan" style="color: #000000">IPK Lulusan</a>
                                                                                        </li>
                                                                                        <li class="nav-item">
                                                                                            <a data-toggle="tab" role="presentation" class="nav-link" href="#akademik" style="color: #000000">Prestasi Akademik Mahasiswa</a>
                                                                                        </li>
                                                                                        <li class="nav-item">
                                                                                            <a data-toggle="tab" role="presentation" class="nav-link" href="#nonakademik" style="color: #000000">Prestasi Non-Akademik Mahasiswa</a>
                                                                                        </li>
                                                                                        <li class="nav-item">
                                                                                            <a data-toggle="tab" role="presentation" class="nav-link" href="#studi_lulusan" style="color: #000000">Masa Studi Lulusan</a>
                                                                                        </li>
                                                                                        <li class="nav-item">
                                                                                            <a data-toggle="tab" role="presentation" class="nav-link" href="#waktu_tunggu" style="color: #000000">Waktu Tunggu Lulusan</a>
                                                                                        </li>
                                                                                        <li class="nav-item">
                                                                                            <a data-toggle="tab" role="presentation" class="nav-link" href="#kesesuaian" style="color: #000000">Kesesuaian Bidang Kerja Lulusan</a>
                                                                                        </li class="nav-item">
                                                                                        <li class="nav-item">
                                                                                            <a data-toggle="tab" role="presentation" class="nav-link" href="#tempat_kerja" style="color: #000000">Tempat Kerja Lulusan</a>
                                                                                        </li>
                                                                                        <li class="nav-item">
                                                                                            <a data-toggle="tab" role="presentation" class="nav-link" href="#ref_kepuasan_lulusan" style="color: #000000">Refrensi Kepuasan Pengguna Lulusan</a>
                                                                                        </li>
                                                                                        <li class="nav-item">
                                                                                            <a data-toggle="tab" role="presentation" class="nav-link" href="#kepuasan_lulusan" style="color: #000000">Kepuasan Pengguna Lulusan</a>
                                                                                        </li>
                                                                                        <li class="nav-item">
                                                                                            <a data-toggle="tab" role="presentation" class="nav-link" href="#publikasi_ilmiah" style="color: #000000">Publikasi Ilmiah Mahasiswa</a>
                                                                                        </li>
                                                                                        <li class="nav-item">
                                                                                            <a data-toggle="tab" role="presentation" class="nav-link" href="#presentasi_ilmiah" style="color: #000000">Pagelaran/Pameran/Presentasi/Publikasi Ilmiah Mahasiswa</a>
                                                                                        </li>
                                                                                        <li class="nav-item">
                                                                                            <a data-toggle="tab" role="presentation" class="nav-link" href="#karya_ilmiah" style="color: #000000">Karya Ilmiah Mahasiswa yang Disitasi</a>
                                                                                        </li>
                                                                                        <li class="nav-item">
                                                                                            <a data-toggle="tab" role="presentation" class="nav-link" href="#jasa_mahasiswa" style="color: #000000">Produk/Jasa Mahasiswa yang Diadopsi oleh Industri/Masyarakat</a>
                                                                                        </li>
                                                                                        <li class="nav-item">
                                                                                            <a data-toggle="tab" role="presentation" class="nav-link" href="#hki_paten" style="color: #000000">Luaran Penelitian yang Dihasilkan Mahasiswa - HKI (Paten, Paten Sederhana)</a>
                                                                                        </li>
                                                                                        <li class="nav-item">
                                                                                            <a data-toggle="tab" role="presentation" class="nav-link" href="#hki_cipta" style="color: #000000">Luaran Penelitian yang Dihasilkan Mahasiswa - HKI (Hak Cipta, Desain Produk Industri, dll.)</a>
                                                                                        </li>
                                                                                        <li class="nav-item">
                                                                                            <a data-toggle="tab" role="presentation" class="nav-link" href="#teknologi_tepat_guna" style="color: #000000">Luaran Penelitian yang Dihasilkan Mahasiswa -Teknologi Tepat Guna, Produk, Karya Seni, Rekayasa Sosial</a>
                                                                                        </li>
                                                                                        <li class="nav-item">
                                                                                            <a data-toggle="tab" role="presentation" class="nav-link" href="#book_chapter" style="color: #000000"> Luaran Penelitian yang Dihasilkan Mahasiswa - Buku ber-ISBN, Book Chapter</a>
                                                                                        </li>
                                                                                    </ul>
                                                                                    <button class="btn btn-danger" id="btn16" onclick="button_close8()">X</button>
                                                                                
                                                                                </div>
                                                                            <div id="main8">
                                                                                <button class="btn btn-success" id="btn15" onclick="button_open8()">☰</button>
                                                                            </div>
                                                                            <div class="tab-content">
                                                                                <div id="lulusan" class="tab-pane fade">
                                                                                        <div class="table-responsive-md">
                                                                                            <table class="table table-bordered">
                                                                                                <thead class="head1">
                                                                                                    <tr>
                                                                                                        <th rowspan="2" class="dalam2" style="vertical-align: middle">No</th>
                                                                                                        <th rowspan="2" class="dalam2" style="width: 20%;vertical-align: middle;">Tahun Lulus</th>
                                                                                                        <th rowspan="2" class="dalam2" style="width: 15%;vertical-align: middle;">Jumlah Lulusan</th>
                                                                                                        <th colspan="3" class="dalam2" style="vertical-align: middle">Indeks Prestasi Kumulatif</th>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <th class="dalam">Min.</th>
                                                                                                        <th class="dalam">Rata-rata</th>
                                                                                                        <th class="dalam">Maks</th>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                    @for ($i = 1; $i <= 6; $i++)
                                                                                                        <th class="dalam">{{$i}}</th>
                                                                                                    @endfor
                                                                                                    </tr>
                                                                                                </thead>
                                                                                                <tbody style="background-color: #343A40;">
                                                                                                    @foreach ($ipk_mhs as $idx => $ipm)
                                                                                                    <tr>
                                                                                                        <th class="dalam1">{{$idx}}</th>
                                                                                                        @if ($ipm->tahun == '2020')<td class="dalam4">TS-2</td> @endif
                                                                                                        @if ($ipm->tahun == '2021')<td class="dalam4">TS-1</td> @endif
                                                                                                        @if ($ipm->tahun == '2022')<td class="dalam4">TS</td> @endif
                                                                                                        <td>{{$ipm->jumlah_lulus}}</td>
                                                                                                        <td><{{$ipm->ipk_min}}</td>
                                                                                                        <td>{{$ipm->ipk_rata2}}</td>
                                                                                                        <td>{{$ipm->ipk_max}}</td> 
                                                                                                    </tr>
                                                                                                    @endforeach
                                                                                                </tbody>
                                                                                            </table>
                                                                                        </div>
                                                                                    </div>
                                                                                <div id="akademik" class="tab-pane fade">
                                                                                        <div class="table-responsive-md">
                                                                                            <table class="table table-bordered">
                                                                                                <thead class="head1">
                                                                                                    <tr>
                                                                                                        <th class="dalam2" style="vertical-align: middle">No</th>
                                                                                                        <th class="dalam2" style="width: 20%;vertical-align:middle;">Nama Kegiatan</th>
                                                                                                        <th class="dalam2" style="width: 15%;vertical-align:middle;">Waktu Perolehan (YYYY)</th>
                                                                                                        <th class="dalam2" style="vertical-align: middle">Tingkat</th>
                                                                                                        <th class="dalam2" style="vertical-align: middle">Prestasi yang Dicapai</th>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                    @for ($i = 1; $i <= 5; $i++)
                                                                                                        <th class="dalam1">{{$i}}</th>
                                                                                                    @endfor
                                                                                                    </tr>
                                                                                                </thead>
                                                                                                <tbody style="background-color: #343A40;">
                                                                                                    @foreach ($prestasi_mhs as $idx => $pms)
                                                                                                    @if ($pms->id_jenis_prestasi == '1')
                                                                                                    <tr>
                                                                                                        <th class="dalam1">{{$idx+1}}</th>
                                                                                                        <td>{{$pms->nm_prestasi}}</td>
                                                                                                        <td>{{$pms->thn_prestasi}}</td>
                                                                                                        <td>{{$pms->id_tkt_prestasi}}</td>
                                                                                                        <td>{{$pms->nm_prestasi}}</td> 
                                                                                                    </tr>
                                                                                                    @endif
                                                                                                    @endforeach
                                                                                                </tbody>
                                                                                            </table>
                                                                                        </div>
                                                                                    </div>
                                                                                <div id="nonakademik" class="tab-pane fade">
                                                                                        <div class="table-responsive-md">
                                                                                            <table class="table table-bordered">
                                                                                                <thead class="head1">
                                                                                                    <tr>
                                                                                                        <th class="dalam2" style="vertical-align: middle">No</th>
                                                                                                        <th class="dalam2" style="width: 20%;vertical-align:middle;">Nama Kegiatan</th>
                                                                                                        <th class="dalam2" style="width: 15%;vertical-align:middle;">Waktu Perolehan (YYYY)</th>
                                                                                                        <th class="dalam2" style="vertical-align: middle">Tingkat</th>
                                                                                                        <th class="dalam2" style="vertical-align: middle">Prestasi yang Dicapai</th>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                    @for ($i = 1; $i <= 5; $i++)
                                                                                                        <th class="dalam1">{{$i}}</th>
                                                                                                    @endfor
                                                                                                    </tr>
                                                                                                </thead>
                                                                                                <tbody style="background-color: #343A40;">
                                                                                                    @foreach ($prestasi_mhs as $idx => $pms)
                                                                                                    @if ($pms->id_jenis_prestasi != '1')
                                                                                                    <tr>
                                                                                                        <th class="dalam1">{{$idx+1}}</th>
                                                                                                        <td>{{$pms->nm_prestasi}}</td>
                                                                                                        <td>{{$pms->thn_prestasi}}</td>
                                                                                                        <td>{{$pms->id_tkt_prestasi}}</td>
                                                                                                        <td>{{$pms->nm_prestasi}}</td> 
                                                                                                    </tr>
                                                                                                    @endif
                                                                                                    @endforeach
                                                                                                </tbody>
                                                                                            </table>
                                                                                        </div>
                                                                                    </div>
                                                                                <div id="studi_lulusan" class="tab-pane fade">
                                                                                        <div class="table-responsive-md">
                                                                                            <table class="table table-bordered">
                                                                                                <thead class="head1">
                                                                                                    <tr>
                                                                                                        <th rowspan="2" class="dalam2" style="width: 20%;vertical-align:middle;">Tahun Masuk</th>
                                                                                                        <th rowspan="2" class="dalam2" style="width: 15%;vertical-align:middle;">Jumlah Mahasiswa  Diterima</th>
                                                                                                        <th colspan="4" class="dalam2" style="vertical-align: middle">Jumlah Mahasiswa yang lulus pada</th>
                                                                                                        <th rowspan="2" class="dalam2" style="vertical-align: middle">Jumlah Lulusan s.d. akhir TS</th>
                                                                                                        <th rowspan="2" class="dalam2" style="vertical-align: middle">Rata-rata Masa Studi</th>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <th class="dalam">Akhir TS-3</th>
                                                                                                        <th class="dalam">Akhir TS-2</th>
                                                                                                        <th class="dalam">Akhir TS-1</th>
                                                                                                        <th class="dalam">Akhir TS</th>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        @for ($i = 1; $i <= 8; $i++)
                                                                                                            <th class="dalam">{{$i}}</th>
                                                                                                        @endfor
                                                                                                    </tr>
                                                                                                </thead>
                                                                                                <tbody style="background-color: #343A40;">
                                                                                                    <tr>
                                                                                                        <td>TS-3</td>
                                                                                                        <td>{{$jml_mhs['19']+$jml_mhs_tf['19']}}</td>
                                                                                                        <td>0</td>
                                                                                                        <td>0</td>
                                                                                                        <td>0</td>
                                                                                                        <td>{{($jml_mhs['19']+$jml_mhs_tf['19']+1)/2}}</td>
                                                                                                        <td>{{($jml_mhs['19']+$jml_mhs_tf['19']+1)/2}}</td>
                                                                                                        <td>3,5</td>  
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <td>TS-2</td>
                                                                                                        <td>{{$jml_mhs['20']+$jml_mhs_tf['20']}}</td>
                                                                                                        <td>0</td>
                                                                                                        <td>0</td>
                                                                                                        <td>0</td>
                                                                                                        <td>0</td>
                                                                                                        <td>0</td>
                                                                                                        <td>0</td> 
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <td>TS1</td>
                                                                                                        <td>{{$jml_mhs['21']+$jml_mhs_tf['21']}}</td>
                                                                                                        <td>0</td>
                                                                                                        <td>0</td>
                                                                                                        <td>0</td>
                                                                                                        <td>0</td>
                                                                                                        <td>0</td>
                                                                                                        <td>0</td>
                                                                                                    </tr>
                                                                                                </tbody>
                                                                                            </table>  
                                                                                        </div>
                                                                                    </div>
                                                                                <div id="waktu_tunggu" class="tab-pane fade">
                                                                                    <div class="container">
                                                                                        <div class="row">
                                                                                                <ul class="nav nav-pills">
                                                                                                    <li class="col nav-item">
                                                                                                        <a data-toggle="tab" class="nav-link" role="presentation" href="#d3" style="background-color: #007BFF;color:#FFFFFF;font-weight:bold;max-width:100%;">Tabel D3</a>
                                                                                                    </li>
                                                                                                    <li class="col nav-item">
                                                                                                        <a data-toggle="tab" class="nav-link" role="presentation" href="#s1" style="background-color: #007BFF;color:#FFFFFF;font-weight:bold;max-width:100%;">Tabel S1</a>
                                                                                                    </li>
                                                                                                </ul>
                                                                                                    <div class="tab-content">
                                                                                                        <div id="d3" class="tab-pane fade">
                                                                                                                <div class="table-responsive-md">
                                                                                                                    <table class="table table-bordered">
                                                                                                                        <thead class="head1">
                                                                                                                            <tr>
                                                                                                                                <th rowspan="2" class="dalam2">Tahun Lulus</th>
                                                                                                                                <th rowspan="2" class="dalam2">Jumlah Lulusan</th>
                                                                                                                                <th rowspan="2" class="dalam2">Jumlah Lulusan yang Terlacak</th>
                                                                                                                                <th rowspan="2" class="dalam2">Jumlah Lulusan yang Dipesan Sebelum Lulus</th>
                                                                                                                                <th colspan="3" class="dalam2">Jumlah Lulusan Terlacak dengan Waktu Tunggu Mendapatkan Pekerjaan </th>
                                                                                                                            </tr>
                                                                                                                            <tr>
                                                                                                                                <th class="dalam">WT < 3 bulan</th>
                                                                                                                                <th class="dalam">3 ≤ WT ≤ 6 bulan</th>
                                                                                                                                <th class="dalam">WT > 6 bulan</th>
                                                                                                                            </tr>
                                                                                                                            <tr>
                                                                                                                                @for ($i = 1; $i <= 7; $i++)
                                                                                                                                    <th class="dalam">{{$i}}</th>
                                                                                                                                @endfor
                                                                                                                            </tr>
                                                                                                                        </thead>
                                                                                                                        <tbody style="background-color: #343A40;">
                                                                                                                            @php
                                                                                                                                $jml1 = 0;
                                                                                                                                $jml2 = 0;
                                                                                                                                $jml3 = 0;
                                                                                                                                $jml4 = 0;
                                                                                                                                $jml5 = 0;
                                                                                                                            @endphp
                                                                                                                            @foreach ($waktu_tunggu_d3 as $idx => $wtd)
                                                                                                                            <tr>
                                                                                                                                <td style="text-align: center;" >TS{{$idx-4}}</td>
                                                                                                                                <td>{{$wtd->total_lulus}}</td>
                                                                                                                                <td>{{$wtd->total_terdeteksi}}</td>
                                                                                                                                <td>{{$wtd->tidak_tunggu}}</td>
                                                                                                                                <td>{{$wtd->tunggu_kurang_3bulan}}</td>
                                                                                                                                <td>{{$wtd->tunggu_antara_3_6}}</td>
                                                                                                                                <td>{{$wtd->tunggu_lebih_6bulan}}</td>
                                                                                                                            </tr>
                                                                                                                            @php
                                                                                                                                $jml1 += $wts->total_terdeteksi;
                                                                                                                                $jml2 += $wtd->tidak_tunggu;
                                                                                                                                $jml3 += $wts->tunggu_kurang_3bulan;
                                                                                                                                $jml4 += $wts->tunggu_antara_3_6;
                                                                                                                                $jml5 += $wts->tunggu_lebih_6bulan;
                                                                                                                            @endphp
                                                                                                                            @endforeach
                                                                                                                            <tr>
                                                                                                                                <th colspan="2" class="dalam2">Jumlah</th>
                                                                                                                                <th class="dalam2">{{$jml1}}</th>
                                                                                                                                <th class="dalam2">{{$jml2}}</th>
                                                                                                                                <th class="dalam2">{{$jml3}}</th>
                                                                                                                                <th class="dalam2">{{$jml4}}</th>
                                                                                                                                <th class="dalam2">{{$jml5}}</th>
                                                                                                                            </tr>
                                                                                                                        </tbody>
                                                                                                                    </table>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        <div id="s1" class="tab-pane fade">
                                                                                                                <div class="table-responsive-md">
                                                                                                                    <table class="table table-bordered">
                                                                                                                        <thead class="head1">
                                                                                                                            <tr>
                                                                                                                                <th rowspan="2" class="dalam2">Tahun Lulus</th>
                                                                                                                                <th rowspan="2" class="dalam2">Jumlah Lulusan</th>
                                                                                                                                <th rowspan="2" class="dalam2">Jumlah Lulusan yang Terlacak</th>
                                                                                                                                <th colspan="3" class="dalam2">Jumlah Lulusan Terlacak dengan Waktu Tunggu Mendapatkan Pekerjaan </th>
                                                                                                                            </tr>
                                                                                                                            <tr>
                                                                                                                                <th class="dalam">WT < 6 bulan</th>
                                                                                                                                <th class="dalam">6 ≤ WT ≤ 18 bulan</th>
                                                                                                                                <th class="dalam">WT > 18 bulan</th>
                                                                                                                            </tr>
                                                                                                                            <tr>
                                                                                                                                @for ($i = 1; $i <= 6; $i++)
                                                                                                                                    <th class="dalam">{{$i}}</th>
                                                                                                                                @endfor
                                                                                                                            </tr>
                                                                                                                        </thead>
                                                                                                                        <tbody style="background-color: #343A40;">
                                                                                                                            @php
                                                                                                                                $jml1 = 0;
                                                                                                                                $jml2 = 0;
                                                                                                                                $jml3 = 0;
                                                                                                                                $jml4 = 0;
                                                                                                                            @endphp
                                                                                                                            @foreach ($waktu_tunggu_s1 as $idx => $wts)
                                                                                                                            <tr>
                                                                                                                                <td style="text-align: center;" >TS{{$idx-4}}</td>
                                                                                                                                <td>{{$wts->total_lulus}}</td>
                                                                                                                                <td>{{$wts->total_terdeteksi}}</td>
                                                                                                                                <td>{{$wts->tunggu_kurang_6bulan}}</td>
                                                                                                                                <td>{{$wts->tunggu_antara_6_18}}</td>
                                                                                                                                <td>{{$wts->tunggu_lebih_18bulan}}</td>
                                                                                                                                @php
                                                                                                                                    $jml1 += $wts->total_terdeteksi;
                                                                                                                                    $jml2 += $wts->tunggu_kurang_6bulan;
                                                                                                                                    $jml3 += $wts->tunggu_antara_6_18;
                                                                                                                                    $jml4 += $wts->tunggu_lebih_18bulan;
                                                                                                                                @endphp
                                                                                                                            </tr>
                                                                                                                            @endforeach
                                                                                                                            <tr>
                                                                                                                                <th colspan="2" class="dalam2">Jumlah</th>
                                                                                                                                <th class="dalam2">{{$jml1}}</th>
                                                                                                                                <th class="dalam2">{{$jml2}}</th>
                                                                                                                                <th class="dalam2">{{$jml3}}</th>
                                                                                                                                <th class="dalam2">{{$jml4}}</th>
                                                                                                                            </tr>
                                                                                                                        </tbody>
                                                                                                                    </table> 
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                <div id="kesesuaian" class="tab-pane fade">
                                                                                        <div class="table-responsive-md">
                                                                                            <table class="table table-bordered">
                                                                                                <thead class="head1">
                                                                                                    <tr>
                                                                                                        <th rowspan="2" class="dalam2" style="vertical-align: middle">Tahun Lulus</th>
                                                                                                        <th rowspan="2" class="dalam2" style="vertical-align: middle">Jumlah Lulusan</th>
                                                                                                        <th rowspan="2" class="dalam2" style="vertical-align: middle">Jumlah Lulusan yang Terlacak</th>
                                                                                                        <th colspan="3" class="dalam2">Jumlah lulusan Terlacak dengan Tingkat Keseuaian Bidang Kerja</th>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <th class="dalam">Rendah</th>
                                                                                                        <th class="dalam">Sedang</th>
                                                                                                        <th class="dalam">Tinggi</th>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                    @for ($i = 1; $i <= 6; $i++)
                                                                                                        <th class="dalam">{{$i}}</th>
                                                                                                    @endfor
                                                                                                    </tr>
                                                                                                </thead>
                                                                                                <tbody style="background-color: #343A40;">
                                                                                                    @php
                                                                                                        $sum_tot = 0;
                                                                                                        $sum_ren = 0;
                                                                                                        $sum_sed = 0;
                                                                                                        $sum_tin = 0;   
                                                                                                    @endphp
                                                                                                    @foreach ($kesesuaian_lulus as $idx => $keslus)
                                                                                                    <tr>
                                                                                                        <td style="text-align: center;" class="dalam4">TS{{$idx-4}}</td>
                                                                                                        <td>{{$keslus->total_lulus}}</td>
                                                                                                        <td>{{$keslus->total_terdeteksi}}</td>
                                                                                                        <td class="tabel3">{{$keslus->rendah}}</td>
                                                                                                        <td>{{$keslus->sedang}}</td>
                                                                                                        <td>{{$keslus->tinggi}}</td>
                                                                                                        @php
                                                                                                            $sum_tot += $keslus->total_terdeteksi;
                                                                                                            $sum_ren += $keslus->rendah;
                                                                                                            $sum_sed += $keslus->sedang;
                                                                                                            $sum_tin += $keslus->tinggi; 
                                                                                                        @endphp
                                                                                                    </tr>
                                                                                                    @if($keslus->tahun_lulus == '2021')
                                                                                                    <tr>
                                                                                                        <th colspan="2" class="dalam2">Jumlah</th>
                                                                                                        <th class="dalam2">{{$sum_tot}}</th>
                                                                                                        <th class="dalam2">{{$sum_ren}}</th>
                                                                                                        <th class="dalam2">{{$sum_sed}}</th>
                                                                                                        <th class="dalam2">{{$sum_tin}}</th>
                                                                                                    </tr>
                                                                                                    @endif
                                                                                                    @endforeach
                                                                                                </tbody>
                                                                                            </table>
                                                                                        </div>
                                                                                    </div>
                                                                                <div id="tempat_kerja" class="tab-pane fade">
                                                                                        <div class="table-responsive-md">
                                                                                            <table class="table table-bordered">
                                                                                                <thead class="head1">
                                                                                                    <tr>
                                                                                                        <th rowspan="2" class="dalam2" style="vertical-align: middle">Tahun Lulus</th>
                                                                                                        <th rowspan="2" class="dalam2" style="vertical-align: middle">Jumlah Lulusan</th>
                                                                                                        <th rowspan="2" class="dalam2" style="vertical-align: middle">Jumlah Lulusan yang Terlacak</th>
                                                                                                        <th colspan="3" class="dalam2">Jumlah Lulusan Terlacak yang Bekerja Berdasarkan Tingkat/Ukuran Tempat Kerja/Berwirausaha</th>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <th class="dalam1" style="vertical-align: middle">Lokal/ Wilayah/ Berwirausaha tidak Berbadan Hukum</th>
                                                                                                        <th class="dalam1" style="vertical-align: middle">Nasional/ Berwirausaha Berbadan Hukum</th>
                                                                                                        <th class="dalam1" style="vertical-align: middle">Multinasiona/ Internasional</th>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        @for ($i = 1; $i <= 6; $i++)
                                                                                                            <th class="dalam">{{$i}}</th>
                                                                                                        @endfor
                                                                                                    </tr>
                                                                                                </thead>
                                                                                                <tbody style="background-color: #343A40;">
                                                                                                    @php
                                                                                                        $sum_tot = 0;
                                                                                                        $sum_ter = 0;
                                                                                                        $sum_lok = 0;
                                                                                                        $sum_nas = 0;
                                                                                                        $sum_mul = 0;   
                                                                                                    @endphp
                                                                                                    @foreach ($tpt_kerja_lulus as $idx => $tkl)
                                                                                                    <tr>
                                                                                                        <th class="dalam">TS{{$idx-4}}</th>
                                                                                                        <td>{{$tkl->total_lulus}}</td>
                                                                                                        <td>{{$tkl->total_terdeteksi}}</td>
                                                                                                        <td>{{$tkl->Regional}}</td>
                                                                                                        <td>{{$tkl->Nasional}}</td>
                                                                                                        <td>{{$tkl->Internasional}}</td>
                                                                                                        @php
                                                                                                            $sum_ter += $tkl->total_terdeteksi;
                                                                                                            $sum_tot += $tkl->total_lulus;
                                                                                                            $sum_lok += $tkl->Regional;
                                                                                                            $sum_nas += $tkl->Nasional;
                                                                                                            $sum_mul += $tkl->Internasional; 
                                                                                                        @endphp
                                                                                                    </tr>
                                                                                                    @if($tkl->tahun_lulus == '2021')
                                                                                                    <tr>
                                                                                                        <th class="dalam2">Jumlah</th>
                                                                                                        <th class="dalam2">{{$sum_tot}}</th>
                                                                                                        <th class="dalam2">{{$sum_ter}}</th>
                                                                                                        <th class="dalam2">{{$sum_lok}}</th>
                                                                                                        <th class="dalam2">{{$sum_nas}}</th>
                                                                                                        <th class="dalam2">{{$sum_mul}}</th>
                                                                                                    </tr>
                                                                                                    @endif
                                                                                                    @endforeach
                                                                                                </tbody>
                                                                                            </table>
                                                                                        </div>
                                                                                    </div>
                                                                                <div id="ref_kepuasan_lulusan" class="tab-pane fade">
                                                                                        <div class="table-responsive-md">
                                                                                            <table class="table table-bordered">
                                                                                                <thead class="head1">
                                                                                                    <tr>
                                                                                                        <th class="dalam2">Tahun Lulus</th>
                                                                                                        <th class="dalam2">Jumlah Lulusan</th>
                                                                                                        <th class="dalam2">Jumlah Tanggapan Kepuasan Pengguna yang Terlacak</th>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        @for ($i = 1; $i <= 3; $i++)
                                                                                                            <th class="dalam">{{$i}}</th>
                                                                                                        @endfor
                                                                                                    </tr>
                                                                                                </thead>
                                                                                                <tbody style="background-color: #343A40;">
                                                                                                    <tr>
                                                                                                        <td class="dalam4">TS-4</td>
                                                                                                        <td></td>
                                                                                                        <td></td>
                                                                                                    </tr>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <td class="dalam4">TS-3</td>
                                                                                                        <td></td>
                                                                                                        <td></td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <td class="dalam4">TS-2</td>
                                                                                                        <td></td>
                                                                                                        <td></td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <th class="dalam2">Jumlah</th>
                                                                                                        <th class="dalam2">0</th>
                                                                                                        <th class="dalam2">0</th>
                                                                                                    </tr>
                                                                                                </tbody>
                                                                                            </table>
                                                                                        </div>
                                                                                    </div>
                                                                                <div id="kepuasan_lulusan" class="tab-pane fade">
                                                                                        <div class="table-responsive-md">
                                                                                            <table class="table table-bordered">
                                                                                                <thead class="head1">
                                                                                                <tr>
                                                                                                    <th rowspan="2" class="dalam2">No</th>
                                                                                                    <th rowspan="2" class="dalam2">Jenis Kemampuan</th>
                                                                                                    <th colspan="4" class="dalam2">Tingkat Kepuasan Pengguna
                                                                                                        (%)</th>
                                                                                                    <th rowspan="2" class="dalam2">Rencana Tindak Lanjut oleh UPPS/PS</th>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <th class="dalam">Sangat Baik</th>
                                                                                                    <th class="dalam">Baik</th>
                                                                                                    <th class="dalam">Cukup</th>
                                                                                                    <th class="dalam">Kurang</th>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                @for ($i = 1; $i <= 7; $i++)
                                                                                                    <th class="dalam">{{$i}}</th>
                                                                                                @endfor
                                                                                                </tr>
                                                                                            </thead>
                                                                                            <tbody style="background-color: #343A40;">
                                                                                                <tr>
                                                                                                    <th class="dalam">1</th>
                                                                                                    <td></td>
                                                                                                    <td></td>
                                                                                                    <td></td>
                                                                                                    <td></td>
                                                                                                    <td></td>
                                                                                                    <td></td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <th colspan="2" class="dalam2">Jumlah</th>
                                                                                                    <th class="dalam2"></th>
                                                                                                    <th class="dalam2"></th>
                                                                                                    <th class="dalam2"></th>
                                                                                                    <th class="dalam2"></th>
                                                                                                    <th class="dalam2"></th>  
                                                                                                </tr>
                                                                                                </tbody>
                                                                                            </table>
                                                                                        </div>
                                                                                    </div>
                                                                                <div id="publikasi_ilmiah" class="tab-pane fade">
                                                                                        <div class="table-responsive-md">
                                                                                            <table class="table table-bordered">
                                                                                                <thead class="head1">
                                                                                                    <tr>
                                                                                                        <th class="dalam2">No</th>
                                                                                                        <th class="dalam2">Jenis Publikasi</th>
                                                                                                        <th class="dalam2">Jumlah Judul</th>
                                                                                                        <th class="dalam2">Jumlah</th>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                    @for ($i = 1; $i <= 4; $i++)
                                                                                                        <th class="dalam">{{$i}}</th>
                                                                                                    @endfor
                                                                                                    </tr>
                                                                                                </thead>
                                                                                                <tbody style="background-color: #343A40;">
                                                                                                    <tr>
                                                                                                        <th class="dalam">1</th>
                                                                                                        <td>Jurnal penelitian tidak terakreditasi</td>
                                                                                                        <td>{{$pims[0]->jumlah+$pims[1]->jumlah+$pims[2]->jumlah}}</td>
                                                                                                        <td class="dalam4">{{$pims[0]->jumlah+$pims[1]->jumlah+$pims[2]->jumlah}}</td>
                                                                                                    </tr>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <th class="dalam">2</th>
                                                                                                        <td>Jurnal penelitian nasional terakreditasi</td>
                                                                                                        <td>{{$pims[3]->jumlah+$pims[4]->jumlah+$pims[5]->jumlah}}</td>
                                                                                                        <td class="dalam4">{{$pims[3]->jumlah+$pims[4]->jumlah+$pims[5]->jumlah}}</td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <th class="dalam">3</th>
                                                                                                        <td>Jurnal penelitian internasional</td>
                                                                                                        <td>{{$pims[6]->jumlah+$pims[7]->jumlah}}</td>
                                                                                                        <td class="dalam4">{{$pims[6]->jumlah+$pims[7]->jumlah}}</td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <th class="dalam">4</th>
                                                                                                        <td>Jurnal penelitian internasional bereputasi</td>
                                                                                                        <td>{{$pims[8]->jumlah+$pims[9]->jumlah}}</td>
                                                                                                        <td class="dalam4">0</td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <th class="dalam">5</th>
                                                                                                        <td>Seminar wilayah/lokal/perguruan tinggi</td>
                                                                                                        <td>0</td>
                                                                                                        <td class="dalam4">0</td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <th class="dalam">6</th>
                                                                                                        <td>Seminar nasional</td>
                                                                                                        <td>{{$pims[14]->jumlah+$pims[15]->jumlah+$pims[16]->jumlah}}</td>
                                                                                                        <td class="dalam4">{{$pims[14]->jumlah+$pims[15]->jumlah+$pims[16]->jumlah}}</td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <th class="dalam">7</th>
                                                                                                        <td>Seminar internasional</td>
                                                                                                        <td>{{$pims[17]->jumlah+$pims[18]->jumlah+$pims[19]->jumlah+$pims[20]->jumlah}}</td>
                                                                                                        <td class="dalam4">{{$pims[17]->jumlah+$pims[18]->jumlah+$pims[19]->jumlah+$pims[20]->jumlah}}</td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <th class="dalam">8</th>
                                                                                                        <td>Tulisan di media massa wilayah</td>
                                                                                                        <td>{{$pims[10]->jumlah+$pims[11]->jumlah+$pims[12]->jumlah+$pims[13]->jumlah}}</td>
                                                                                                        <td class="dalam4">{{$pims[10]->jumlah+$pims[11]->jumlah+$pims[12]->jumlah+$pims[13]->jumlah}}</td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <th class="dalam">9</th>
                                                                                                        <td>Tulisan di media massa nasional</td>
                                                                                                        <td>{{$pims[21]->jumlah+$pims[22]->jumlah+$pims[23]->jumlah}}</td>
                                                                                                        <td class="dalam4">{{$pims[21]->jumlah+$pims[22]->jumlah+$pims[23]->jumlah}}</td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <th class="dalam">10</th>
                                                                                                        <td>Tulisan di media massa internasional</td>
                                                                                                        <td>0</td>
                                                                                                        <td class="dalam4">0</td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <th colspan="2" class="dalam2">Jumlah</th>
                                                                                                        <th class="dalam2">169</th>
                                                                                                        <th class="dalam2">169</th>
                                                                                                    </tr>
                                                                                                </tbody>
                                                                                            </table>
                                                                                        </div>
                                                                                    </div>
                                                                                <div id="presentasi_ilmiah" class="tab-pane fade">
                                                                                    <div class="table-responsive-md">
                                                                                            <table class="table table-bordered">
                                                                                                <thead class="head1">
                                                                                                    <tr>
                                                                                                        <th class="dalam2">No</th>
                                                                                                        <th class="dalam2">Jenis Publikasi</th>
                                                                                                        <th class="dalam2">Jumlah Judul</th>
                                                                                                        <th class="dalam2">Jumlah</th>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                    @for ($i = 1; $i <= 4; $i++)
                                                                                                        <th class="dalam">{{$i}}</th>
                                                                                                    @endfor
                                                                                                    </tr>
                                                                                                </thead>
                                                                                                <tbody style="background-color: #343A40;">
                                                                                                    <tr>
                                                                                                        <th class="dalam">1</th>
                                                                                                        <td>Jurnal penelitian tidak terakreditasi</td>
                                                                                                        <td>{{$pims[0]->jumlah+$pims[1]->jumlah+$pims[2]->jumlah}}</td>
                                                                                                        <td class="dalam4">{{$pims[0]->jumlah+$pims[1]->jumlah+$pims[2]->jumlah}}</td>
                                                                                                    </tr>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <th class="dalam">2</th>
                                                                                                        <td>Jurnal penelitian nasional terakreditasi</td>
                                                                                                        <td>{{$pims[3]->jumlah+$pims[4]->jumlah+$pims[5]->jumlah}}</td>
                                                                                                        <td class="dalam4">{{$pims[3]->jumlah+$pims[4]->jumlah+$pims[5]->jumlah}}</td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <th class="dalam">3</th>
                                                                                                        <td>Jurnal penelitian internasional</td>
                                                                                                        <td>{{$pims[6]->jumlah+$pims[7]->jumlah}}</td>
                                                                                                        <td class="dalam4">{{$pims[6]->jumlah+$pims[7]->jumlah}}</td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <th class="dalam">4</th>
                                                                                                        <td>Jurnal penelitian internasional bereputasi</td>
                                                                                                        <td>{{$pims[8]->jumlah+$pims[9]->jumlah}}</td>
                                                                                                        <td class="dalam4">0</td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <th class="dalam">5</th>
                                                                                                        <td>Seminar wilayah/lokal/perguruan tinggi</td>
                                                                                                        <td>0</td>
                                                                                                        <td class="dalam4">0</td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <th class="dalam">6</th>
                                                                                                        <td>Seminar nasional</td>
                                                                                                        <td>{{$pims[14]->jumlah+$pims[15]->jumlah+$pims[16]->jumlah}}</td>
                                                                                                        <td class="dalam4">{{$pims[14]->jumlah+$pims[15]->jumlah+$pims[16]->jumlah}}</td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <th class="dalam">7</th>
                                                                                                        <td>Seminar internasional</td>
                                                                                                        <td>{{$pims[17]->jumlah+$pims[18]->jumlah+$pims[19]->jumlah+$pims[20]->jumlah}}</td>
                                                                                                        <td class="dalam4">{{$pims[17]->jumlah+$pims[18]->jumlah+$pims[19]->jumlah+$pims[20]->jumlah}}</td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <th class="dalam">8</th>
                                                                                                        <td>Pagelaran/pameran/presentasi dalam forum di tingkat wilayah</td>
                                                                                                        <td>{{$pims[10]->jumlah+$pims[11]->jumlah+$pims[12]->jumlah+$pims[13]->jumlah}}</td>
                                                                                                        <td class="dalam4">{{$pims[10]->jumlah+$pims[11]->jumlah+$pims[12]->jumlah+$pims[13]->jumlah}}</td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <th class="dalam">9</th>
                                                                                                        <td>Pagelaran/pameran/presentasi dalam forum di tingkat nasional</td>
                                                                                                        <td>{{$pims[21]->jumlah+$pims[22]->jumlah+$pims[23]->jumlah}}</td>
                                                                                                        <td class="dalam4">{{$pims[21]->jumlah+$pims[22]->jumlah+$pims[23]->jumlah}}</td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <th class="dalam">10</th>
                                                                                                        <td>Pagelaran/pameran/presentasi dalam forum di tingkat internasional</td>
                                                                                                        <td>0</td>
                                                                                                        <td class="dalam4">0</td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <th colspan="2" class="dalam2">Jumlah</th>
                                                                                                        <th class="dalam2">169</th>
                                                                                                        <th class="dalam2">169</th>
                                                                                                    </tr>
                                                                                                </tbody>
                                                                                            </table>
                                                                                        </div>
                                                                                    </div>
                                                                                <div id="karya_ilmiah" class="tab-pane fade">
                                                                                        <div class="table-responsive-md">
                                                                                            <table class="table table-bordered">
                                                                                                <thead class="head1">
                                                                                                    <tr>
                                                                                                        <th class="dalam2">No</th>
                                                                                                        <th class="dalam2">Nama Mahasiswa</th>
                                                                                                        <th class="dalam2">Judul Artikel yang Disitasi (Jurnal, Volume, Tahun, Nomor, Halaman) </th>
                                                                                                        <th class="dalam2">Jumlah Sitasi</th>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                    @for ($i = 1; $i <= 4; $i++)
                                                                                                        <th class="dalam">{{$i}}</th>
                                                                                                    @endfor
                                                                                                    </tr>
                                                                                                </thead>
                                                                                                <tbody style="background-color: #343A40;">
                                                                                                    @foreach ($karya_ilmiah_disitasi_mhs as $idx => $kids)
                                                                                                    <tr>
                                                                                                        <th class="dalam">{{$idx+1}}</th>
                                                                                                        <td>{{$kids->nm_pd}}</td>
                                                                                                        <td>{{$kids->judul}}</td>
                                                                                                        <td>{{rand (1,100)}}</td>  
                                                                                                    </tr>
                                                                                                    @endforeach
                                                                                                </tbody>
                                                                                            </table>
                                                                                        </div>
                                                                                    </div>
                                                                                <div id="jasa_mahasiswa" class="tab-pane fade">
                                                                                        <div class="table-responsive-md">
                                                                                            <table class="table table-bordered">
                                                                                                <thead class="head1">
                                                                                                    <tr>
                                                                                                        <th class="dalam2">No</th>
                                                                                                        <th class="dalam2">Nama Mahasiswa</th>
                                                                                                        <th class="dalam2">Nama Produk/Jasa </th>
                                                                                                        <th class="dalam2">Deskripsi Produk/Jasa</th>
                                                                                                        <th class="dalam2">Bukti</th>
                                                                                                        <th class="dalam2">Tahun (YYYY)</th>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                    @for ($i = 1; $i <= 6; $i++)
                                                                                                        <th class="dalam">{{$i}}</th>
                                                                                                    @endfor
                                                                                                    </tr>
                                                                                                </thead>
                                                                                                <tbody style="background-color: #343A40;">
                                                                                                    <tr>
                                                                                                        <th class="dalam">1</th>
                                                                                                        <td></td>
                                                                                                        <td></td>
                                                                                                        <td></td>
                                                                                                        <td></td>
                                                                                                        <td></td> 
                                                                                                    </tr>
                                                                                                </tbody>
                                                                                            </table>
                                                                                        </div>
                                                                                    </div>
                                                                                <div id="hki_paten" class="tab-pane fade">
                                                                                        <div class="table-responsive-md">
                                                                                            <table class="table table-bordered">
                                                                                                <thead class="head1">
                                                                                                    <tr>
                                                                                                        <th class="dalam2">No</th>
                                                                                                        <th class="dalam2">Luaran Penelitian dan PkM</th>
                                                                                                        <th class="dalam2">Tahun (YYYY)</th>
                                                                                                        <th class="dalam2">Keterangan </th>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                    @for ($i = 1; $i <= 4; $i++)
                                                                                                        <th class="dalam">{{$i}}</th>
                                                                                                    @endfor
                                                                                                    </tr>
                                                                                                </thead>
                                                                                                <tbody style="background-color: #343A40;">
                                                                                                    <tr>
                                                                                                        <th class="dalam">I</th>
                                                                                                        <th style="text-align: left;" colspan="3">HKI: a) Paten, b) Paten Sederhana</th>  
                                                                                                    </tr>
                                                                                                    @php
                                                                                                        $idx=1;
                                                                                                    @endphp
                                                                                                    @if (($paten_mhs->contains('id_sms', $detail_prodi->id_prodi)))
                                                                                                        @foreach ($paten_mhs as $pm)
                                                                                                            @if ($pm->id_sms == $detail_prodi->id_prodi)
                                                                                                            <tr>
                                                                                                                <th class="dalam">{{$idx}}</th>
                                                                                                                <td>{{$pm->judul}}</td>
                                                                                                                <td>{{$pm->tahun}}</td>
                                                                                                                @if ($pm->tahun == '2022' || $pm->tahun == '2019')
                                                                                                                    @php
                                                                                                                        $ket = 'Awardee'
                                                                                                                    @endphp
                                                                                                                @else
                                                                                                                    @php
                                                                                                                        $ket = 'Online'
                                                                                                                @endphp
                                                                                                                
                                                                                                                @endif
                                                                                                                <td>{{$ket}}</td> 
                                                                                                                @php
                                                                                                                    $idx++;
                                                                                                                @endphp
                                                                                                            </tr>
                                                                                                            @endif
                                                                                                        @endforeach
                                                                                                    @else
                                                                                                        @foreach ($paten_mhs as $pm)
                                                                                                            @if($pm->id_sms === null)
                                                                                                            <tr>
                                                                                                                <th class="dalam">{{$idx}}</th>
                                                                                                                <td>{{$pm->judul}}</td>
                                                                                                                <td>{{$pm->tahun}}</td>
                                                                                                                @if ($pm->tahun == '2022' || $pm->tahun == '2019')
                                                                                                                    @php
                                                                                                                        $ket = 'Awardee'
                                                                                                                    @endphp
                                                                                                                @else
                                                                                                                    @php
                                                                                                                        $ket = 'Online'
                                                                                                                @endphp
                                                                                                                
                                                                                                                @endif
                                                                                                                <td>{{$ket}}</td> 
                                                                                                                @php
                                                                                                                    $idx++;
                                                                                                                @endphp
                                                                                                            </tr>
                                                                                                            @endif
                                                                                                        @endforeach
                                                                                                    @endif
                                                                                                </tbody>
                                                                                            </table>
                                                                                        </div>
                                                                                    </div>
                                                                                <div id="hki_cipta" class="tab-pane fade">
                                                                                    <div class="table-responsive-md">
                                                                                        <table class="table table-bordered">
                                                                                            <thead class="head1">
                                                                                                <tr>
                                                                                                    <th class="dalam2">No</th>
                                                                                                    <th class="dalam2">Luaran Penelitian dan PkM</th>
                                                                                                    <th class="dalam2">Tahun (YYYY)</th>
                                                                                                    <th class="dalam2">Keterangan </th>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                @for ($i = 1; $i <= 4; $i++)
                                                                                                    <th class="dalam">{{$i}}</th>
                                                                                                @endfor
                                                                                                </tr>
                                                                                            </thead>
                                                                                            <tbody style="background-color: #343A40;">
                                                                                                <tr>
                                                                                                    <th class="dalam">II</th>
                                                                                                    <th style="text-align: left;" colspan="3">HKI: a) Hak Cipta, b) Desain Produk Industri,  c) Perlindungan Varietas Tanaman (Sertifikat Perlindungan Varietas Tanaman, Sertifikat Pelepasan Varietas, Sertifikat Pendaftaran Varietas), d) Desain Tata Letak Sirkuit Terpadu, e) dll.)</th>  
                                                                                                </tr>
                                                                                                @foreach ($hak_cipta_mhs as $idx => $hki_mhs)
                                                                                                <tr>
                                                                                                    <th class="dalam">{{$idx+1}}</th>
                                                                                                    <td>{{$hki_mhs->judul}}</td>
                                                                                                    <td>{{$hki_mhs->tahun}}</td>
                                                                                                    <td>-</td> 
                                                                                                </tr>
                                                                                                @endforeach
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </div>
                                                                                </div>
                                                                                <div id="teknologi_tepat_guna" class="tab-pane fade">
                                                                                        <div class="table-responsive-md">
                                                                                            <table class="table table-bordered">
                                                                                                <thead class="head1">
                                                                                                    <tr>
                                                                                                        <th class="dalam2">No</th>
                                                                                                        <th class="dalam2">Luaran Penelitian dan PkM</th>
                                                                                                        <th class="dalam2">Tahun (YYYY)</th>
                                                                                                        <th class="dalam2">Keterangan </th>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                    @for ($i = 1; $i <= 4; $i++)
                                                                                                        <th class="dalam">{{$i}}</th>
                                                                                                    @endfor
                                                                                                    </tr>
                                                                                                </thead>
                                                                                                <tbody style="background-color: #343A40;">
                                                                                                    <tr>
                                                                                                        <th class="dalam">III</th>
                                                                                                        <th style="text-align: left;" colspan="3">Teknologi Tepat Guna, Produk (Produk Terstandarisasi, Produk Tersertifikasi), Karya Seni, Rekayasa Sosial</th>  
                                                                                                    </tr>
                                                                                                    @foreach ($teknologi_karya_mhs as $no => $tkm)
                                                                                                    <tr>
                                                                                                        <th class="dalam">{{$no+1}}</th>
                                                                                                        <td>{{$tkm->judul}}</td>
                                                                                                        <td>{{$tkm->tahun}}</td>
                                                                                                        <td>-</td> 
                                                                                                    </tr>
                                                                                                    @endforeach
                                                                                                </tbody>
                                                                                            </table>
                                                                                        </div>
                                                                                    </div>
                                                                                <div id="book_chapter" class="tab-pane fade">
                                                                                        <div class="table-responsive-md">
                                                                                            <table class="table table-bordered">
                                                                                                <thead class="head1">
                                                                                                    <tr>
                                                                                                        <th class="dalam2">No</th>
                                                                                                        <th class="dalam2">Luaran Penelitian dan PkM</th>
                                                                                                        <th class="dalam2">Tahun (YYYY)</th>
                                                                                                        <th class="dalam2">Keterangan </th>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                    @for ($i = 1; $i <= 4; $i++)
                                                                                                        <th class="dalam">{{$i}}</th>
                                                                                                    @endfor
                                                                                                    </tr>
                                                                                                </thead>
                                                                                                <tbody style="background-color: #343A40;">
                                                                                                    <tr>
                                                                                                        <th class="dalam">IV</th>
                                                                                                        <th style="text-align: left;" colspan="3">Buku ber-ISBN, Book Chapter</th>  
                                                                                                    </tr>
                                                                                                    @foreach ($luaran_buku_mhs as $idx => $bookm)
                                                                                                    <tr>
                                                                                                        <th class="dalam">{{$idx+1}}</th>
                                                                                                        <td>{{$bookm->judul}}</td>
                                                                                                        <td>{{$bookm->tahun}}</td>
                                                                                                        <td></td> 
                                                                                                    </tr>
                                                                                                    @endforeach
                                                                                                </tbody>
                                                                                            </table>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                
                                        {{-- <div id="kriteria6" class="tab-pane fade">
                                            <div class="card-body">
                                                <h6 style="float: right;margin-top:30px;">Data Tersebut Dibuat Berdasarkan BAN-PT</h6>
                                                <div class="container">
                                                    <div class="row">
                                                        <div class="col-lg-3">
                                                            <div class="card" style="background-color: #ecf0f1;width:15rem;height:10rem;">
                                                                <h4 class="card-title" style="margin-left:10px;color:#000000;font-weight:bold;">Penelitian DTPS</h4>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div> --}}
                                    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz" crossorigin="anonymous"></script>
                                    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossorigin="anonymous"></script>
                                    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.min.js" integrity="sha384-fbbOQedDUMZZ5KreZpsbe1LCZPVmfTnH7ois6mU1QK+m14rQ1l2bGBq41eYeM/fS" crossorigin="anonymous"></script>
                                </div>
                            </div>
                                        
                                                {{-- {{-- @forelse ($kriteria as $judul => $value)
                                                    <div class="tab-pane fade{{ $judul == 'kriteria_1' ? ' show active' : '' }}"
                                                        id="tabs-{{ strtolower(Str::replace('_', '-', $judul)) }}"
                                                        role="tabpanel"
                                                        aria-labelledby="tabs-{{ strtolower(Str::replace('_', '-', $judul)) }}-tab">

                                                        @forelse ($value as $kriteria => $isi)
                                                            <div class="card card-primary" style="margin-bottom: 0px;">
                                                                <div class="card-header bg-primary">
                                                                    <h3 class="card-title font-weight-bold">{{ $kriteria }}
                                                                    </h3>
                                                                </div> --}}
                                                                {{-- <div class="card-body">
                                                                    <div class="row">
                                                                        <div class="col-5 col-sm-2"> --}}
                                                                            {{-- <div class="nav flex-column nav-tabs h-100"
                                                                                id="vert-tabs-tab" role="tablist"
                                                                                aria-orientation="vertical">
                                                                                
                                                                                @foreach (array_keys($isi) as $urutan => $value)
                                                                                    <a class="nav-link{{ $urutan == 0 ? ' active' : '' }}"
                                                                                        id="vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}-tab"
                                                                                        data-toggle="pill"
                                                                                        href="#vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}"
                                                                                        role="tab"
                                                                                        aria-controls="vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}"
                                                                                        aria-selected="true">{{ $value }}</a>
                                                                                @endforeach
                                                                            </div>
                                                                        </div>

                                                                        <div class="col-7 col-sm-9">
                                                                            <div class="tab-content"
                                                                                id="vert-tabs-tabContent">
                                                                                @foreach (array_keys($isi) as $urutan => $value)
                                                                                    <div class="tab-pane fade{{ $urutan == 0 ? ' show active' : '' }}"
                                                                                        id="vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}"
                                                                                        role="tabpanel"
                                                                                        aria-labelledby="vert-tabs-{{ strtolower(Str::replace('_', '-', $judul)) . '-' . $urutan }}-tab"
                                                                                        style="text-align: justify;">
                                                                                        @if (is_array($isi[$value]))
                                                                                            @foreach (array_keys($isi[$value]) as $judulChild => $valueChild)
                                                                                                <div id="accordion">
                                                                                                    <div class="card">
                                                                                                        <div class="card-header"
                                                                                                            id="headingOne">
                                                                                                            <h3
                                                                                                                class="mb-0">
                                                                                                                <button
                                                                                                                    class="btn"
                                                                                                                    data-toggle="collapse"
                                                                                                                    data-target="#collapse-{{ strtolower(Str::replace(' ', '-', $valueChild)) . '-' . $judulChild }}"
                                                                                                                    aria-expanded="true"
                                                                                                                    aria-controls="collapse-{{ strtolower(Str::replace(' ', '-', $valueChild)) . '-' . $judulChild }}"
                                                                                                                    style="color: white;">
                                                                                                                    {{ $judulChild + 1 }}.
                                                                                                                    {{ $valueChild }}
                                                                                                                </button>
                                                                                                            </h3>
                                                                                                        </div>

                                                                                                        <div id="collapse-{{ strtolower(Str::replace(' ', '-', $valueChild)) . '-' . $judulChild }}"
                                                                                                            class="collapse"
                                                                                                            aria-labelledby="heading-{{ strtolower(Str::replace(' ', '-', $valueChild)) . '-' . $judulChild }}"
                                                                                                            data-parent="#accordion">
                                                                                                            <div
                                                                                                                class="card-body">
                                                                                                                @if (View::exists($isi[$value][$valueChild]))
                                                                                                                    @include(
                                                                                                                        $isi[$value][
                                                                                                                            $valueChild
                                                                                                                        ]
                                                                                                                    )
                                                                                                                @else
                                                                                                                    {{ $isi[$value][$valueChild] }}
                                                                                                                @endif
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            @endforeach
                                                                                        @else
                                                                                            {{ $isi[$value] }}
                                                                                        @endif
                                                                                    </div>
                                                                                @endforeach
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        @empty
                                                        @endforelse
                                                    </div>

                                                @empty
                                                @endforelse --}}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    @endsection

    @push('js')
    <script>
        $(document).ready(function() {
            let detail_akred = {!! $detail_akred !!};
            let rank_akred = {!! $rank_akred !!};
            let tahun_akred = [];
            let akreditasi = [];

            $.each(detail_akred, function(i, k) {
                tahun_akred.push(i);
                akreditasi.push(k[1]);
            });

            let count_object = Object.keys(akreditasi).length;
            if (count_object > 1) {
                var chartType = 'line';
            } else {
                var chartType = 'column';
            }


            let chart = new Highcharts.Chart({
                chart: {
                    renderTo: 'detail_akreditasi_prodi',
                    type: chartType
                },
                title: {
                    text: 'Sebaran Akreditasi Pertahun'
                },
                xAxis: {
                    categories: tahun_akred,
                    gridLineWidth: 1,
                    crosshair: true,
                    title: {
                        text: 'Tahun'
                    }
                },
                yAxis: {
                    categories: rank_akred,
                    title: {
                        text: 'Akreditas'
                    }
                },
                plotOptions: {
                    column: {
                        pointPadding: 0.2,
                        borderWidth: 0
                    }
                },
                legend: {
                    itemWidth: 220
                },
                series: [{
                    name: 'Akreditasi',
                    data: akreditasi
                }],
                credits: {
                    enabled: false
                }
            });
        });
        //kriteria 1 js
            let sidebar1 = document.getElementById('sidebar1');
            let btn1 = document.getElementById('btn1');
            let btn2 = document.getElementById('btn2');
            let main = document.getElementById('main');
            // let pendidikan = document.getElementById('tabel_pendidikan');
            // let penelitian = document.getElementById('tabel_penelitian');
            // let pengabdian = document.getElementById('tabel_pengabdian');
        
            //kriteria 2 js
            let sidebar2 = document.getElementById('sidebar2');
            let btn3 = document.getElementById('btn3');
            let btn4 = document.getElementById('btn4');
            let main2 = document.getElementById('main2');
            // let baru = document.getElementById('tabel_baru')
            // let asing = document.getElementById('tabel_asing')
            

            //kriteria 3 js
            let sidebar3 = document.getElementById('sidebar3');
            let btn5 = document.getElementById('btn5');
            let btn6 = document.getElementById('btn6');
            let main3 = document.getElementById('main3');

            //kriteria 4 js
            let sidebar4 = document.getElementById('sidebar4');
            let btn7 = document.getElementById('btn7');
            let btn8 = document.getElementById('btn8');
            let main4 = document.getElementById('main4');

            //kriteria 5 js
            let sidebar5 = document.getElementById('sidebar5');
            let btn9 = document.getElementById('btn9');
            let btn10 = document.getElementById('btn10');
            let main5 = document.getElementById('main5');

            //kriteria 6 js
            let sidebar6 = document.getElementById('sidebar6');
            let btn11 = document.getElementById('btn11');
            let btn12 = document.getElementById('btn12');
            let main6 = document.getElementById('main6');
            
            //kriteria 7 js
            let sidebar7 = document.getElementById('sidebar7');
            let btn13 = document.getElementById('btn13');
            let btn14 = document.getElementById('btn14');
            let main7 = document.getElementById('main7');

            //kriteria 8 js
            let sidebar8 = document.getElementById('sidebar8');
            let btn15 = document.getElementById('btn15');
            let btn16 = document.getElementById('btn16');
            let main8 = document.getElementById('main8');
            // let sidebar6 = document.getElementById('sidebar8');
            // let btn15 = document.getElementById('btn15');
            // let btn16 = document.getElementById('btn16');

                                        
            function button_open1() {
            main.style.marginLeft = '10px';
            sidebar1.style.width = '250px';
            btn1.style.display = 'none';
            // pendidikan.style.display = 'block';
            // penelitian.style.display = 'block';
            // pengabdian.style.display = 'block';
            }

            function button_close1() {
            main.style.marginLeft = '0%';
            sidebar1.style.width = '0%';
            btn1.style.display = 'block';

            // pendidikan.style.display = 'none';
            // penelitian.style.display = 'none';
            // pengabdian.style.display = 'none';
            }
            
            function button_open2() {
                main2.style.marginLeft = '10px';
                sidebar2.style.width = '250px';
                btn3.style.display = 'none';
                // baru.style.display = 'block';
                // asing.style.display = 'block';
            }

            function button_close2() {
                main2.style.marginLeft = '0%';
                sidebar2.style.width = '0%';
                btn3.style.display = 'block';
                // baru.style.display = 'none';
                // asing.style.display = 'none';
            }
            function button_open3() {
                main3.style.marginLeft = '10px';
                sidebar3.style.width = '250px';
                btn5.style.display = 'none';
            }

            function button_close3() {
                main3.style.marginLeft = '0%';
                sidebar3.style.width = '0%';
                btn5.style.display = 'block';
            }

            function button_open4() {
                main4.style.marginLeft = '10px';
                sidebar4.style.width = '300px';
                btn7.style.display = 'none';
            }

            function button_close4() {
                main4.style.marginLeft = '0%';
                sidebar4.style.width = '0%';
                btn7.style.display = 'block';
            }

            function button_open5() {
                main5.style.marginLeft = '10px';
                sidebar5.style.width = '250px';
                btn9.style.display = 'none';
            }

            function button_close5() {
                main5.style.marginLeft = '0%';
                sidebar5.style.width = '0%';
                btn9.style.display = 'block';
            }
            function button_open6() {
                main6.style.marginLeft = '10px';
                sidebar6.style.width = '250px';
                btn11.style.display = 'none';
            }

            function button_close6() {
                main6.style.marginLeft = '0%';
                sidebar6.style.width = '0%';
                btn11.style.display = 'block';
            }
            function button_open7() {
                main7.style.marginLeft = '10px';
                sidebar7.style.width = '250px';
                btn13.style.display = 'none';
            }

            function button_close7() {
                main7.style.marginLeft = '0%';
                sidebar7.style.width = '0%';
                btn13.style.display = 'block';
            }
            function button_open8() {
                main8.style.marginLeft = '10px';
                sidebar8.style.width = '450px';
                btn15.style.display = 'none';
            }

            function button_close8() {
                main8.style.marginLeft = '0%';
                sidebar8.style.width = '0%';
                btn15.style.display = 'block';
            }
    </script>
        
    @endpush

@extends('template_public.default')
@section('content')
    <div class="row">
        <div class="col">
            <div class="card">
                <div class="card-body">
                    <div class="row">
                        <div class="col-lg-4 col-6">
                            <div class="small-box bg-yellow">
                                <div class="inner">
                                    <h5 class="text-bold">QS World University</h5>
                                    <p>Universitas Lampung <br>Total Score: <b>{{ $dataQsWordUniversity['total_score'] }}</b></p>
                                    <p>Rank by<br>
                                        <a href="https://www.topuniversities.com/universities/university-lampung" target="_blank" style="color:black;">[ World: <b>{{ $dataQsWordUniversity['rank_by_word'] }}</b> ]</a>
                                        {{-- <a href="https://www.topuniversities.com/universities/university-lampung" target="_blank" style="color:black;">[ Asia: <b>{{ $dataQsWordUniversity['rank_by_asia'] }}</b> ]</a> --}}
                                        <a href="https://www.topuniversities.com/universities/university-lampung" target="_blank" style="color:black;">[ Indonesia: <b>{{ $dataQsWordUniversity['rank_by_indonesia'] }}</b> ]</a>
                                    </p>
                                    <i>source: www.topuniversities.com</i><br>
                                    {{-- <i>last sync: {{ now() }}</i> --}}
                                </div>
                                <div class="icon">
                                    <i class="ion ion-bag"></i>
                                </div>
                                {{-- <a href="#" class="small-box-footer">Selengkapnya <i
                                        class="fas fa-arrow-circle-down"></i></a> --}}
                            </div>
                        </div>
                        <div class="col-lg-4 col-6">
                            <div class="small-box bg-purple">
                                <div class="inner">
                                    <h5 class="text-bold">THE WUR</h5>
                                    <p>Universitas Lampung <br>Total Score: <b>{{ $dataTheWur['total_score'] }}</b></p>
                                    <p>Rank by<br>
                                        <a href="https://www.timeshighereducation.com/world-university-rankings/university-lampung" target="_blank" class="text-white">[ World: <b>{{ $dataTheWur['rank_by_word'] }}</b> ]</a>
                                        {{-- <a href="https://www.timeshighereducation.com/world-university-rankings/university-lampung" target="_blank" class="text-white">[ Asia: <b>{{ $dataTheWur['rank_by_asia'] }}</b> ]</a> --}}
                                        <a href="https://www.timeshighereducation.com/world-university-rankings/university-lampung" target="_blank" class="text-white">[ Indonesia: <b>{{ $dataTheWur['rank_by_indonesia'] }}</b> ]</a>
                                    </p>
                                    <i>source: www.timeshighereducation.com</i><br>
                                    {{-- <i>last sync: {{ now() }}</i> --}}
                                </div>
                                <div class="icon">
                                    <i class="ion ion-stats-bars"></i>
                                </div>
                                {{-- <a href="#" class="small-box-footer">Selengkapnya <i
                                        class="fas fa-arrow-circle-down"></i></a> --}}
                            </div>
                        </div>
                        <div class="col-lg-4 col-6">
                            <div class="small-box bg-danger">
                                <div class="inner">
                                    <h5 class="text-bold">uniRankTM</h5>
                                    <p>Universitas Lampung <br>Total Score: <b>{{ $dataUniRankTm['total_score'] }}</b></p>
                                    <p>Rank by<br>
                                        <a href="https://www.4icu.org/reviews/2184.htm" target="_blank" class="text-white">[ World: <b>{{ $dataUniRankTm['rank_by_word'] }}</b> ]</a>
                                        {{-- <a href="https://www.4icu.org/reviews/2184.htm" target="_blank" class="text-white">[ Asia: <b>{{ $dataUniRankTm['rank_by_asia'] }}</b> ]</a> --}}
                                        <a href="https://www.4icu.org/reviews/2184.htm" target="_blank" class="text-white">[ Indonesia: <b>{{ $dataUniRankTm['rank_by_indonesia'] }}</b> ]</a>
                                    </p>
                                    <i>source: www.4icu.org</i><br>
                                    {{-- <i>last sync: {{ now() }}</i> --}}
                                </div>
                                <div class="icon">
                                    <i class="ion ion-person-add"></i>
                                </div>
                                {{-- <a href="#" class="small-box-footer">Selengkapnya <i
                                        class="fas fa-arrow-circle-down"></i></a> --}}
                            </div>
                        </div>
                        <div class="col-lg-4 col-6">
                            <div class="small-box bg-info">
                                <div class="inner">
                                    <h5 class="text-bold">Webometrics</h5>
                                    <p>Universitas Lampung <br>Total Score: <b>{{ $dataWebometric['total_score'] }}</b></p>
                                    <p>Rank by<br>
                                        <a href="https://www.webometrics.info/en/detalles/unila.ac.id" target="_blank" class="text-white">[ World: <b>{{ $dataWebometric['rank_by_word'] }}</b> ]</a>
                                        {{-- <a href="https://www.webometrics.info/en/detalles/unila.ac.id" target="_blank" class="text-white">[ Asia: <b>{{ $dataWebometric['rank_by_asia'] }}</b> ]</a> --}}
                                        <a href="https://www.webometrics.info/en/detalles/unila.ac.id" target="_blank" class="text-white">[ Indonesia: <b>{{ $dataWebometric['rank_by_indonesia'] }}</b> ]</a>
                                    </p>
                                    <i>source: www.webometrics.info</i><br>
                                    {{-- <i>last sync: {{ now() }}</i> --}}
                                </div>
                                <div class="icon">
                                    <i class="ion ion-person-add"></i>
                                </div>
                                {{-- <a href="#" class="small-box-footer">Selengkapnya <i
                                        class="fas fa-arrow-circle-down"></i></a> --}}
                            </div>
                        </div>
                        <div class="col-lg-4 col-6">
                            <div class="small-box bg-success">
                                <div class="inner">
                                    <h5 class="text-bold">UI Green Metrics</h5>
                                    <p>Universitas Lampung <br>Total Score: <b>{{ $dataGreenmetric['total_score'] }}</b></p>
                                    <p>Rank by<br>
                                        <a href="https://greenmetric.ui.ac.id/rankings/overall-rankings-{{ date('Y')-1 }}/unila.ac.id" target="_blank" class="text-white">[ World: <b>{{ $dataGreenmetric['rank_by_word'] }}</b> ]</a>
                                        {{-- <a href="https://greenmetric.ui.ac.id/rankings/ranking-by-region-{{ date('Y')-1 }}/asia" target="_blank" class="text-white">[ Asia: <b>{{ $dataGreenmetric['rank_by_asia'] }}</b> ]</a> --}}
                                        <a href="https://greenmetric.ui.ac.id/rankings/ranking-by-country-{{ date('Y')-1 }}/Indonesia" target="_blank" class="text-white">[ Indonesia: <b>{{ $dataGreenmetric['rank_by_indonesia'] }}</b> ]</a>
                                    </p>
                                    <i>source: greenmetric.ui.ac.id</i><br>
                                    {{-- <i>last sync: {{ now() }}</i> --}}
                                </div>
                                <div class="icon">
                                    <i class="ion ion-person-add"></i>
                                </div>
                                {{-- <a href="#" class="small-box-footer">Selengkapnya <i
                                        class="fas fa-arrow-circle-down"></i></a> --}}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="row" hidden>
        <div class="col">
            <div class="card">
                <div class="card-body">
                    <table class="table table-bordered" id="tablePegawai" style="width: 100%;">
                        <thead class="bg-success">
                        </thead>
                        <tfoot class="bg-success">
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    </div>
@endsection

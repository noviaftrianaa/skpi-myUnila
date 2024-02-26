@extends('template.default.app')
@section('title', 'WS Access Permission | ' . $aplikasi->nm_aplikasi)

@push('css')
    <link rel="stylesheet" href="{{ asset('css/select2-search/select2.min.css') }}" />
    <link rel="stylesheet" href="{{ asset('css/select2-search/select2-bootstrap.min.css') }}" />
    <style>
        .Accordion-panel>ul {
            list-style-type: none;
            columns: 3;
            -webkit-columns: 3;
            -moz-columns: 3;
        }
    </style>
@endpush

@section('content')
    <div class="card card-info">
        <div class="card-header">
            <h3 class="card-title"><i class="fa fa-list mr-2"></i> WS Access Permission | {!! $aplikasi->nm_aplikasi !!}</h3>
        </div><!-- /.card-header -->
        <div class="card-body">
            <form action="{{ route('aplikasi.pj_aplikasi.akses_ws.store', Crypt::encrypt($id)) }}" method="post"
                enctype="multipart/form-data">
                <input type="hidden" name="_token" value="{{ csrf_token() }}">
                <input type="hidden" name="_method" value="PUT">
                <input type="hidden" name="id_aplikasi" value="{{ $aplikasi->id_aplikasi }}">

                <div class="row text-md">
                    <div class="col-sm-12">
                        <div class="form-group row">
                            <label class="col-3">Pengguna</label>
                            <div class="col-9">
                                <input id="id_pengguna" class="form-control" name="id_pengguna" />
                            </div>
                        </div>
                        <div class="form-group row">
                            <label class="col-3">Aplikasi</label>
                            <div class="col-9">
                                <input class="form-control-plaintext" value="{{ $aplikasi->nm_aplikasi }}" readonly>
                            </div>
                        </div>
                        <hr>
                    </div>
                    <div class="col-12">
                        <div class="form-group row bg-info p-1">
                            <label class="col-3">GROUP</label>
                            <div class="col-9">
                                <label>ENDPOINT</label>
                            </div>
                        </div>
                        @forelse ($endpoint as $method=>$ws)
                            <div class="form-group row">
                                <div class="Checkbox-parent Accordion col-3">
                                    <input class="checkbox__input mr-1" type="checkbox" id="{{ $method }}" />
                                    <span class="checkbox__label">
                                        <strong>{{ strtoupper($method) }}</strong>
                                        <a href="#" class="btn btn-link btnShow" data-id="{{ $method }}"
                                            id="btn{{ $method }}">show</a></span>
                                </div>
                                <div class="Accordion-panel collapse col-9" id="{{ $method }}-collapse">
                                    <ul class="Checkbox-child p-0">
                                        @foreach ($ws as $no => $item)
                                            <li>
                                                <input class="checkbox__input" type="checkbox" name="ws[]"
                                                    value="{{ $item->id_ws_endpoint }}"
                                                    {{ $item->aktif == 1 ? 'checked' : '' }} />
                                                <span class="checkbox__label">[{{ $item->nm_method }}]
                                                    {{ $item->path_url }}</span>
                                            </li>
                                        @endforeach
                                    </ul>
                                </div>
                            </div>
                            <hr>
                        @empty
                            <h3 class="text-center">TIDAK ADA ENDPOINT TERDATA !!!</p>
                        @endforelse
                    </div>
                </div>

                <div class="modal-footer">
                    <a type="button" class="btn btn-default" href="#" onclick="history.back()"><i
                            class="fa fa-arrow-left"></i> Kembali</a>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Simpan</button>
                </div>
            </form>
        </div>
    </div>
@endsection

@push('js')
    <script src="{{ asset('css/select2-search/select2.min.js') }}"></script>
    <script src="{{ asset('css/select2-search/lodash.min.js') }}"></script>
    <script>
        function data() {
            let data = <?php echo json_encode($user); ?>;
            return $.map(data, function(i) {
                return {
                    id: i.id_pengguna,
                    text: i.nm_pengguna + ' (' + i.email + ')',
                };
            });
        }

        $(document).ready(function() {

            //GET PENGGUNA
            $('#id_pengguna').select2({
                data: data(),
                placeholder: 'Search',
                multiple: false,
                query: function(data) {
                    var pageSize,
                        dataset,
                        that = this;
                    pageSize = 20; // Number of the option loads at a time
                    results = [];
                    if (data.term && data.term !== '') {
                        // HEADS UP; for the _.filter function I use underscore (actually lo-dash) here
                        results = _.filter(that.data, function(e) {
                            return e.text.toUpperCase().indexOf(data.term.toUpperCase()) >= 0;
                        });
                    } else if (data.term === '') {
                        results = that.data;
                    }
                    data.callback({
                        results: results.slice((data.page - 1) * pageSize, data.page *
                            pageSize),
                        more: results.length >= data.page * pageSize,
                    });
                },
            });

            $('.btnShow').on('click', function() {
                var id = $(this).data('id');
                if ($(this).html() == "show") {
                    $('#' + id + '-collapse').addClass('show');
                    $(this).html('hide');
                } else {
                    $('#' + id + '-collapse').removeClass('show');
                    $(this).html('show');
                }

            });

            $(".Checkbox-parent input").on('click', function() {
                var _parent = $(this);
                var nextli = $(this).parent().next().children().children();
                var id = this.id;

                if (_parent.prop('checked')) {
                    console.log('Checkbox-parent checked');
                    nextli.each(function() {
                        $(this).children().prop('checked', true);
                    });

                    $('#' + id + '-collapse').addClass('show');
                    $('#btn' + id).html('hide');

                } else {
                    console.log('Checkbox-parent un checked');
                    nextli.each(function() {
                        $(this).children().prop('checked', false);
                    });

                    $('#' + id + '-collapse').removeClass('show');
                    $('#btn' + id).html('show');
                }
            });

            $(".Checkbox-child input").on('click', function() {
                var ths = $(this);
                var parentinput = ths.closest('div').prev().children();
                var sibblingsli = ths.closest('ul').find('li');

                if (ths.prop('checked')) {
                    console.log('Checkbox-child checked');
                    parentinput.prop('checked', true);
                } else {
                    console.log('Checkbox-child unchecked');
                    var status = true;
                    sibblingsli.each(function() {
                        console.log('sibb');
                        if ($(this).children().prop('checked')) status = false;
                    });
                    if (status) parentinput.prop('checked', false);
                }
            });

            // show hide accordion
            var acc = document.getElementsByClassName("Accordion");
            var i;

            for (i = 0; i < acc.length; i++) {
                acc[i].addEventListener("click", function() {
                    this.classList.toggle("Accordion--active");
                    var panel = this.nextElementSibling;
                    if (panel.style.maxHeight) {
                        panel.style.maxHeight = null;
                    } else {
                        panel.style.maxHeight = panel.scrollHeight + "px";
                    }
                });
            }
        });
    </script>
@endpush

<script type="text/javascript">
    'use strict';

    $(document).ready(function() {
        TablePointIku();
    });

    function DrillDownFakultas(id, fak) {
        var id_jns_sms = 3;
        TablePointIku(id_jns_sms, id, fak)
    }

    function DownloadAllRaw(id_jns_sms, id) {
        var thn_iku = $("#thn_iku").val();
        var url = "{{ route('download-raw-iku1') }}?thn_iku=" + thn_iku + "&id_jns_sms=" + id_jns_sms + "&id_sms=" + id;
        location.href = url;
    }

    // point datatable
    function TablePointIku(id_jns_sms, id, fak) {
        var dt_point_iku = $('.datatables-point'),
            dt_point;
        var data = [];

        if (dt_point_iku.length) {
            $('#loading').show();
            $.ajax({
                url: '{!! route('json-point-iku1') !!}',
                type: "GET",
                datatype: 'json',
                data: {
                    thn_iku: $("#thn_iku").val(),
                    id_jns_sms: id_jns_sms,
                    id_sms: id
                },
                "success": function(data) {
                    $('#loading').hide();
                    dt_point = dt_point_iku.DataTable({
                        bDestroy: true,
                        data: data.data, // Get the data object
                        columns: [{
                            data: ''
                        }, {
                            data: 'id_sms'
                        }, {
                            data: 'id_jns_sms'
                        }, {
                            data: 'nm_lemb'
                        }, {
                            data: 'point'
                        }, {
                            data: 'total_responden'
                        }, {
                            data: 'total_alumni'
                        }, {
                            data: 'capaian'
                        }],
                        columnDefs: [{
                                // For Responsive
                                className: 'control',
                                targets: 0,
                                render: function(data, type, full, meta) {
                                    return '';
                                }
                            },
                            {
                                target: 1,
                                visible: false
                            }, {
                                target: 2,
                                visible: false
                            },
                            {
                                targets: 3,
                                render: function(data, type, row) {
                                    if (row.id_jns_sms == '1') {
                                        return '<a href="#" onclick="DrillDownFakultas(`' +
                                            row.id_sms + '`, `' +
                                            data + '`)">' + data + '</a>';
                                    } else {
                                        return '<a href="#" onclick="TableRawIku(`' + row
                                            .id_sms + '`, `' +
                                            data + '`)">' + data + '</a>';
                                    }

                                }
                            },
                        ],
                        paging: false,
                        searching: false,
                        order: [
                            [7, 'desc']
                        ],
                        dom: '<"card-header flex-column flex-md-row"<"head-label text-center"><"dt-action-bu' +
                            'ttons text-end pt-3 pt-md-0"B>><"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md' +
                            '-6 d-flex justify-content-center justify-content-md-end"f>>t<"row"<"col-sm-12 ' +
                            'col-md-6"i><"col-sm-12 col-md-6"p>>',
                        buttons: [{
                            extend: 'collection',
                            className: 'btn btn-label-primary dropdown-toggle me-2',
                            text: '<i class="ti ti-file-export me-sm-1"></i> <span class="d-none d-sm-inline-bloc' +
                                'k">Export</span>',
                            buttons: [{
                                extend: 'print',
                                text: '<i class="ti ti-printer me-1" ></i>Print',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: [3, 4, 5, 6, 7]
                                },
                                customize: function(win) {
                                    //customize print view for dark
                                    $(win.document.body)
                                        .css('color', config.colors
                                            .headingColor)
                                        .css('border-color', config.colors
                                            .borderColor)
                                        .css('background-color', config.colors
                                            .bodyBg);
                                    $(win.document.body)
                                        .find('table')
                                        .addClass('compact')
                                        .css('color', 'inherit')
                                        .css('border-color', 'inherit')
                                        .css('background-color', 'inherit');
                                }
                            }, {
                                extend: 'csv',
                                text: '<i class="ti ti-file-text me-1" ></i>Csv',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: [3, 4, 5, 6, 7]
                                }
                            },{
                                extend: 'pdf',
                                text: '<i class="ti ti-file-description me-1"></i>Pdf',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: [3, 4, 5, 6, 7]
                                }
                            }, {
                                extend: 'copy',
                                text: '<i class="ti ti-copy me-1" ></i>Copy',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: [3, 4, 5, 6, 7]
                                }
                            },
                            {
                                text: '<i class="ti ti-file-spreadsheet me-1"></i>All Raw Excel',
                                className: 'dropdown-item',
                                action: function () {
                                  DownloadAllRaw(id_jns_sms, id);
                                }
                            },
                          ]
                        },
                        {
                            text: '<i class="ti ti-filter me-sm-1"></i> <span class="d-none d-sm-inline-block">Fi' +
                                'lter Data</span>',
                            className: 'add-new btn btn-primary',
                            attr: {
                                'data-bs-toggle': 'offcanvas',
                                'data-bs-target': '#offcanvasFilter'
                            }
                        }],
                        responsive: {
                            details: {
                                display: $.fn.dataTable.Responsive.display.modal({
                                    header: function(row) {
                                        var data = row.data();
                                        return 'FAKULTAS ' + data['nm_lemb'];
                                    }
                                }),
                                type: 'column',
                                renderer: function(api, rowIdx, columns) {
                                    var data = $.map(columns, function(col, i) {
                                        return col.title !==
                                            '' // ? Do not show row in modal popup if title is blank (for check box)
                                            ?
                                            '<tr data-dt-row="' +
                                            col.rowIndex +
                                            '" data-dt-column="' +
                                            col.columnIndex +
                                            '">' +
                                            '<td>' +
                                            col.title +
                                            ':' +
                                            '</td> ' +
                                            '<td>' +
                                            col.data +
                                            '</td>' +
                                            '</tr>' :
                                            '';
                                    }).join('');

                                    return data ? $('<table class="table"/><tbody />').append(
                                        data) : false;
                                }
                            }
                        }
                    });
                    $('#total_point').text(data.count.total_point);
                    $('#total_point').text(data.count.total_point);
                    $('#total_responden').text(data.count.total_responden);
                    $('#total_alumni').text(data.count.total_alumni);
                    $('#pembentuk').text(data.count.pembentuk);
                    $('#pencapaian').text(data.count.pencapaian);
                    $('#gold_standart').text(data.count.gold_standart);
                    $('#delta_gold_standart').text(data.count.delta_gold_standart);
                    $('#skor_pencapaian').text(data.count.skor_pencapaian);
                    $('#rumus').text(data.count.rumus);
                    $('#sumber_data').text(data.count.sumber_data);
                    $('#last_sync').text(data.count.last_sync);

                    if (fak == undefined) {
                        $("#title").html(
                            `<a href="javascript:TablePointIku();" class="text-dark">UNIVERSITAS LAMPUNG</a>`
                        );
                    } else {
                        $("#title").html(
                            `<a href="javascript:TablePointIku();" class="text-dark">UNIVERSITAS LAMPUNG</a> / ` +
                            fak
                        );
                    }
                }
            });
        }
    };

    // raw datatable
    function TableRawIku(id, prodi) {
        $("#detailRawIkuModal").modal('show');
        $('#title-modal').text('PROGRAM STUDI : ' + prodi);

        var dt_raw_bekber = $('.datatables-raw-bekber');
        var dt_raw_lnjt_studi = $('.datatables-raw-lnjt-studi');
        var dt_raw_tdk_bekerja = $('.datatables-raw-tdk_bekerja');
        var data = [];
        var id_jns_sms = 3;

        if (dt_raw_bekber.length) {
            $('#loading_raw_table').show();
            $.ajax({
                url: '{!! route('json-raw-iku1') !!}',
                type: "GET",
                datatype: 'json',
                data: {
                    thn_iku: $("#thn_iku").val(),
                    id_jns_sms: id_jns_sms,
                    id_sms: id
                },
                "success": function(data) {
                  $('#loading_raw_table').hide();
                  // bekber
                  if(data.bekber.length){
                    dt_raw_bekber.DataTable({
                        bDestroy: true,
                        data: data.bekber, // Get the data object
                        columns: [
                        { data: 'id_reg_pd'},
                        { data: 'nm_pd'},
                        { data: 'nipd'},
                        { data: 'nm_fakultas'},
                        { data: 'nm_prodi'},
                        { data: 'nm_jenj_didik' },
                        { data: 'tgl_keluar'},
                        { data: 'status_lulusan' },
                        { data: 'a_kerja_sblm_lulus' },
                        { data: 'bln_dpt_kerja' },
                        { data: 'nm_tmpt_bekerja' },
                        { data: 'nm_wil' },
                        { data: 'ump' },
                        { data: 'income_per_bln' },
                        { data: 'point' },
                      ],
                        columnDefs: [
                            { target: 0, visible: false },
                            {
                                targets: 1,
                                width: 30,
                                render: function(data, type, row) {
                                    return '<a href="#" onclick="ProfilMahasiswa(`' + row.id_reg_pd + '`)">' + data + '</a>';
                                }
                            },
                            { target: 3, visible: false },
                            { target: 4, visible: false },
                            { target: 5, visible: false },
                        ],
                        fixedColumns: { left: 1 },
                        scrollX: true,
                        scrollCollapse: true,
                        paging: false,
                        info: false,
                        order: [
                            [14, 'desc']
                        ],
                        dom: '<"card-header flex-column flex-md-row"<"head-label text-center"><"dt-action-bu' +
                            'ttons text-end pt-3 pt-md-0"B>><"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md' +
                            '-6 d-flex justify-content-center justify-content-md-end"f>>t<"row"<"col-sm-12 ' +
                            'col-md-6"i><"col-sm-12 col-md-6"p>>',
                        buttons: [{
                            extend: 'collection',
                            className: 'btn btn-label-primary dropdown-toggle me-2 toolbar',
                            text: '<i class="ti ti-file-export me-sm-1"></i> <span class="d-none d-sm-inline-bloc' +
                                'k">Export</span>',
                            buttons: [{
                                extend: 'print',
                                text: '<i class="ti ti-printer me-1" ></i>Print',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
                                },
                                customize: function(win) {
                                    //customize print view for dark
                                    $(win.document.body)
                                        .css('color', config.colors
                                            .headingColor)
                                        .css('border-color', config.colors
                                            .borderColor)
                                        .css('background-color', config.colors
                                            .bodyBg);
                                    $(win.document.body)
                                        .find('table')
                                        .addClass('compact')
                                        .css('color', 'inherit')
                                        .css('border-color', 'inherit')
                                        .css('background-color', 'inherit');
                                }
                            }, {
                                extend: 'csv',
                                text: '<i class="ti ti-file-text me-1" ></i>Csv',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
                                }
                            }, {
                                extend: 'excel',
                                text: '<i class="ti ti-file-spreadsheet me-1"></i>Excel',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
                                }
                            }, {
                                extend: 'pdf',
                                text: '<i class="ti ti-file-description me-1"></i>Pdf',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
                                }
                            }, {
                                extend: 'copy',
                                text: '<i class="ti ti-copy me-1" ></i>Copy',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
                                },
                              },
                              {
                                text: '<i class="ti ti-file-spreadsheet me-1"></i>All Raw Excel',
                                className: 'dropdown-item',
                                action: function () {
                                  DownloadAllRaw(id_jns_sms, id);
                                }
                              },
                          ]
                        },
                      ],
                    });
                  }

                  // lnjt_studi
                  if(dt_raw_lnjt_studi.length){
                    dt_raw_lnjt_studi.DataTable({
                        bDestroy: true,
                        data: data.lnjt_studi, // Get the data object
                        columns: [
                            { data: 'id_reg_pd'},
                            { data: 'nm_pd'},
                            { data: 'nipd'},
                            { data: 'nm_fakultas'},
                            { data: 'nm_prodi'},
                            { data: 'nm_jenj_didik' },
                            { data: 'tgl_keluar'},
                            { data: 'status_lulusan' },
                            { data: 'nm_wil' },
                            { data: 'nm_pt_lnjt' },
                            { data: 'nm_prodi_lnjt' },
                            { data: 'wkt_masuk_lnjt_study' },
                            { data: 'jarak_wkt_masuk_lnjt_study' },
                            { data: 'point' },
                      ],
                        columnDefs: [
                            { target: 0, visible: false },
                            {
                                targets: 1,
                                width: 30,
                                render: function(data, type, row) {
                                    return '<a href="#" onclick="ProfilMahasiswa(`' + row.id_reg_pd + '`)">' + data + '</a>';
                                }
                            },
                            { target: 3, visible: false },
                            { target: 4, visible: false },
                            { target: 5, visible: false },
                        ],
                        fixedColumns: { left: 1 },
                        scrollX: true,
                        scrollCollapse: true,
                        paging: false,
                        info: false,
                        order: [
                            [13, 'desc']
                        ],
                        dom: '<"card-header flex-column flex-md-row"<"head-label text-center"><"dt-action-bu' +
                            'ttons text-end pt-3 pt-md-0"B>><"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md' +
                            '-6 d-flex justify-content-center justify-content-md-end"f>>t<"row"<"col-sm-12 ' +
                            'col-md-6"i><"col-sm-12 col-md-6"p>>',
                        buttons: [{
                            extend: 'collection',
                            className: 'btn btn-label-primary dropdown-toggle me-2',
                            text: '<i class="ti ti-file-export me-sm-1"></i> <span class="d-none d-sm-inline-bloc' +
                                'k">Export</span>',
                            buttons: [{
                                extend: 'print',
                                text: '<i class="ti ti-printer me-1" ></i>Print',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
                                },
                                customize: function(win) {
                                    //customize print view for dark
                                    $(win.document.body)
                                        .css('color', config.colors
                                            .headingColor)
                                        .css('border-color', config.colors
                                            .borderColor)
                                        .css('background-color', config.colors
                                            .bodyBg);
                                    $(win.document.body)
                                        .find('table')
                                        .addClass('compact')
                                        .css('color', 'inherit')
                                        .css('border-color', 'inherit')
                                        .css('background-color', 'inherit');
                                }
                            }, {
                                extend: 'csv',
                                text: '<i class="ti ti-file-text me-1" ></i>Csv',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
                                }
                            }, {
                                extend: 'excel',
                                text: '<i class="ti ti-file-spreadsheet me-1"></i>Excel',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
                                }
                            }, {
                                extend: 'pdf',
                                text: '<i class="ti ti-file-description me-1"></i>Pdf',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
                                }
                            }, {
                                extend: 'copy',
                                text: '<i class="ti ti-copy me-1" ></i>Copy',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
                                },
                              },
                              {
                                text: '<i class="ti ti-file-spreadsheet me-1"></i>All Raw Excel',
                                className: 'dropdown-item',
                                action: function () {
                                  DownloadAllRaw(id_jns_sms, id);
                                }
                              },
                          ]
                        },
                      ],
                    });
                  }

                  //tdk _bekber
                  if(dt_raw_tdk_bekerja.length){
                    dt_raw_tdk_bekerja.DataTable({
                        bDestroy: true,
                        data: data.tdk_bekber, // Get the data object
                        columns: [
                          { data: 'id_reg_pd'},
                          { data: 'nm_pd'},
                          { data: 'nipd'},
                          { data: 'nm_fakultas'},
                          { data: 'nm_prodi'},
                          { data: 'nm_jenj_didik' },
                          { data: 'tgl_keluar'},
                          { data: 'status_lulusan' },
                          { data: 'ket' },
                          { data: 'point' },
                      ],
                        columnDefs: [
                            { target: 0, visible: false },
                            {
                                targets: 1,
                                width: 30,
                                render: function(data, type, row) {
                                    return '<a href="#" onclick="ProfilMahasiswa(`' + row.id_reg_pd + '`)">' + data + '</a>';
                                }
                            },
                            { target: 3, visible: false },
                            { target: 4, visible: false },
                            { target: 5, visible: false },
                        ],
                        fixedColumns: { left: 1 },
                        scrollX: true,
                        scrollCollapse: true,
                        paging: false,
                        info: false,
                        order: [
                            [9, 'desc']
                        ],
                        dom: '<"card-header flex-column flex-md-row"<"head-label text-center"><"dt-action-bu' +
                            'ttons text-end pt-3 pt-md-0"B>><"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md' +
                            '-6 d-flex justify-content-center justify-content-md-end"f>>t<"row"<"col-sm-12 ' +
                            'col-md-6"i><"col-sm-12 col-md-6"p>>',
                        buttons: [{
                            extend: 'collection',
                            className: 'btn btn-label-primary dropdown-toggle me-2',
                            text: '<i class="ti ti-file-export me-sm-1"></i> <span class="d-none d-sm-inline-bloc' +
                                'k">Export</span>',
                            buttons: [{
                                extend: 'print',
                                text: '<i class="ti ti-printer me-1" ></i>Print',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9]
                                },
                                customize: function(win) {
                                    //customize print view for dark
                                    $(win.document.body)
                                        .css('color', config.colors
                                            .headingColor)
                                        .css('border-color', config.colors
                                            .borderColor)
                                        .css('background-color', config.colors
                                            .bodyBg);
                                    $(win.document.body)
                                        .find('table')
                                        .addClass('compact')
                                        .css('color', 'inherit')
                                        .css('border-color', 'inherit')
                                        .css('background-color', 'inherit');
                                }
                            }, {
                                extend: 'csv',
                                text: '<i class="ti ti-file-text me-1" ></i>Csv',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9]
                                }
                            }, {
                                extend: 'excel',
                                text: '<i class="ti ti-file-spreadsheet me-1"></i>Excel',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9]
                                }
                            }, {
                                extend: 'pdf',
                                text: '<i class="ti ti-file-description me-1"></i>Pdf',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9]
                                }
                            }, {
                                extend: 'copy',
                                text: '<i class="ti ti-copy me-1" ></i>Copy',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: [1, 2, 3, 4, 5, 6, 7, 8, 9]
                                }
                              },
                              {
                                text: '<i class="ti ti-file-spreadsheet me-1"></i>All Raw Excel',
                                className: 'dropdown-item',
                                action: function () {
                                  DownloadAllRaw(id_jns_sms, id);
                                }
                              },
                          ]
                        },
                      ],
                    });
                  }
                }
            });
        }

        $('button[data-bs-toggle="tab"]').first().tab('show');
        $('button[data-bs-toggle="tab"]').on('shown.bs.tab', function(e) {
            $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
        });
    };

    function ClearCloseTable(){
        $('.datatables-raw-bekber').DataTable().clear().draw();
        $('.datatables-raw-lnjt-studi').DataTable().clear().draw();
        $('.datatables-raw-tdk_bekerja').DataTable().clear().draw();
    }


</script>

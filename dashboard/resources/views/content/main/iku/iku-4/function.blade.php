<script type="text/javascript">
    'use strict';

    $(document).ready(function() {
        TablePointIku();
        $('.sertifikasi').show();
        $('.praktisi').hide();

        $('button[data-bs-toggle="tab"]').on('shown.bs.tab', function (e) {
            let target = e.target
            let previous = e.relatedTarget

            if (target.id === "tab-sertifikasi") {
                if (previous.id === "tab-praktisi") {
                    $('.praktisi').hide();
                }
                $('.sertifikasi').show();
            }
            if (target.id === "tab-praktisi") {
                if (previous.id === "tab-sertifikasi") {
                    $('.sertifikasi').hide();
                }
                $('.praktisi').show();
            }
        });
    });

    function DrillDownFakultas(id, fak) {
        var id_jns_sms = 3;
        TablePointIku(id_jns_sms, id, fak)
    }

    function DownloadAllRaw(id_jns_sms, id, jns_download) {
        var thn_iku = $("#thn_iku").val();
        var url = "{{ route('download-raw-iku4') }}?thn_iku=" + thn_iku + "&id_jns_sms=" + id_jns_sms + "&id_sms=" + id + "&jns_download=" + jns_download;
        location.href = url;
    }

    // point datatable
    function TablePointIku(id_jns_sms, id, fak) {
        $('#tahun-index').text('TAHUN : ' + $("#thn_iku").val());
        var dt_point_sertifikasi = $('.datatables-point-sertifikasi'),
            dt_point_sertifikasi;
        var dt_point_praktisi = $('.datatables-point-praktisi'),
            dt_point_praktisi;
        var data = [];

        if (dt_point_sertifikasi.length) {
            $('#loading').show();
            $.ajax({
                url: '{!! route('json-point-iku4') !!}',
                type: "GET",
                datatype: 'json',
                data: {
                    thn_iku: $("#thn_iku").val(),
                    id_jns_sms: id_jns_sms,
                    id_sms: id
                },
                "success": function(data) {
                    $('#loading').hide();
                    //raw sertifikasi
                    dt_point_sertifikasi = dt_point_sertifikasi.DataTable({
                        bDestroy: true,
                        data: data.sertifikasi, // Get the data object
                        columns: [{
                            data: ''
                        }, {
                            data: 'id_sms'
                        }, {
                            data: 'id_jns_sms'
                        }, {
                            data: 'nm_lemb'
                        }, {
                            data: 'point_a'
                        }, {
                            data: 'total_dosen_a'
                        }, {
                            data: 'capaian_a'
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
                            [6, 'desc']
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
                                    columns: [3, 4, 5, 6]
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
                                    columns: [3, 4, 5, 6]
                                }
                            },{
                                extend: 'pdf',
                                text: '<i class="ti ti-file-description me-1"></i>Pdf',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: [3, 4, 5, 6]
                                }
                            }, {
                                extend: 'copy',
                                text: '<i class="ti ti-copy me-1" ></i>Copy',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: [3, 4, 5, 6]
                                }
                            },
                            // {
                            //     text: '<i class="ti ti-file-spreadsheet me-1"></i>All Excel Dosen Sertifikasi',
                            //     className: 'dropdown-item',
                            //     action: function () {
                            //       DownloadAllRaw(id_jns_sms, id, 'dosen_sertifikasi');
                            //     }
                            // },
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

                    //raw praktisi
                    dt_point_praktisi = dt_point_praktisi.DataTable({
                        bDestroy: true, data: data.praktisi, // Get the data object
                        columns: [
                            {
                                data: ''
                            }, {
                                data: 'id_sms'
                            }, {
                                data: 'id_jns_sms'
                            }, {
                                data: 'nm_lemb'
                            }, {
                                data: 'point_b'
                            }, {
                                data: 'total_dosen_b'
                            }, {
                                data: 'capaian_b'
                            }
                        ],
                        columnDefs: [
                            {
                                // For Responsive
                                className: 'control',
                                targets: 0,
                                render: function (data, type, full, meta) {
                                    return '';
                                }
                            }, {
                                target: 1,
                                visible: false
                            }, {
                                target: 2,
                                visible: false
                            }, {
                                targets: 3,
                                render: function (data, type, row) {
                                    if (row.id_jns_sms == '1') {
                                        return '<a href="#" onclick="DrillDownFakultas(`' + row.id_sms + '`, `' +
                                                data + '`)">' + data + '</a>';
                                    } else {
                                        return '<a href="#" onclick="TableRawIku(`' + row.id_sms + '`, `' + data +
                                                '`)">' + data + '</a>';
                                    }

                                }
                            }
                        ],
                        paging: false,
                        searching: false,
                        order: [
                            [6, 'desc']
                        ],
                        dom: '<"card-header flex-column flex-md-row"<"head-label text-center"><"dt-action-bu' +
                                'ttons text-end pt-3 pt-md-0"B>><"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md' +
                                '-6 d-flex justify-content-center justify-content-md-end"f>>t<"row"<"col-sm-12 ' +
                                'col-md-6"i><"col-sm-12 col-md-6"p>>',
                        buttons: [
                            {
                                extend: 'collection',
                                className: 'btn btn-label-primary dropdown-toggle me-2',
                                text: '<i class="ti ti-file-export me-sm-1"></i> <span class="d-none d-sm-inline-bloc' +
                                        'k">Export</span>',
                                buttons: [
                                    {
                                        extend: 'print',
                                        text: '<i class="ti ti-printer me-1" ></i>Print',
                                        className: 'dropdown-item',
                                        exportOptions: {
                                            columns: [3, 4, 5, 6]
                                        },
                                        customize: function (win) {
                                            //customize print view for dark
                                            $(win.document.body)
                                                .css('color', config.colors.headingColor)
                                                .css('border-color', config.colors.borderColor)
                                                .css('background-color', config.colors.bodyBg);
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
                                            columns: [3, 4, 5, 6]
                                        }
                                    }, {
                                        extend: 'pdf',
                                        text: '<i class="ti ti-file-description me-1"></i>Pdf',
                                        className: 'dropdown-item',
                                        exportOptions: {
                                            columns: [3, 4, 5, 6]
                                        }
                                    }, {
                                        extend: 'copy',
                                        text: '<i class="ti ti-copy me-1" ></i>Copy',
                                        className: 'dropdown-item',
                                        exportOptions: {
                                            columns: [3, 4, 5, 6]
                                        }
                                    },
                                    // {     text: '<i class="ti ti-file-spreadsheet me-1"></i>All Excel Praktisi',
                                    // className: 'dropdown-item',     action: function () {
                                    // DownloadAllRaw(id_jns_sms, id, 'praktisi');     } },
                                ]
                            }, {
                                text: '<i class="ti ti-filter me-sm-1"></i> <span class="d-none d-sm-inline-block">Fi' +
                                        'lter Data</span>',
                                className: 'add-new btn btn-primary',
                                attr: {
                                    'data-bs-toggle': 'offcanvas',
                                    'data-bs-target': '#offcanvasFilter'
                                }
                            }
                        ],
                        responsive: {
                            details: {
                                display: $
                                    .fn
                                    .dataTable
                                    .Responsive
                                    .display
                                    .modal({
                                        header: function (row) {
                                            var data = row.data();
                                            return 'FAKULTAS ' + data['nm_lemb'];
                                        }
                                    }),
                                type: 'column',
                                renderer: function (api, rowIdx, columns) {
                                    var data = $
                                        .map(columns, function (col, i) {
                                            return col.title !== '' // ? Do not show row in modal popup if title is blank (for check box)
                                                ? '<tr data-dt-row="' + col.rowIndex + '" data-dt-column="' + col.columnIndex + '"><td>' +
                                                        col.title + ':</td> <td>' + col.data + '</td></tr>'
                                                : '';
                                        })
                                        .join('');

                                    return data
                                        ? $('<table class="table"/><tbody />').append(data)
                                        : false;
                                }
                            }
                        }
                    });

                    $('button[data-bs-toggle="tab"]').on('shown.bs.tab', function(e) {
                        $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
                    });
                    //count

                    $('#pencapaian_1').text(data.count.pencapaian);
                    $('#gold_standart_1').text(data.count.gold_standart);
                    $('#delta_gold_standart_1').text(data.count.delta_gold_standart);
                    $('#skor_pencapaian_1').text(data.count.skor_pencapaian);

                    $('#pencapaian_2').text(data.count.pencapaian);
                    $('#gold_standart_2').text(data.count.gold_standart);
                    $('#delta_gold_standart_2').text(data.count.delta_gold_standart);
                    $('#skor_pencapaian_2').text(data.count.skor_pencapaian);

                    //sertifikasi
                    $('#point_a').text(data.count.point_a);
                    $('#total_sertif').text(data.count.point_a);
                    $('#pembentuk_a').text(data.count.pembentuk_a);
                    $('#total_dosen_a').text(data.count.total_dosen_a);

                    $('#rumus_a').text(data.count.rumus_ab);
                    $('#sumber_a').text(data.count.sumber_ab);
                    $('#last_sync_a').text(data.count.last_sync_a);

                    //praktisi
                    $('#point_b').text(data.count.point_b);
                    $('#total_praktisi').text(data.count.point_b);
                    $('#pembentuk_b').text(data.count.pembentuk_b);
                    $('#total_dosen_b').text(data.count.total_dosen_b);

                    $('#rumus_b').text(data.count.rumus_ab);
                    $('#sumber_b').text(data.count.sumber_ab);
                    $('#last_sync_b').text(data.count.last_sync_b);

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

        $('button[data-bs-toggle="tab"]').first().tab('show');
        $('button[data-bs-toggle="tab"]').on('shown.bs.tab', function(e) {
            $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
        });
    };

    // raw datatable
    function TableRawIku(id, prodi) {
        $("#detailRawIkuModal").modal('show');
        $('#tahun-modal').text('TAHUN : ' + $("#thn_iku").val());
        $('#title-modal').text('PROGRAM STUDI : ' + prodi);

        var dt_raw_sertifikasi = $('.datatables-raw-sertifikasi');
        var dt_raw_praktisi = $('.datatables-raw-praktisi');
        var data = [];
        var id_jns_sms = 3;

        if (dt_raw_sertifikasi.length) {
            $('#loading_raw_table').show();
            $.ajax({
                url: '{!! route('json-raw-iku4') !!}',
                type: "GET",
                datatype: 'json',
                data: {
                    thn_iku: $("#thn_iku").val(),
                    id_jns_sms: id_jns_sms,
                    id_sms: id
                },
                "success": function(data) {
                  $('#loading_raw_table').hide();
                  // sertifikasi
                  if(dt_raw_sertifikasi.length){
                    dt_raw_sertifikasi.DataTable({
                        bDestroy: true,
                        data: data.sertifikasi, // Get the data object
                        columns: [
                        { data: 'id_sdm'},
                        { data: 'nm_sdm'},
                        { data: 'nidn'},
                        { data: 'nm_fakultas'},
                        { data: 'nm_prodi'},
                        { data: 'nm_jenj_didik' },
                        { data: 'total_sertifikasi'},
                      ],
                        columnDefs: [
                            { target: 0, visible: false },
                            {
                                targets: 1,
                                width: 30,
                                render: function(data, type, row) {
                                     return `<a href="{{ route('pages-mahasiswa', '') }}/${row.id_pd}" target="_blank">${data}</a>`
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
                        info: true,
                        // order: [
                        //     [7, 'desc']
                        // ],
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
                                    columns: [1, 2, 3, 4, 5, 6, 7]
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
                                    columns: [1, 2, 3, 4, 5, 6, 7]
                                }
                            }, {
                                extend: 'excel',
                                text: '<i class="ti ti-file-spreadsheet me-1"></i>Excel',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: [1, 2, 3, 4, 5, 6, 7]
                                }
                            }, {
                                extend: 'pdf',
                                text: '<i class="ti ti-file-description me-1"></i>Pdf',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: [1, 2, 3, 4, 5, 6, 7]
                                }
                            }, {
                                extend: 'copy',
                                text: '<i class="ti ti-copy me-1" ></i>Copy',
                                className: 'dropdown-item',
                                exportOptions: {
                                    columns: [1, 2, 3, 4, 5, 6, 7]
                                },
                              },
                            //   {
                            //     text: '<i class="ti ti-file-spreadsheet me-1"></i>Excel MBKM Agregat',
                            //     className: 'dropdown-item',
                            //     action: function () {
                            //       DownloadAllRaw(id_jns_sms, id, 'mbkm_agregat');
                            //     }
                            //   },
                          ]
                        },
                      ],
                    });
                  }

                  //praktisi
                  if(dt_raw_praktisi.length){
                    dt_raw_praktisi.DataTable({
                        bDestroy: true,
                        data: data.praktisi, // Get the data object
                        columns: [
                          { data: 'id_sdm'},
                          { data: 'nm_sdm'},
                          { data: 'nidn'},
                          { data: 'nm_fakultas'},
                          { data: 'nm_prodi'},
                          { data: 'nm_jenj_didik' },
                          { data: 'total_praktisi' },
                      ],
                        columnDefs: [
                            { target: 0, visible: false },
                            {
                                targets: 1,
                                width: 30,
                                render: function(data, type, row) {
                                     return `<a href="{{ route('pages-mahasiswa', '') }}/${row.id_pd}" target="_blank">${data}</a>`
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
                        info: true,
                        // order: [
                        //     [10, 'desc']
                        // ],
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
                            //   {
                            //     text: '<i class="ti ti-file-spreadsheet me-1"></i>Excel Prestasi',
                            //     className: 'dropdown-item',
                            //     action: function () {
                            //       DownloadAllRaw(id_jns_sms, id, 'prestasi');
                            //     }
                            //   },
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
        $('.datatables-raw-sertifikasi').DataTable().clear().draw();
        $('.datatables-raw-praktisi').DataTable().clear().draw();
    }


</script>

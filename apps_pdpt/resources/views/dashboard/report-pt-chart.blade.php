@push('js')
    <script type="text/javascript">
        $(document).ready(function(){
            var token                   = $("meta[name=csrf-token]").attr("content");
            var url                     = "{{ Request::url() }}";
            var isFilter                = false;
            var level                   = 'Perguruan Tinggi';
            var nextLevel               = 'Fakultas';
            var selectedCategory        = 'Default';
            var selectedPoint           = '';
            var selectedPointID         = '';
            var columnValue             = 0;
            var historyLoad             = false;
            var selectedCategory        = '';
            var selectedCategoryText    = '';
            resetBreadcrumbs();
            function resetBreadcrumbs()
            {
                var lastPT          = '';
                var lastPTID        = '';
                var lastFakultas    = '';
                var lastFakultasID  = '';
            }

            $(".btn-group > .btn").click(function(){
                $(this).addClass("active").siblings().removeClass("active");
                $(this).addClass('btn-primary').siblings().removeClass('btn-primary').addClass('btn-default');
                reloadTable();
            });
            $('[data-toggle="tooltip"]').tooltip();
            $("#filter").click(function(){
                $("#filterModal").modal('show');
            });

            if(url.search('jabatan_fungsional') != -1 || url.search('pangkat_golongan') != -1){
                reload(false);
            }
            else{
                loadTemp();
            }

            $("#reload").click(function() {
                reload(false);
                isFilter = true;
            });
            $("#refresh").click(function() {
                reload(false);
            });
            $("#reloadFilter").click(function() {
                reload(false);
            });

            function getLastLevel()
            {
                var result = "";
                if(level == 'Fakultas'){
                    result = lastPTID;
                }
                else if(level == 'Program Studi'){
                    if(lastFakultasID !== ''){
                        result = lastFakultasID;
                    }
                    else{
                        result = lastPTID;
                    }
                }
                return result;
            }

            $("#drilldown").click(function(){
                $("#chartDetail").modal('hide');
                historyLoad = false;
                reload(true);
            });

            function setBreadcrumbs()
            {
                var chartBreadcrumb = '<li class="breadcrumb-item"><a data-nextlevel="Universitas Lampung">Universitas Lampung</a></li>';
                if(level == 'Fakultas' || level == 'Program Studi'){
                    chartBreadcrumb += '<li class="breadcrumb-item active" aria-current="page" data-nextlevel="Fakultas" data-selected="'+lastPTID+'">'+lastPT+'</li>';
                }
                if(level == 'Program Studi'){
                    if(lastFakultas != ''){
                        chartBreadcrumb += '<li class="breadcrumb-item active" aria-current="page"><a data-nextlevel="Program Studi" data-selected="'+lastFakultasID+'">'+lastFakultas+'</a></li>';
                    }
                }
                $("#chartBreadcrumb").html(chartBreadcrumb);
            }

            $("#chartBreadcrumb").on("click", "a", function(event){
                nextLevel       = this.getAttribute("data-nextlevel");
                selectedPoint   = $(this).text();
                selectedPointID = this.getAttribute("data-selected");
                historyLoad     = true;
                if(nextLevel=='Universitas Lampung' && isFilter==false){
                    loadTemp();
                }
                else{
                    reload(true);
                }
            });

            function reloadTable(){
                var charValue = '';
                $("#chartDetail").modal('hide');
                $('#charList .active').each(function(){
                    charValue= $(this).data('value');
                });
                var oTable = $('#datatable').DataTable({
                    "bDestroy": true,
                    processing: true,
                    serverSide: true,
                    "scrollY": "180px",
                    "scrollCollapse": true,
                    "ajax": {
                        "url": url,
                        "type": "POST",
                        "data": {
                            "_token": token,
                            "requestType": "table",
                            "type": $("#typeDrilldown").val(),
                            "level": level,
                            "group": group,
                            "selectedCategory": selectedCategory,
                            "selectedCategoryText": selectedCategoryText,
                            "selectedPoint": selectedPoint,
                            "selectedPointID": selectedPointID,
                            "char": charValue,
                        }
                    },
                    dom: 'Blfrtip',
                    buttons: [
                        'copyHtml5',
                        {
                            extend: 'excelHtml5',
                            title: 'Data export',
                        },
                        {
                            extend: 'csvHtml5',
                            title: 'Data export',
                        },
                        {
                            extend: 'pdfHtml5',
                            title: 'Data export',
                        },
                    ],
                    "columns": [
                        { "data": "nm_dosen" },
                        { "data": "nidn" },
                        { "data": "nip" },
                        { "data": "jk" },
                        { "data": "tgl_lahir" },
                        { "data": "pt" },
                        { "data": "prodi" }
                    ]
                });
                $("#modal").modal('show');
            }

            $("#showtable").click(function(){
                reloadTable();
            });

            function reload(drillDown){
                var lastLevelID = getLastLevel();
                if(drillDown){
                    targetLevel = nextLevel;
                }
                else{
                    targetLevel = level;
                }
                group = $("#group").val();
                if(group==null){
                    group = 'all';
                }
                $("#filterModal").modal('hide');
                $('#resultTable').empty();
                $.ajax({
                    type: "POST",
                    dataType: "json",
                    url: "{{ Request::url() }}" ,
                    data: {
                        "_token": token,
                        "type": $("#typeDrilldown").val(),
                        "historyLoad": historyLoad,
                        "level": targetLevel,
                        "lastLevelID": lastLevelID,
                        "drillDown": drillDown,
                        "group": group,
                        "selectedCategory": selectedCategory,
                        "selectedCategoryText": selectedCategoryText,
                        "selectedPoint": selectedPoint,
                        "selectedPointID": selectedPointID,
                    },
                    success: function(data){
                        $("#chartDetail").modal('hide');
                        if(drillDown){
                            $('#filterWilayah').val('all');
                        }
                        if(drillDown && historyLoad == false){
                            if(data.chartLevel == 'Wilayah'){
                                lastPT          = "";
                                lastPTID        = "";
                                lastFakultas    = "";
                                lastFakultasID  = "";
                            }
                            else if(data.chartLevel == 'Perguruan Tinggi'){
                                lastPT          = "";
                                lastPTID        = "";
                                lastFakultas    = "";
                                lastFakultasID  = "";
                            }
                            else if(data.chartLevel == 'Fakultas'){
                                lastPT          = selectedPoint;
                                lastPTID        = selectedPointID;
                                lastFakultas    = "";
                                lastFakultasID  = "";
                            }
                            else if(data.chartLevel=='Program Studi'){
                                lastFakultas    = selectedPoint;
                                lastFakultasID  = selectedPointID;
                            }
                        }

                        level       = data.chartLevel;
                        nextLevel   = data.chartNextLevel;
                        $('#topTitle').text(data.chartTitle);
                        $('#res').html(data.resultTable);
                        $('#resultTable').dataTable().fnDestroy();
                        $('#resultTable').DataTable({
                            "bDestroy": true,
                            "bAutoWidth": false,
                            "bSort": false,
                            dom: 'Blfrtip',
                            buttons: [
                                'copyHtml5',
                                {
                                    extend: 'excelHtml5',
                                    title: 'Data export',
                                },
                                {
                                    extend: 'csvHtml5',
                                    title: 'Data export',
                                },
                                {
                                    extend: 'pdfHtml5',
                                    title: 'Data export',
                                },
                            ],
                        });
                        reloadChart(data.chartTitle, data.chartSubtitle, data.chartUnit, data.chartCategories, data.chartMax, data.chartSeries);
                        setBreadcrumbs();
                        $("#progressBar").hide();
                    }
                });
            }

            function reloadChart(chartTitle, chartSubtitle, chartUnit, chartCategories, chartMax, chartSeries)
            {
                $('#container').highcharts({
                    chart: {
                        type: 'column',
                        zoomType: 'xy',
                        backgroundColor: 'rgba(0,0,0,0)'
                    },
                    credits: {
                        enabled: false
                    },
                    title: {
                        text: chartTitle,
                        style: {
                            color: "#ffffff"
                        }
                    },
                    subtitle: {
                        text: chartSubtitle,
                        style: {
                            color: "#ffffff"
                        }
                    },
                    scrollbar: {
                        enabled: true,
                        barBackgroundColor: 'gray',
                        barBorderRadius: 7,
                        barBorderWidth: 0,
                        buttonBackgroundColor: 'gray',
                        buttonBorderWidth: 0,
                        buttonArrowColor: 'yellow',
                        buttonBorderRadius: 7,
                        rifleColor: 'yellow',
                        trackBackgroundColor: 'white',
                        trackBorderWidth: 1,
                        trackBorderColor: 'silver',
                        trackBorderRadius: 7
                    },
                    tooltip: {
                        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' + '<td style="padding:0"><b>{point.y} '+chartUnit+'</b></td></tr>',
                        footerFormat: '</table>',
                        shared: true,
                        useHTML: true
                    },
                    plotOptions: {
                        column: {
                            depth: 25,
                            minPointWidth:50,
                            dataLabels: {
                                enabled: true,
                                formatter:function(){
                                    if(this.y != null){
                                        return this.y;
                                    }
                                }
                            }
                        },
                        series: {
                            showInLegend: true,
                            turboThreshold: 0,
                            cursor: 'pointer',
                            shadow: false,
                            point: {
                                events: {
                                    click: function(){
                                        if(level == 'Jurusan'){
                                            selectedCategory        = this.id;
                                            selectedCategoryText    = this.name;
                                        }
                                        if(level=='Program Studi'){
                                            $("#drilldown").hide();
                                        }
                                        else{
                                            $("#drilldown").show();
                                        }
                                        selectedPointID     = this.id;
                                        selectedPoint       = this.name;
                                        var currentLocation = this.name;
                                        $("#selectedColumn").html(this.name);
                                        $("#selectedValue").html(this.y);
                                        $("#selectedYear").html(this.series.name);
                                        $("#selectedLevel").html(level);
                                        $("#chartDetail").modal('show');
                                    }
                                }
                            }
                        }
                    },
                    xAxis: {
                        labels: {
                            overflow: 'justify',
                            style:{
                                width:'80px',
                                color: '#FFFFFF'
                            },
                            groupedOptions: [{
                                rotation: 0, // rotate labels for a 2nd-level
                                align: 'center',
                                style: {
                                    color: 'red', // set red font for labels in 1st-Level
                                }
                            }, {
                                rotation: -45, // rotate labels for a 2nd-level
                            }],
                            rotation: -45, // 0-level options aren't changed, use them as always
                            align: 'right',
                        },
                        categories: chartCategories,
                        crosshair: false,
                        min: 0,
                        max: chartMax,
                    },
                    yAxis: {
                        title: {
                            text: chartUnit,
                            style: {
                                color: "#ffffff"
                            }
                        },
                        labels: {
                            style: {
                                color: '#FFFFFF',
                            }
                        },
                    },
                    series: chartSeries,
                    exporting:{
                        enabled: true,
                        sourceWidth: 3000,
                        sourceHeight: 1000,
                        chartOptions: {
                            xAxis: [{
                                categories: chartCategories,
                                min: 0,
                                minRange: chartCategories.length-1,
                                max: chartCategories.length-1
                            }],
                            scrollbar:{
                                enabled: false
                            }
                        }
                    },
                });
            }

            function loadTemp()
            {
                $.ajax({
                    type: "GET",
                    dataType: "json",
                    url: url+'/load' ,
                    success: function(data){
                        if(data!=='error'){
                            level       = 'Perguruan Tinggi';
                            nextLevel   = 'Fakultas';
                            reloadChart(data.chartTitle, data.chartSubtitle, data.chartUnit, data.chartCategories, data.chartMax, data.chartSeries);
                            $('#res').html(data.resultTable);
                            $("#last-update").html(data.last_update);
                            resetBreadcrumbs();
                            setBreadcrumbs();
                        }
                        else{
                            $('#reload_temp').trigger('submit');
                        }
                        $("#reportTemp").show();
                    }
                });
            }
        });
    </script>
@endpush

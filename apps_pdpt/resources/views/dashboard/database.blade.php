<div class="card">
    <div class="card-header bg-dark">
        <h3 class="card-title"><i class="fa fa-database"></i> Database</h3>
    </div>
    <div class="card-body" style="margin: 0; padding: 0">
        <table class="table table-striped">
            {!! tableRow('Versi Database',$versi_database->versi) !!}
            {!! tableRow('Waktu Update',tglWaktuIndonesia($versi_database->tgl_update)) !!}
        </table>
    </div>
</div>

<div class="card">
    <div class="card-header bg-info">
        <h3 class="card-title"><i class="fa fa-clock-o"></i> Log Login</h3>
    </div>
    <div class="card-body" style="margin: 0; padding: 0">
        <table class="table table-striped">
            {!! tableRow('Username',$log_login->pengguna->username) !!}
            {!! tableRow('Waktu Login',tglWaktuIndonesia($log_login->waktu_login)) !!}
            {!! tableRow('Sistem Operasi',$log_login->os) !!}
            {!! tableRow('Browser',$log_login->browser) !!}
            {!! tableRow('IP',$log_login->ip_address) !!}
        </table>
    </div>
</div>

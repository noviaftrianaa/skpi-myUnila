<!DOCTYPE html>
<html><body>
	<p>Salam hormat {{ $data->email }}</p>
	<p>Berikut ini adalah Informasi Akun Palaseko.Id anda:</p>
	<p>Username : {{ $data->username }}</p>
	<p>Password : <b>{{ $pwd }}</b></p>

	<p>Setelah login, silahkan update informasi akun anda dan ubah password pada menu profil.</p>

	<p>Jika anda tidak merasa melakukan registrasi pada Aplikasi Palaseko.Id, mohon tidak melanjutkan proses login dan silahkan abaikan pesan ini.</p>
	<p>Terima kasih atas perhatian dan kerjasamanya.</p>
</body></html>

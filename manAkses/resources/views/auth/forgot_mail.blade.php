<!DOCTYPE html>

<html><body>

	<p>Salam hormat {{ $data['email'] }}</p>

	<p>Langkah selanjutnya, silakan klik tautan di bawah ini untuk melakukan aktivasi reset akun Anda.</p>



	<div style="text-align: center;">

		<h1><a class="btn btn-sm btn-primary fwbold" href="{{url('/auth/forgot_password/aktivasi/'.Crypt::encrypt($data)) }}"><i class=" "></i> AKTIVASI</a></h1>

	</div>

	<p>atau dengan copy paste link berikut:</p>

	<p>{{url('/auth/forgot_password/aktivasi/'.Crypt::encrypt($data)) }}</p>



	<p>Jika anda tidak merasa melakukan reset password pada aplikasi PALASEKO.ID, mohon tidak melanjutkan aktivasi pada link tersebut dan silahkan abaikan pesan ini.</p>

	<p>Terima kasih atas perhatian dan kerjasamanya.</p>

</body></html>


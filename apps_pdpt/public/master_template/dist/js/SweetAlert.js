function SweetAlertResponse(res) {
    if (res.status == true || res.status == 1) {
        Swal.fire({
            position: "top-end",
            title: "Berhasil",
            showConfirmButton: false,
            text: res.message,
            icon: "success",
            timer: 1000,
        });
    } else if (res.status == false || res.status == 0) {
        Swal.fire({
            position: "top-end",
            title: "Gagal",
            text: res.message,
            icon: "warning",
        });
    } else {
        Swal.fire({
            position: "top-end",
            title: "Oops...",
            text: "Terjadi masalah, Silahkan coba lagi atau hubungi administrator!",
            icon: "error",
        });
    }
}

function SweetAlertSinkronisasi(btn, type, url, data, callback) {
  Swal.fire({
      title: "Konfirmasi!",
      text: "Sinkronisasi akan memakan waktu, Apakah Anda yakin akan sinkronisasi data??",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Sinkron Sekarang",
      cancelButtonText: "Batal",
  }).then((willSinkron) => {
      if (willSinkron.isConfirmed) {
          $.ajax({
              type: type,
              url: url,
              data: data,
              beforeSend: function () {
                  btn.prop("disabled", true);
              },
          })
              .done(function (res) {
                  SweetAlertResponse(res);
                  btn.prop("disabled", false);
                  callback(res.status);
              })
              .fail(function (res) {
                  SweetAlertResponse(res);
                  btn.prop("disabled", false);
                  callback(res.status);
              });
      } else {
          btn.prop("disabled", false);
      }
  });
}

function SweetAlertDelete(btn, type, url, data, callback) {
    Swal.fire({
        title: "Konfirmasi!",
        text: "Apakah Anda yakin akan menghapus data ini??",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, Hapus",
        cancelButtonText: "Batal",
    }).then((willDelete) => {
        if (willDelete.isConfirmed) {
            $.ajax({
                type: type,
                url: url,
                data: data,
                beforeSend: function () {
                    btn.prop("disabled", true);
                },
            })
                .done(function (res) {
                    SweetAlertResponse(res);
                    btn.prop("disabled", false);
                    callback(res.status);
                })
                .fail(function (res) {
                    SweetAlertResponse(res);
                    btn.prop("disabled", false);
                    callback(res.status);
                });
        } else {
            btn.prop("disabled", false);
        }
    });
}

function SweetAlertEmpty(btn) {
    Swal.fire({
        title: "Oops...",
        text: "Pilih data terlebih dahulu!",
        icon: "warning",
    });
    btn.prop("disabled", false);
}





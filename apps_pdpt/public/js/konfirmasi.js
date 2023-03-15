/**
 * Created by Hendra on 7/12/2016.
 */
$(function(){
    /* Button Delete onClick*/
    $('#table-data tbody').on('click', 'button.btn-delete', function(e){
        e.preventDefault();
        var self = $(this);
        swal({
            title               : "Konfirmasi",
            text                : "Apakah Anda yakin akan menghapus data ini?",
            icon                : "warning",
            buttons: {
                cancel: {
                    text: "Batal",
                    value: null,
                    closeModal: true,
                    visible: true,
                },
                text: {
                    text: "Ya, hapus!",
                    value: true,
                    visible: true,
                    closeModal: false,
                }
            },
            dangerMode         : true,
        }).then((willDelete) => {
            if (willDelete) {
                self.parents(".delete_form").submit();
            }
        })
    });
});

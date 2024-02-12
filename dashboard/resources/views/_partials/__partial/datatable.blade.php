@section('page-style')
  <link rel="stylesheet" href="{{ asset('css/bootstrap.min.css') }}" />
  <link rel="stylesheet" href="{{ asset('css/dataTables.bootstrap5.min.css') }}" />
@endsection

@section('vendor-script')
  <script src="{{ asset('js/jquery.min.js') }}"></script>
  <script src="{{ asset('js/jquery-ui.min.js') }}"></script>
  <script src="{{ asset('js/datatables.min.js') }}"></script>
  <script>
      $(document).ready( function () {
          $('#table-data').DataTable({
              stateSave: true,
              "language": {
                  "decimal":        "",
                  "emptyTable":     "Tidak ada data pada tabel",
                  "info":           "Menampilkan _START_ sampai _END_ dari _TOTAL_ total data",
                  "infoEmpty":      "Tidak ada yang ditampilkan",
                  "infoFiltered":   "(Terfilter dari  _MAX_ total entitas)",
                  "infoPostFix":    "",
                  "thousands":      ",",
                  "lengthMenu":     "Menampilkan _MENU_ entitas",
                  "loadingRecords": "Loading...",
                  "processing":     "Sedang dalam proses...",
                  "search":         "Pencarian:",
                  "zeroRecords":    "Tidak ada data yang cocok",
                  "paginate": {
                      "first":      "Pertama",
                      "last":       "Terakhir",
                      "next":       "Selanjutnya",
                      "previous":   "Sebelumnya"
                  },
                  "aria": {
                      "sortAscending":  ": activate to sort column ascending",
                      "sortDescending": ": activate to sort column descending"
                  }
              }
          } );
      });
  </script>

  <script>
    $(document).ready( function () {
      $('#tahun').on('change',function () {
        this.form.submit();
      });
    });
  </script>
@endsection

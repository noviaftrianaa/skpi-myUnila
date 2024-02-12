@push('css')
    <link href="{{asset('node_modules/bootstrap-iconpicker/dist/css/bootstrap-iconpicker.min.css')}}" rel="stylesheet">
@endpush

@push('js')
    <script type="text/javascript" src="{{ asset('node_modules/bootstrap-iconpicker/dist/js/bootstrap-iconpicker.bundle.min.js')}}"></script>
    <script>
        $('#icon-button').iconpicker().on('change', function(e) {
            console.log('a')
            $('#icon').val(e.icon);
        });
    </script>
@endpush

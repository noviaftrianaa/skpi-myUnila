@push('css')
<link href="{{asset('bower_components/fontawesome-iconpicker/dist/css/fontawesome-iconpicker.min.css')}}" rel="stylesheet">
@endpush

@push('js')
<script type="text/javascript" src="{{ asset('bower_components/fontawesome-iconpicker/dist/js/fontawesome-iconpicker.js')}}"></script>
<script>
    $(function(){
        $('#icon').iconpicker();
    });
</script>
@endpush

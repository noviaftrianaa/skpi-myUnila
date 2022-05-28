@push('js')
<script type="text/javascript" src="{{ asset('node_modules/select2/dist/js/select2.full.min.js') }}"></script>
<script>
    $('select').select2({ width: '100%' });
</script>
@endpush
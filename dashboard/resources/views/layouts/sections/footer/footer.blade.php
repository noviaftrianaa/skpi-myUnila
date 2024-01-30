@php
$containerFooter = (isset($configData['contentLayout']) && $configData['contentLayout'] === 'compact') ? 'container-xxl' : 'container-fluid';
@endphp

<!-- Footer-->
<footer class="content-footer footer bg-footer-theme">
  <div class="{{ $containerFooter }}">
    <div class="footer-container d-flex align-items-center justify-content-between py-2 flex-md-row flex-column">
      <div>
        © <script>
          document.write(new Date().getFullYear())

      </script>
      </div>
      <div class="d-none d-lg-inline-block">
        Created by <a href="{{ (!empty(config('variables.unitUrl')) ? config('variables.unitUrl') : '') }}" target="_blank" class="fw-medium">{{ (!empty(config('variables.unitName')) ? config('variables.unitName') : '') }}</a>
      </div>
    </div>
  </div>
</footer>
<!--/ Footer-->

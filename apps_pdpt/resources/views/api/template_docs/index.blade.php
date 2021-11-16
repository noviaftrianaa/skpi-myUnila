<?php
// copy from api-spec to public directory
$spec_file = realpath(__DIR__ . '/../../../contract/openapi.yml');
$public_dir = realpath(__DIR__ . '/../../../public');

copy($spec_file, $public_dir . '/wsv1.yaml');

$base = url('/');

?>
<!doctype html> <!-- Important: must specify -->
<html>
<head>
    <base href="<?php echo $base; ?>">
    <meta charset="utf-8"> <!-- Important: rapi-doc uses utf8 charecters -->
    <script type="module" src="https://unpkg.com/rapidoc/dist/rapidoc-min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;600&family=Open+Sans:wght@300;600&family=Roboto+Mono&display=swap" rel="stylesheet">
</head>
<body>
<rapi-doc
    spec-url="https://raw.githubusercontent.com/mrin9/RapiDoc/master/docs/specs/petstore_extended.yaml"
    theme = "dark"
> </rapi-doc>
<rapi-doc
    spec-url="/wsv1.yaml"
    show-header="false"
    theme="light"
    regular-font="Nunito"
    mono-font="Roboto Mono"
    font-size="large"
    schema-style="table"
    default-schema-tab="example"
>
    <div slot="nav-logo" style="display: flex; align-items: center; justify-content: center;">
        <img src = "/logo.png" style="width:40px; margin-right: 20px"> <span style="color:#fff"> SISTER WS </span>
    </div>
</rapi-doc>
</body>
</html>

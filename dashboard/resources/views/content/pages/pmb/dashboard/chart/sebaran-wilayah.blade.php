<script type="text/javascript">
    'use strict';

    function renderSebaranWilayah(data) {

        if (window.mapSebaranWilayah) {
            window.mapSebaranWilayah.remove();
        }

        var map = L.map('sebaran-wilayah').setView([-0.789275, 113.921327], 5);

        window.mapSebaranWilayah = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        data.wilayah.forEach(function (item) {
            if (item.lat && item.lon) {
                L.marker([item.lat, item.lon])
                    .bindPopup(`<strong>${item.name}</strong><br>Total Peserta: ${item.total}`)
                    .addTo(map);
            }
        });
    }
</script>

<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use DB;

class UpdateLatLonPengumumanSeeder extends Seeder
{
    public function run()
    {
        $pengumumanData = DB::table('temp_pmb.pengumuman')->whereNull('lat')->whereNull('lon')->get();
        $totalData = $pengumumanData->count();
        $nomorUrut = 1;

        foreach ($pengumumanData as $pengumuman) {
            $wilayah = $pengumuman->wil_tmpt_tinggal;
            $wilayah_bersih = $this->cleanAddress($wilayah);
            $koordinat = $this->getLatLonFromAddress($wilayah_bersih);

            if ($koordinat) {
                DB::table('temp_pmb.pengumuman')
                    ->where('id_pengumuman', $pengumuman->id_pengumuman)
                    ->whereNull('lat')
                    ->whereNull('lon')
                    ->update([
                        'lat' => $koordinat['lat'],
                        'lon' => $koordinat['lon']
                    ]);

                echo "Nomor: {$nomorUrut}/{$totalData} - Berhasil disimpan untuk wilayah: {$wilayah}\n";
            } else {
                echo "Nomor: {$nomorUrut}/{$totalData} - Gagal mendapatkan koordinat untuk wilayah: {$wilayah}\n";
            }

            $nomorUrut++;
        }
    }

    private function cleanAddress($address)
    {
        $address = preg_replace('/,\s*[^,]*$/', '', $address);
        $address = preg_replace('/([a-z])([A-Z])/', '$1 $2', $address);
        $address = preg_replace('/^(Kota|Kab\.)\s*/i', '', $address);
        $address = preg_replace('/,.*$/', '', $address);
        $address = preg_replace('/(D.K.I\.|D.I\.)\s*/i', '', $address);
        $address = preg_replace('/\.$/', '', $address);
        $address = preg_replace('/\s+/', ' ', $address);
        $address = trim($address);

        // Hapus nama tambahan atau spesifik dari alamat
        if (stripos($address, 'Hasudutan') !== false) {
            $address = preg_replace('/Hasudutan\s*/i', '', $address);
        }

        return $address;
    }


    // Fungsi untuk mendapatkan lat dan lon berdasarkan wilayah
    private function getLatLonFromAddress($wilayah)
    {
        $wilayah = urlencode($wilayah);
        $url = "https://nominatim.openstreetmap.org/search?q={$wilayah}&format=json&limit=1";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['User-Agent: Laravel Seeder']);
        $response = curl_exec($ch);

        if(curl_errno($ch)){
            echo 'cURL Error: ' . curl_error($ch);
            return null;
        }

        curl_close($ch);

        $data = json_decode($response, true);

        if (!empty($data) && isset($data[0]['lat']) && isset($data[0]['lon'])) {
            return [
                'lat' => $data[0]['lat'],
                'lon' => $data[0]['lon']
            ];
        }

        echo "Tidak ditemukan koordinat untuk wilayah: {$url}\n";
        return null;
    }

}

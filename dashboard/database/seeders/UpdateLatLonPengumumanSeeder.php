<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use DB;

class UpdateLatLonPengumumanSeeder extends Seeder
{
    public function run()
    {
        // Ambil data wilayah dari tabel pengumuman
        $pengumumanData = DB::table('temp_pmb.pengumuman')->get();

        foreach ($pengumumanData as $pengumuman) {
            $wilayah = $pengumuman->wil_tmpt_tinggal;
            $wilayah_bersih = $this->cleanAddress($wilayah);
            $koordinat = $this->getLatLonFromAddress($wilayah_bersih);

            if ($koordinat) {
                DB::table('temp_pmb.pengumuman')
                    ->where('id_pengumuman', $pengumuman->id_pengumuman)
                    ->update([
                        'lat' => $koordinat['lat'],
                        'lon' => $koordinat['lon']
                    ]);

                echo "Berhasil disimpan untuk wilayah: {$wilayah}\n";
            } else {
                echo "Gagal mendapatkan koordinat untuk wilayah: {$wilayah}\n";
            }
        }
    }

    private function cleanAddress($address)
    {
        return preg_replace('/^(Kota|Kab\.)\s*/i', '', $address);
    }

    // Fungsi untuk mendapatkan lat dan lon berdasarkan wilayah
    private function getLatLonFromAddress($wilayah)
    {
        $wilayah = urlencode($wilayah);
        $url = "https://nominatim.openstreetmap.org/search?q={$wilayah}&format=json&limit=1";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['User-Agent: Laravel Seeder']); // Tambahkan User-Agent
        $response = curl_exec($ch);

        // Check jika terjadi error pada cURL
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

        return null;
    }
}

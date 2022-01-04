<?php

if( !function_exists('TerbilangHarga') ) {
    function TerbilangHarga($angka)
    {
        $nilai = abs($angka);
        $huruf = array("", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas");
        $temp = "";
        if ($nilai < 12) {
            $temp = " ". $huruf[$nilai];
        } else if ($nilai <20) {
            $temp = TerbilangHarga($nilai - 10). " Belas";
        } else if ($nilai < 100) {
            $temp = TerbilangHarga($nilai/10)." Puluh". TerbilangHarga($nilai % 10);
        } else if ($nilai < 200) {
            $temp = " Seratus" . TerbilangHarga($nilai - 100);
        } else if ($nilai < 1000) {
            $temp = TerbilangHarga($nilai/100) . " Ratus" . TerbilangHarga($nilai % 100);
        } else if ($nilai < 2000) {
            $temp = " Seribu" . TerbilangHarga($nilai - 1000);
        } else if ($nilai < 1000000) {
            $temp = TerbilangHarga($nilai/1000) . " Ribu" . TerbilangHarga($nilai % 1000);
        } else if ($nilai < 1000000000) {
            $temp = TerbilangHarga($nilai/1000000) . " Juta" . TerbilangHarga($nilai % 1000000);
        } else if ($nilai < 1000000000000) {
            $temp = TerbilangHarga($nilai/1000000000) . " Milyar" . TerbilangHarga(fmod($nilai,1000000000));
        } else if ($nilai < 1000000000000000) {
            $temp = TerbilangHarga($nilai/1000000000000) . " Trilyun" . TerbilangHarga(fmod($nilai,1000000000000));
        }
        return $temp;
    }
}

function terbilang($nilai) {
    if($nilai<0) {
        $hasil = "Minus ". trim(TerbilangHarga($nilai));
    } else {
        $hasil = trim(TerbilangHarga($nilai));
    }
    return $hasil;
}

<?php

namespace App\Transformers;


class PesertaKelasTransformer
{
    private $function;
    private $data;

    public function __construct(string $func = "")
    {
        $this->function = strtolower(str_replace(" ", "", $func));;
    }

    public function setData($data): object
    {
        $this->data = (object) $data;
        return $this;
    }

    public function process(): array
    {
        $funName = 'transform_' . $this->function;
        $collection = collect($this->data);
        $collection->transform(function ($item, $key) use ($funName) {
            return $this->$funName($item);
        });
        return $collection->all();
    }

    public function transform_index(object $value): array
    {
        return [
            'id_kls' => $value->id_kls,
            'semester' => $value->nm_smt,
            'id_reg_pd' => $value->id_reg_pd,
            'npm' => $value->nipd,
            'nama_mahasiswa' => $value->nm_pd,
            'nilai_angka' => $value->nilai_angka,
            'nilai_huruf' => $value->nilai_huruf,
            'nilai_indeks' => $value->nilai_indeks,
            'prodi' => $value->nm_prodi,
            'nm_kelas' => $value->nm_kls,
            'mata_kuliah' => $value->nm_mk,
            'kode_mk' => $value->kode_mk,
            'sks_mk' => $value->sks_mk,
            'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($value->waktu_data_ditambahkan)),
            'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($value->terakhir_diubah))
        ];
    }

}

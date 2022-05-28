<?php

namespace App\Transformers;


class AktAjarDosenTransformer
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
            'id_ajar' => $value->id_ajar,
            'nm_dosen' => $value->nm_sdm,
            'nm_mk' => $value->nm_mk,
            'prodi' => $value->prodi,
            'sks_substansi_total' => $value->sks_subst_tot,
            'sks_tatap_muka_substansi' => $value->sks_tm_subst,
            'sks_praktikum_substansi' => $value->sks_prak_subst,
            'sks_praktikum_lap_substansi' => $value->sks_prak_lap_subst,
            'sks_sim_substansi' => $value->sks_sim_subst,
            'jml_tatap_muka_rencana' => $value->jml_tm_renc,
            'jml_tatap_muka_realisasi' => $value->jml_tm_real,
            'jml_mhs' => $value->jml_mhs,
            'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($value->waktu_data_ditambahkan)),
            'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($value->terakhir_diubah))
        ];
    }

}

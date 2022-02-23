<?php

namespace App\Transformers;

class PenelitianTransformer
{
    private $function;
    private $data;

    public function __construct(string $func = "")
    {
        $this->function = strtolower(str_replace(" ", "", $func));
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

    public function transform_list(object $value): array
    {
        return [
            'id' => $value->id_penelitian,
            'judul_penelitian' => $value->judul_penelitian,
            'bidang_keilmuan' => $value->bidang_keilmuan,
            'tahun_pelaksanaan' => $value->tahun_pelaksanaan,
            'lama_kegiatan' => $value->lama_kegiatan,
            'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($value->waktu_data_ditambahkan)),
            'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($value->terakhir_diubah))
        ];
    }

    public function transform_listbyid(object $value): array
    {
        return [
            'id_penelitian' => $value->id_penelitian,
            'judul_penelitian' => $value->judul_penelitian,
            'bidang_keilmuan' => $value->bidang_keilmuan,
            'tahun_pelaksanaan' => $value->tahun_pelaksanaan,
            'lama_kegiatan' => $value->lama_kegiatan,
            'waktu_data_ditambahkan' => date('Y-m-d H:i:s', strtotime($value->waktu_data_ditambahkan)),
            'terakhir_diubah' => date('Y-m-d H:i:s', strtotime($value->terakhir_diubah))
        ];
    }
}

<?php

class LiveController
{
    /**
     * @OA\Info(
     *      version="0.1.0",
     *      title="One Data UNILA - Live Web Service",
     *      description="Versi 0.1.0",
     *      @OA\Contact(
     *          email="mahendra.pratama15@eng.unila.ac.id"
     *      )
     * )
     *
     * @OA\Server(
     *      url=L5_SWAGGER_CONST_HOST_LIVE,
     *      description="Server Live",
     * )

     *
     * @OA\Tag(
     *     name="Overview",
     *     description="Web service ini digunakan oleh pengembang perangkat lunak atau admin perguruan tinggi untuk mengakses data pada PDUT. Web service ini tidak ditujukan untuk individu dosen karena menggunakan hak akses admin dan dapat mengakses data seluruh dosen pada perguruan tinggi yang bersangkutan."
     * )
     * @OA\Tag(
     *     name="Format Data",
     *     description="Seluruh data menggunakan format JSON untuk request dan response. Terdapat pengecualian pada endpoint terkait dokumen. Upload dokumen menggunakan format multipart/form-data untuk mengirimkan isi dokumen dalam bentuk binary. Download dokumen akan mengembalikan isi dokumen dalam bentuk binary sesuai mime type dokumen. Sebagian besar ID data menggunakan format UUID (00000000-0000-0000-0000-000000000000) lowercase. Seluruh tanggal untuk request maupun response menggunakan format yyyy-mm-dd. Angka menggunakan titik . untuk pemisah desimal. Field request yang sifatnya opsional dapat diisi dengan null, 0, atau array kosong [] sesuai tipe datanya. Tidak diperkenankan menambahkan atau mengurangi field JSON pada request karena berpotensi mengakibatkan error.."
     * )
     *
     */
}

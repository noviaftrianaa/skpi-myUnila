<?php

namespace Tests\Unit;

use App\Services\PayloadTransformer;
use Illuminate\Support\Facades\DB;
use Mockery;
use Tests\TestCase;

/**
 * Unit test PayloadTransformer.
 *
 * Strategy: mock DB facade — kita gak butuh DB real karena SUT cuma
 * mentransform row hasil DB::selectOne / DB::select ke array payload
 * sesuai schema SIMKATMAWA. Test focus: enum mapping benar + struktur
 * payload sesuai contract.
 */
class PayloadTransformerTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_transform_prestasi_mandiri_returns_simkatmawa_payload_structure(): void
    {
        $idPrestasi = '11111111-1111-1111-1111-111111111111';

        $row = (object) [
            'id_prestasi_mandiri' => $idPrestasi,
            'thn_prestasi'        => 2024,
            'lomba'               => 'Lomba Karya Tulis Ilmiah Nasional',
            'cabang'              => 'Karya Ilmiah',
            'penyelenggara'       => 'Kementerian Pendidikan',
            'jumlah_unit_peserta' => 50,
            'url_peserta'         => 'https://example.com/peserta.pdf',
            'url_sertifikat'      => 'https://example.com/cert.pdf',
            'tgl_sertifikat'      => '2024-08-15',
            'url_foto_upp'        => null,
            'url_dokumen_undangan'=> null,
            'keterangan'          => 'Lomba tahunan',
            'level'               => 'NAS',
            'kategori'            => 'RISNOV',
            'peringkat'           => 'JUARA1',
            'kelompok_prestasi'   => 'KELOMPOK',
            'bentuk'              => 'LURING',
        ];

        DB::shouldReceive('selectOne')
            ->once()
            ->andReturn($row);

        DB::shouldReceive('select')
            ->andReturnUsing(function ($sql) {
                if (str_contains($sql, 'peserta_mhs')) {
                    return [
                        (object) ['nim' => '2014011001', 'nama' => 'Andi Mahasiswa'],
                        (object) ['nim' => '2014011002', 'nama' => 'Budi Mahasiswa'],
                    ];
                }
                if (str_contains($sql, 'peserta_dosen')) {
                    return [
                        (object) ['nuptk' => '199001011990011001', 'nama' => 'Dr. Pendamping', 'url_surat_tugas' => 'https://example.com/st.pdf'],
                    ];
                }
                return [];
            });

        $t = new PayloadTransformer();
        $payload = $t->transformPrestasiMandiri($idPrestasi);

        // Verify struktur sesuai SIMKATMAWA POST /api/prestasi-mandiri
        $this->assertSame('NAS', $payload['level']);
        $this->assertSame('RISNOV', $payload['kategori']);
        $this->assertSame('Lomba Karya Tulis Ilmiah Nasional', $payload['lomba']);
        $this->assertSame('Karya Ilmiah', $payload['cabang']);
        $this->assertSame('Kementerian Pendidikan', $payload['penyelenggara']);
        $this->assertSame('JUARA1', $payload['peringkat']);
        $this->assertSame('50', $payload['jumlah_unit_peserta']); // SIMKATMAWA expect string
        $this->assertSame('KELOMPOK', $payload['kelompok_prestasi']);
        $this->assertSame('LURING', $payload['bentuk']);
        $this->assertSame('2024-08-15', $payload['tgl_sertifikat']);

        // Mahasiswa array
        $this->assertCount(2, $payload['mahasiswa']);
        $this->assertSame(['nim' => '2014011001', 'nama' => 'Andi Mahasiswa'], $payload['mahasiswa'][0]);

        // Dosen array
        $this->assertCount(1, $payload['dosen']);
        $this->assertSame('199001011990011001', $payload['dosen'][0]['nuptk']);
        $this->assertSame('https://example.com/st.pdf', $payload['dosen'][0]['url_surat_tugas']);
    }

    public function test_transform_prestasi_mandiri_throws_when_record_not_found(): void
    {
        DB::shouldReceive('selectOne')->once()->andReturn(null);

        $t = new PayloadTransformer();
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessageMatches('/tidak ditemukan/');
        $t->transformPrestasiMandiri('11111111-1111-1111-1111-111111111111');
    }

    public function test_transform_prestasi_mandiri_throws_when_enum_kosong(): void
    {
        $row = (object) [
            'id_prestasi_mandiri' => '...',
            'thn_prestasi' => 2024, 'lomba' => 'X', 'cabang' => '', 'penyelenggara' => 'X',
            'jumlah_unit_peserta' => 1, 'url_peserta' => null, 'url_sertifikat' => null,
            'tgl_sertifikat' => '2024-01-01', 'url_foto_upp' => null, 'url_dokumen_undangan' => null,
            'keterangan' => null,
            'level' => 'NAS', 'kategori' => null, // ← kategori kosong
            'peringkat' => 'JUARA1', 'kelompok_prestasi' => 'INDIVIDU', 'bentuk' => 'LURING',
        ];

        DB::shouldReceive('selectOne')->once()->andReturn($row);

        $t = new PayloadTransformer();
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessageMatches('/kategori.*kosong/');
        $t->transformPrestasiMandiri('aaa');
    }

    public function test_transform_sertifikasi_returns_correct_payload(): void
    {
        $row = (object) [
            'id_sertifikasi' => 'ss',
            'thn_prestasi' => 2024,
            'nama' => 'Sertifikasi Programmer',
            'penyelenggara' => 'BNSP',
            'url_peserta' => null,
            'url_sertifikat' => 'https://example.com/cert.pdf',
            'tgl_sertifikat' => '2024-09-10',
            'url_foto_upp' => null,
            'url_dokumen_undangan' => null,
            'keterangan' => null,
            'level' => 'NAS',
        ];

        DB::shouldReceive('selectOne')->once()->andReturn($row);
        DB::shouldReceive('select')->andReturn([]);

        $t = new PayloadTransformer();
        $payload = $t->transformSertifikasi('ss');

        $this->assertSame('NAS', $payload['level']);
        $this->assertSame('Sertifikasi Programmer', $payload['nama']);
        $this->assertSame('BNSP', $payload['penyelenggara']);
        $this->assertSame('2024-09-10', $payload['tgl_sertifikat']);
        $this->assertSame([], $payload['mahasiswa']);
        $this->assertSame([], $payload['dosen']);
    }

    public function test_transform_rekognisi_includes_jenis_rekognisi(): void
    {
        $row = (object) [
            'id_rekognisi' => 'rr',
            'thn_prestasi' => 2024,
            'nama' => 'Visiting Scholar di MIT',
            'penyelenggara' => 'MIT',
            'url_peserta' => null,
            'url_sertifikat' => null,
            'tgl_sertifikat' => '2024-12-01',
            'url_foto_upp' => null,
            'url_dokumen_undangan' => null,
            'keterangan' => null,
            'level' => 'INT',
            'jenis_rekognisi' => 'VISITING_SCHOLAR',
        ];

        DB::shouldReceive('selectOne')->once()->andReturn($row);
        DB::shouldReceive('select')->andReturn([]);

        $t = new PayloadTransformer();
        $payload = $t->transformRekognisi('rr');

        $this->assertSame('INT', $payload['level']);
        $this->assertSame('VISITING_SCHOLAR', $payload['jenis_rekognisi']);
        $this->assertSame('MIT', $payload['penyelenggara']);
    }
}

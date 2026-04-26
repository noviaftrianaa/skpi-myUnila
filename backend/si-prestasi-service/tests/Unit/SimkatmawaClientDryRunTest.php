<?php

namespace Tests\Unit;

use App\Services\ApiConfigService;
use App\Services\SimkatmawaClient;
use Mockery;
use Tests\TestCase;

/**
 * Unit test SimkatmawaClient — fokus dry-run path supaya tidak ada
 * network call ke SIMKATMAWA real saat run test.
 */
class SimkatmawaClientDryRunTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_ping_returns_dry_run_when_force_dry_run_active(): void
    {
        config(['simkatmawa.force_dry_run' => true]);

        $apiConfig = Mockery::mock(ApiConfigService::class);
        $apiConfig->shouldReceive('get')->andReturn([
            'username' => 'u', 'password' => 'p', 'base_url' => 'https://x.test',
            'auth_login_path' => '/api/login', 'timeout' => 30, 'a_dry_run' => false,
        ]);

        $client = new SimkatmawaClient($apiConfig);
        $r = $client->ping();

        $this->assertTrue($r['ok']);
        $this->assertTrue($r['dry_run']);
        $this->assertStringContainsString('dry_run', $r['message']);
    }

    public function test_ping_returns_error_when_api_config_missing(): void
    {
        config(['simkatmawa.force_dry_run' => false]);

        $apiConfig = Mockery::mock(ApiConfigService::class);
        $apiConfig->shouldReceive('get')->andReturn(null);

        $client = new SimkatmawaClient($apiConfig);
        $r = $client->ping();

        $this->assertFalse($r['ok']);
        $this->assertStringContainsString('api_config', $r['message']);
    }

    public function test_submit_prestasi_mandiri_returns_dry_run_echo_when_active(): void
    {
        config(['simkatmawa.force_dry_run' => true]);

        $apiConfig = Mockery::mock(ApiConfigService::class);
        $apiConfig->shouldReceive('get')->andReturn([
            'username' => 'u', 'password' => 'p', 'base_url' => 'https://x.test',
            'auth_login_path' => '/api/login', 'timeout' => 30, 'a_dry_run' => false,
        ]);

        $client = new SimkatmawaClient($apiConfig);
        $payload = [
            'level' => 'NAS', 'kategori' => 'RISNOV', 'lomba' => 'X',
            'cabang' => 'Y', 'penyelenggara' => 'Z', 'peringkat' => 'JUARA1',
            'jumlah_unit_peserta' => '10', 'kelompok_prestasi' => 'INDIVIDU',
            'bentuk' => 'LURING', 'tgl_sertifikat' => '2024-01-01',
            'mahasiswa' => [['nim' => '123', 'nama' => 'Test']],
        ];
        $r = $client->submitPrestasiMandiri($payload);

        $this->assertTrue($r['ok']);
        $this->assertTrue($r['dry_run']);
        $this->assertSame(200, $r['http_status']);
        $this->assertArrayHasKey('echo', $r['response_body']);
        $this->assertSame($payload, $r['response_body']['echo']);
    }
}

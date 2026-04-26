<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Queue;
use Mockery;
use Tests\TestCase;

/**
 * Feature test SyncController.
 *
 * Test scope:
 *   - Submit endpoint validate state (cuma 'ready'/'error' yang boleh di-submit)
 *   - Submit dispatch SubmitToSimkatmawaJob ke queue
 *   - Submit return 404 kalau record tidak ditemukan
 *
 * Mock JWT middleware via Route facade agar tidak butuh auth real.
 */
class SyncControllerTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Bypass jwt.auth middleware untuk test ini.
        $this->withoutMiddleware(\App\Http\Middleware\JwtAuthenticate::class);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    public function test_submit_returns_400_for_invalid_type(): void
    {
        $r = $this->postJson('/api/v1/sync/submit/foo/abc-123');
        $r->assertStatus(400);
        $r->assertJsonFragment(['success' => false]);
    }

    public function test_submit_returns_404_when_record_not_found(): void
    {
        DB::shouldReceive('selectOne')
            ->once()
            ->andReturn(null);

        $r = $this->postJson('/api/v1/sync/submit/prestasi/00000000-0000-0000-0000-000000000099');
        $r->assertStatus(404);
        $r->assertJsonFragment(['success' => false]);
    }

    public function test_submit_returns_409_when_state_not_ready_or_error(): void
    {
        DB::shouldReceive('selectOne')
            ->once()
            ->andReturn((object) ['id' => 'x', 'status_workflow' => 'draft']);

        $r = $this->postJson('/api/v1/sync/submit/prestasi/00000000-0000-0000-0000-000000000088');
        $r->assertStatus(409);
        $r->assertJsonFragment(['success' => false]);
        $this->assertStringContainsString("'draft'", $r->json('message'));
    }

    public function test_submit_dispatches_job_and_returns_202_when_state_ready(): void
    {
        Queue::fake();

        DB::shouldReceive('selectOne')
            ->once()
            ->andReturn((object) ['id' => 'x', 'status_workflow' => 'ready']);

        $r = $this->postJson('/api/v1/sync/submit/prestasi/abc-id-123');
        $r->assertStatus(202);
        $r->assertJsonPath('success', true);
        $r->assertJsonPath('data.parent_tipe', 'PRESTASI');

        Queue::assertPushed(\App\Jobs\SubmitToSimkatmawaJob::class, function ($job) {
            return $job->idParent === 'abc-id-123' && $job->parentTipe === 'PRESTASI';
        });
    }

    public function test_submit_also_works_for_state_error_for_retry(): void
    {
        Queue::fake();

        DB::shouldReceive('selectOne')
            ->once()
            ->andReturn((object) ['id' => 'x', 'status_workflow' => 'error']);

        $r = $this->postJson('/api/v1/sync/submit/sertifikasi/zzz');
        $r->assertStatus(202);
        Queue::assertPushed(\App\Jobs\SubmitToSimkatmawaJob::class);
    }
}

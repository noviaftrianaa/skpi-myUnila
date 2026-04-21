<?php

namespace App\Services;

use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Contracts\Encryption\DecryptException;

/**
 * ApiConfigService — reader/writer untuk tabel setting.api_config.
 *
 * Encapsulate logic decrypt kolom auth_*_encrypted sehingga caller (SimkatmawaClient)
 * tidak perlu tahu soal Crypt. Cache result sementara di memory per-request.
 */
class ApiConfigService
{
    /** @var array<string,array<string,mixed>> per-request memoization */
    protected array $cache = [];

    /**
     * Ambil config by kode. Cache in-memory per request.
     * Return null kalau tidak ada atau a_active=false.
     */
    public function get(string $kode): ?array
    {
        if (isset($this->cache[$kode])) {
            return $this->cache[$kode];
        }

        $row = DB::connection('pgsql')
            ->table('setting.api_config')
            ->where('kode', $kode)
            ->where('a_active', true)
            ->first();

        if (!$row) {
            Log::warning("api_config kode '{$kode}' tidak ditemukan atau non-aktif");
            return null;
        }

        $config = [
            'kode'             => $row->kode,
            'nm_api'           => $row->nm_api,
            'base_url'         => rtrim($row->base_url, '/'),
            'auth_type'        => $row->auth_type,
            'auth_login_path' => $row->auth_login_path,
            'username'         => $this->decryptIfSet($row->auth_username_encrypted),
            'password'         => $this->decryptIfSet($row->auth_password_encrypted),
            'api_key'          => $this->decryptIfSet($row->auth_api_key_encrypted),
            'extra'            => $row->auth_extra ? json_decode($row->auth_extra, true) : [],
            'kode_pt'          => $row->kode_pt,
            'rate_limit'       => (int) $row->rate_limit_per_min,
            'timeout'          => (int) $row->timeout_seconds,
            'retry'            => $row->retry_policy ? json_decode($row->retry_policy, true) : [],
            'a_dry_run'        => (bool) $row->a_dry_run,
        ];

        return $this->cache[$kode] = $config;
    }

    /**
     * Update credential (email/password). Value akan di-encrypt sebelum disimpan.
     * Pass null untuk tidak ubah (misal user cuma update password, kosongkan username).
     * Return id_api_config atau throw.
     */
    public function updateCredentials(string $kode, ?string $username, ?string $password, ?string $apiKey, ?string $actorUuid = null, ?string $actorName = null): string
    {
        $row = DB::connection('pgsql')
            ->table('setting.api_config')
            ->where('kode', $kode)
            ->first();

        if (!$row) {
            throw new \DomainException("api_config kode '{$kode}' tidak ada — seed dulu via SQL");
        }

        $updates = ['updated_at' => now()];
        $fieldsChanged = [];

        if ($username !== null && $username !== '') {
            $updates['auth_username_encrypted'] = Crypt::encryptString($username);
            $fieldsChanged[] = 'auth_username_encrypted';
        }
        if ($password !== null && $password !== '') {
            $updates['auth_password_encrypted'] = Crypt::encryptString($password);
            $fieldsChanged[] = 'auth_password_encrypted';
        }
        if ($apiKey !== null && $apiKey !== '') {
            $updates['auth_api_key_encrypted'] = Crypt::encryptString($apiKey);
            $fieldsChanged[] = 'auth_api_key_encrypted';
        }

        if (count($updates) === 1) {
            return $row->id_api_config; // nothing changed
        }

        DB::connection('pgsql')
            ->table('setting.api_config')
            ->where('id_api_config', $row->id_api_config)
            ->update($updates);

        // Audit log
        foreach ($fieldsChanged as $field) {
            DB::connection('pgsql')->table('setting.api_config_log')->insert([
                'id_api_config_log' => DB::raw('gen_random_uuid()'),
                'id_api_config'     => $row->id_api_config,
                'action'            => str_contains($field, 'password') ? 'ROTATE_PASSWORD' : (str_contains($field, 'api_key') ? 'ROTATE_API_KEY' : 'UPDATE'),
                'field_changed'     => $field,
                'id_actor'          => $actorUuid ?: '00000000-0000-0000-0000-000000000000',
                'nm_actor'          => $actorName ?: 'system',
                'created_at'        => now(),
            ]);
        }

        // Invalidate memoization
        unset($this->cache[$kode]);

        return $row->id_api_config;
    }

    /**
     * Toggle a_dry_run / a_active.
     */
    public function toggleFlag(string $kode, string $flag, bool $value, ?string $actorUuid = null, ?string $actorName = null): void
    {
        if (!in_array($flag, ['a_dry_run', 'a_active'], true)) {
            throw new \InvalidArgumentException("flag harus a_dry_run atau a_active");
        }

        $row = DB::connection('pgsql')
            ->table('setting.api_config')
            ->where('kode', $kode)
            ->first();

        if (!$row) return;

        DB::connection('pgsql')
            ->table('setting.api_config')
            ->where('id_api_config', $row->id_api_config)
            ->update([$flag => $value, 'updated_at' => now()]);

        DB::connection('pgsql')->table('setting.api_config_log')->insert([
            'id_api_config_log' => DB::raw('gen_random_uuid()'),
            'id_api_config'     => $row->id_api_config,
            'action'            => $flag === 'a_dry_run' ? 'TOGGLE_DRY_RUN' : 'TOGGLE_ACTIVE',
            'field_changed'     => $flag,
            'id_actor'          => $actorUuid ?: '00000000-0000-0000-0000-000000000000',
            'nm_actor'          => $actorName ?: 'system',
            'created_at'        => now(),
        ]);

        unset($this->cache[$kode]);
    }

    protected function decryptIfSet(?string $encrypted): ?string
    {
        if (!$encrypted) return null;
        try {
            return Crypt::decryptString($encrypted);
        } catch (DecryptException $e) {
            Log::error("Gagal decrypt api_config value: " . $e->getMessage());
            return null;
        }
    }
}

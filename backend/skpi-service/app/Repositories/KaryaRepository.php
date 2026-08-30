<?php

namespace App\Repositories;

use App\Models\Karya;

class KaryaRepository extends BaseRepository
{
    public function getByNim(string $nim)
    {
        return Karya::where('nim', $nim)
            ->orderByDesc('created_at')
            ->get();
    }

    public function find(int $id): ?Karya
    {
        return Karya::find($id);
    }

    public function create(array $data): Karya
    {
        return Karya::create($data);
    }

    public function update(int $id, array $data): ?Karya
    {
        $karya = Karya::find($id);

        if (!$karya) {
            return null;
        }

        $karya->update($data);

        return $karya->fresh();
    }

    public function delete(int $id): bool
    {
        $karya = Karya::find($id);

        if (!$karya) {
            return false;
        }

        return (bool) $karya->delete();
    }

    public function countByNim(string $nim): int
    {
        return Karya::where('nim', $nim)->count();
    }
}
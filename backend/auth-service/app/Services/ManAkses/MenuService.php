<?php

namespace App\Services\ManAkses;

use App\Repositories\ManAkses\MenuRepository;

/**
 * Menu Service
 * Business logic for menu management
 */
class MenuService
{
    public function __construct(
        protected MenuRepository $repository
    ) {}

    /**
     * Get paginated list of all menus
     *
     * @param array $params
     * @return array
     */
    public function getList(array $params = []): array
    {
        return $this->repository->getList($params);
    }

    /**
     * Get menus by aplikasi with tree structure
     *
     * @param string $idAplikasi
     * @param array $params
     * @return array
     */
    public function getByAplikasi(string $idAplikasi, array $params = []): array
    {
        return $this->repository->getByAplikasi($idAplikasi, $params);
    }

    /**
     * Get flat list of menus by aplikasi
     *
     * @param string $idAplikasi
     * @return array
     */
    public function getFlatByAplikasi(string $idAplikasi): array
    {
        return $this->repository->getFlatByAplikasi($idAplikasi);
    }

    /**
     * Get menu detail
     *
     * @param string $id
     * @return object|null
     */
    public function getDetail(string $id): ?object
    {
        return $this->repository->getDetail($id);
    }

    /**
     * Get role assignments for a menu
     *
     * @param string $idMenu
     * @return array
     */
    public function getMenuRoles(string $idMenu): array
    {
        return $this->repository->getMenuRoles($idMenu);
    }

    /**
     * Create new menu
     *
     * @param array $data
     * @return array
     */
    public function create(array $data): array
    {
        $id = $this->repository->create($data);
        $menu = $this->repository->getDetail($id);

        return [
            'success' => true,
            'menu' => $menu,
        ];
    }

    /**
     * Update menu
     *
     * @param string $id
     * @param array $data
     * @return array
     */
    public function update(string $id, array $data): array
    {
        // Check if menu exists
        $existing = $this->repository->getDetail($id);
        if (!$existing) {
            return [
                'success' => false,
                'message' => 'Menu tidak ditemukan',
            ];
        }

        $this->repository->update($id, $data);
        $menu = $this->repository->getDetail($id);

        return [
            'success' => true,
            'menu' => $menu,
        ];
    }

    /**
     * Delete menu
     *
     * @param string $id
     * @return array
     */
    public function delete(string $id): array
    {
        // Check if menu exists
        $existing = $this->repository->getDetail($id);
        if (!$existing) {
            return [
                'success' => false,
                'message' => 'Menu tidak ditemukan',
            ];
        }

        $this->repository->delete($id);

        return [
            'success' => true,
            'message' => 'Menu berhasil dihapus',
        ];
    }

    /**
     * Sync menus from frontend config
     *
     * @param string $idAplikasi
     * @param array $menus
     * @return array
     */
    public function syncMenus(string $idAplikasi, array $menus): array
    {
        $stats = $this->repository->syncMenus($idAplikasi, $menus);

        return [
            'success' => true,
            'stats' => $stats,
            'menus' => $this->repository->getByAplikasi($idAplikasi),
        ];
    }

    /**
     * Get menu statistics
     *
     * @param string|null $idAplikasi
     * @return object
     */
    public function getStats(?string $idAplikasi = null): object
    {
        return $this->repository->getStats($idAplikasi);
    }
}

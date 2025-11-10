<?php

namespace App\Http\Controllers;

use App\Services\BidangIlmuService;
use Illuminate\Http\Request;

class BidangIlmuDetailController extends Controller
{
    protected $service;

    public function __construct(BidangIlmuService $service)
    {
        $this->service = $service;
    }

    /**
     * Search bidang ilmu
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        $search = $request->query('search', '');
        $page = (int) $request->query('page', 1);
        $limit = (int) $request->query('limit', 20);

        $result = $this->service->searchBidangIlmu($search, $page, $limit);

        return response()->json($result);
    }

    /**
     * Get bidang ilmu detail by ID
     *
     * @param string $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $id)
    {
        $result = $this->service->getBidangIlmuDetail($id);

        $statusCode = $result['success'] ? 200 : 404;

        return response()->json($result, $statusCode);
    }
}

<?php

namespace App\Services;

use Illuminate\Pagination\LengthAwarePaginator;
use Arr;
use DB;

class QueryPagination
{
    public function __construct(private string $query = "", private int $maxPage = 50, private array $result = [])
    {
        $this->execute();
    }

    public function execute()
    {
        $page = 1;
        $count = 10;

        if (request()->has('page')) {
            if (!empty(request()->input('page'))) {
                $page = request()->input('page');
            }
        }

        if (request()->has('limit')) {
            if (!empty(request()->input('limit'))) {
                if (request()->input('limit') > $this->maxPage) {
                    $count = $this->maxPage;
                } else {
                    $count = request()->input('limit');
                }
            }
        }

        $paginationTop = "DECLARE @PageNumber AS INT
        DECLARE @RowsOfPage AS INT
        SET @PageNumber= $page
        SET @RowsOfPage= $count";

        $paginationBottom = " OFFSET (@PageNumber-1)*@RowsOfPage ROWS
        FETCH NEXT @RowsOfPage ROWS ONLY";

        $query = $paginationTop . $this->query . $paginationBottom;
        $query = str_replace("\r\n", "\r", $query);

        $query = DB::select($query);

        $pagination = new LengthAwarePaginator(collect($query), count($query), $count, $page, ['path' => request()->url(), 'query' => request()->query()]);
        $pagination = $pagination->toArray();
        $data = Arr::only($pagination, 'data');
        Arr::forget($pagination, 'data');

        $this->result = [
            'data' => empty($data['data']) ? [] : $data['data'],
            'pagination' => $pagination
        ];

        return $this;
    }

    public function query()
    {
        return $this->result['data'];
    }

    public function pagination()
    {
        return $this->result['pagination'];
    }
}

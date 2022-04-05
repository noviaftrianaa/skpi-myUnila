<?php

if (!function_exists('CustomPagination')) {
    function CustomPagination($query = "", $maxPage = 50)
    {
        $page = 1;
        $limit = 10;

        if (request()->has('page')) {
            if (!empty(request()->input('page'))) {
                $page = request()->input('page');
            }
        }

        if (request()->has('limit')) {
            if (!empty(request()->input('limit'))) {
                if (request()->input('limit') > $maxPage) {
                    $limit = $maxPage;
                } else {
                    $limit = request()->input('limit');
                }
            }
        }

        $paginationTop = "DECLARE @PageNumber AS INT
        DECLARE @RowsOfPage AS INT
        SET @PageNumber= $page
        SET @RowsOfPage= $limit";

        $paginationBottom = "OFFSET (@PageNumber-1)*@RowsOfPage ROWS
        FETCH NEXT @RowsOfPage ROWS ONLY";

        $query = "$paginationTop$query$paginationBottom";
        $query = str_replace("\r\n", "\r", $query);

        return [
            'query' => $query,
            'page' => $page,
            'limit' => $limit
        ];
    }
}

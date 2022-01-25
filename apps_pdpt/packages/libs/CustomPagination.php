<?php

if (!function_exists('CustomPagination')) {
    function CustomPagination($query = "", $maxPage = 50)
    {
        $page = 1;
        $count = 10;

        if (request()->has('page')) {
            if (!empty(request()->input('page'))) {
                $page = request()->input('page');
            }
        }

        if (request()->has('count')) {
            if (!empty(request()->input('count'))) {
                if (request()->input('count') > $maxPage) {
                    $count = $maxPage;
                } else {
                    $count = request()->input('count');
                }
            }
        }

        $paginationTop = "DECLARE @PageNumber AS INT
        DECLARE @RowsOfPage AS INT
        SET @PageNumber= $page
        SET @RowsOfPage= $count";

        $paginationBottom = "OFFSET (@PageNumber-1)*@RowsOfPage ROWS
        FETCH NEXT @RowsOfPage ROWS ONLY";

        $query = "$paginationTop$query$paginationBottom";
        $query = str_replace("\r\n", "\r", $query);

        return [
            'query' => $query,
            'page' => $page,
            'count' => $count
        ];
    }
}

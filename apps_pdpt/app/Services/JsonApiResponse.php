<?php

namespace App\Services;

use Exception;

class JsonApiResponse
{
    private $statusCode;
    private $message;
    private $error;
    private $isSuccess;
    private $pagination;
    private $simplePagination;
    private $transform;

    public function __construct()
    {
        $this->statusCode = 200;
        $this->isSuccess = TRUE;
        $this->pagination = [];
        $this->simplePagination = FALSE;
    }

    public function setTransformer(object $transform, string $callableFun = NULL): object
    {
        try {
            if (!is_null($callableFun)) {
                $callableFun = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 2)[1]['function'];
                logger()->info($callableFun);
            }
            $this->transform = new $transform($callableFun);
            return $this;
        } catch (Exception $e) {
            throw new Exception("Error Processing Transformer " . $e->getMessage(), 1);
        }
    }

    public function setStatusCode(int $statusCode): object
    {
        $this->statusCode = $statusCode;
        return $this;
    }

    public function setMessage(string $message = NULL): object
    {
        $this->message = $message;
        return $this;
    }

    public function setError(string $error = NULL): object
    {
        $this->error = [
            'type' => $this->message,
            'message' => $error
        ];
        $this->isSuccess = FALSE;
        return $this;
    }

    public function withPagination(array $pagination = []): object
    {
        if ($this->simplePagination || !isset($pagination)) {
            $setPagination['pagination'] = [
                'currentPage' => request()->input('page'),
                'itemsPerPage' => request()->input('count')
            ];
        } else {
            $setPagination['pagination'] = $pagination;
        }

        $this->pagination = $setPagination;
        return $this;
    }

    public function withSimplePagination(): object
    {
        $this->simplePagination = TRUE;
        return $this->withPagination();
    }

    public function render($data = NULL): object
    {
        if (is_null($data)) {
            $meta = NULL;
        } else {
            if (isset($this->transform) && is_object($this->transform)) {
                $meta['data'] = $this->transform->setData($data)->process();
            } else {
                $meta['data'] = $data;
            }
        }

        if (isset($this->pagination) && is_array($meta)) {
            $meta = array_merge($meta, $this->pagination);
        }

        $return = [
            'status' => $this->isSuccess ? true : false,
            'message' => $this->message,
            'latency' => AppLatency(),
            'error' => is_null($this->error) ? NULL : $this->error,
            'response' => is_null($meta) ? NULL : $meta,
        ];

        return response()->json($return, $this->statusCode);
    }
}

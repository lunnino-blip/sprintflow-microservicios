<?php

namespace App\Middlewares;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as Handler;

class CorsMiddleware
{
    public function __invoke(
        Request $request,
        Handler $handler
    ): Response {
        $response = $handler->handle($request);

        return $response
            ->withHeader('Access-Control-Allow-Origin', '*')
            ->withHeader(
                'Access-Control-Allow-Headers',
                'Content-Type, Authorization, Accept'
            )
            ->withHeader(
                'Access-Control-Allow-Methods',
                'GET, OPTIONS'
            );
    }
}

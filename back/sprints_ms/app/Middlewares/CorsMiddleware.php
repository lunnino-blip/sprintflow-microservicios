<?php

namespace App\Middlewares;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;

class CorsMiddleware
{
    public function __invoke(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ): ResponseInterface {

        // Procesar la solicitud
        $response = $handler->handle($request);

        // Agregar encabezados CORS
        return $response
            ->withHeader(
                'Access-Control-Allow-Origin',
                '*'
            )
            ->withHeader(
                'Access-Control-Allow-Headers',
                'Content-Type, Authorization, Accept'
            )
            ->withHeader(
                'Access-Control-Allow-Methods',
                'GET, POST, PUT, DELETE, OPTIONS'
            );
    }
}

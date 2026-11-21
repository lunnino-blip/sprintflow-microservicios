<?php

namespace App\Middlewares;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as Handler;
use Slim\Psr7\Response as SlimResponse;

class CorsMiddleware
{
    public function __invoke(
        Request $request,
        Handler $handler
    ): Response {

        // Manejar solicitudes OPTIONS (CORS Preflight)
        if ($request->getMethod() === 'OPTIONS') {
            $response = new SlimResponse();

            return $response
                ->withHeader('Access-Control-Allow-Origin', '*')
                ->withHeader(
                    'Access-Control-Allow-Headers',
                    'X-Requested-With, Content-Type, Accept, Origin, Authorization'
                )
                ->withHeader(
                    'Access-Control-Allow-Methods',
                    'GET, POST, PUT, DELETE, OPTIONS'
                )
                ->withStatus(200);
        }

        // Procesar solicitudes normales
        $response = $handler->handle($request);

        return $response
            ->withHeader('Access-Control-Allow-Origin', '*')
            ->withHeader(
                'Access-Control-Allow-Headers',
                'X-Requested-With, Content-Type, Accept, Origin, Authorization'
            )
            ->withHeader(
                'Access-Control-Allow-Methods',
                'GET, POST, PUT, DELETE, OPTIONS'
            );
    }
}

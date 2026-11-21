<?php

namespace App\Middlewares;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Slim\Psr7\Response;

class CorsMiddleware
{
    public function __invoke(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler
    ): ResponseInterface {
        // Responder de inmediato a la petición preflight (OPTIONS)
        if ($request->getMethod() === 'OPTIONS') {
            $response = new Response();
            return $this->agregarCabecerasCors($response)->withStatus(200);
        }

        // Procesar GET, POST, PUT, DELETE
        $response = $handler->handle($request);

        return $this->agregarCabecerasCors($response);
    }

    private function agregarCabecerasCors(ResponseInterface $response): ResponseInterface
    {
        return $response
            ->withHeader('Access-Control-Allow-Origin', '*')
            ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    }
}
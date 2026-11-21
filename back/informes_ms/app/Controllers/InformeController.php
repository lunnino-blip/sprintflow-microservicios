<?php

namespace App\Controllers;

use App\Models\Informe;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Throwable;

class InformeController
{
    private Informe $informeModel;

    public function __construct()
    {
        $this->informeModel = new Informe();
    }

    /**
     * Construye una respuesta JSON.
     */
    private function responder(
        Response $response,
        array $datos,
        int $codigo = 200
    ): Response {
        $response->getBody()->write(
            json_encode(
                $datos,
                JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
            )
        );

        return $response
            ->withStatus($codigo)
            ->withHeader('Content-Type', 'application/json');
    }

    /**
     * Maneja los errores de comunicación.
     */
    private function manejarError(
        Response $response,
        Throwable $error
    ): Response {
        return $this->responder(
            $response,
            [
                'success' => false,
                'message' => 'No fue posible generar el informe.',
                'error' => $error->getMessage()
            ],
            502
        );
    }

    /**
     * GET /informes
     */
    public function general(
        Request $request,
        Response $response
    ): Response {
        try {
            $datos = $this->informeModel->obtenerGeneral();

            return $this->responder($response, [
                'success' => true,
                'data' => $datos
            ]);

        } catch (Throwable $error) {
            return $this->manejarError($response, $error);
        }
    }

    /**
     * GET /informes/responsables
     */
    public function responsables(
        Request $request,
        Response $response
    ): Response {
        try {
            $datos = $this->informeModel->obtenerPorResponsable();

            return $this->responder($response, [
                'success' => true,
                'data' => $datos
            ]);

        } catch (Throwable $error) {
            return $this->manejarError($response, $error);
        }
    }

    /**
     * GET /informes/sprints
     */
    public function sprints(
        Request $request,
        Response $response
    ): Response {
        try {
            $datos = $this->informeModel->obtenerPorSprint();

            return $this->responder($response, [
                'success' => true,
                'data' => $datos
            ]);

        } catch (Throwable $error) {
            return $this->manejarError($response, $error);
        }
    }

    /**
     * GET /informes/sprints/{id}
     */
    public function sprint(
        Request $request,
        Response $response,
        array $args
    ): Response {
        try {
            $id = (int) $args['id'];

            if ($id <= 0) {
                return $this->responder($response, [
                    'success' => false,
                    'message' => 'El identificador del sprint no es válido.'
                ], 400);
            }

            $datos = $this->informeModel->obtenerSprint($id);

            if ($datos === null) {
                return $this->responder($response, [
                    'success' => false,
                    'message' => 'No se encontró el sprint solicitado.'
                ], 404);
            }

            return $this->responder($response, [
                'success' => true,
                'data' => $datos
            ]);

        } catch (Throwable $error) {
            return $this->manejarError($response, $error);
        }
    }
}

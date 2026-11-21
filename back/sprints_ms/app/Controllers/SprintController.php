<?php

namespace App\Controllers;

use App\Models\Sprint;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class SprintController
{
    /**
     * Genera una respuesta JSON.
     */
    private function json(
        Response $response,
        array $data,
        int $status = 200
    ): Response {

        $response->getBody()->write(
            json_encode($data, JSON_UNESCAPED_UNICODE)
        );

        return $response
            ->withStatus($status)
            ->withHeader('Content-Type', 'application/json');
    }

    /**
     * Obtiene todos los sprints.
     */
    public function index(
		Request $request,
		Response $response
	): Response {

		$sprints = Sprint::obtenerTodos();

		return $this->json($response, [
			'success' => true,
			'data' => $sprints
		]);
	}

    /**
     * Obtiene un sprint por su ID.
     */
	public function show(
		Request $request,
		Response $response,
		array $args
	): Response {

		$sprint = Sprint::buscarPorId((int) $args['id']);

		if (!$sprint) {
			return $this->json($response, [
				'success' => false,
				'message' => 'Sprint no encontrado'
			], 404);
		}

		return $this->json($response, [
			'success' => true,
			'data' => $sprint
		]);
	}

    /**
     * Crea un nuevo sprint.
     */
	public function store(
		Request $request,
		Response $response
	): Response {

		$data = $request->getParsedBody();

		if (!is_array($data)) {
			return $this->json($response, [
				'success' => false,
				'message' => 'Datos inválidos'
			], 400);
		}

		$nombre = trim($data['nombre'] ?? '');
		$fechaInicio = $data['fecha_inicio'] ?? '';
		$fechaFin = $data['fecha_fin'] ?? '';

		if (
			$nombre === '' ||
			!$this->validarFechas($fechaInicio, $fechaFin)
		) {
			return $this->json($response, [
				'success' => false,
				'message' => 'Nombre o fechas inválidas'
			], 422);
		}

		$sprint = Sprint::crear([
			'nombre' => $nombre,
			'fecha_inicio' => $fechaInicio,
			'fecha_fin' => $fechaFin
		]);

		return $this->json($response, [
			'success' => true,
			'message' => 'Sprint creado correctamente',
			'data' => $sprint
		], 201);
	}

    /**
     * Actualiza un sprint existente.
     */
	public function update(
		Request $request,
		Response $response,
		array $args
	): Response {

		$sprint = Sprint::buscarPorId((int) $args['id']);

		if (!$sprint) {
			return $this->json($response, [
				'success' => false,
				'message' => 'Sprint no encontrado'
			], 404);
		}

		$data = $request->getParsedBody();

		if (!is_array($data)) {
			return $this->json($response, [
				'success' => false,
				'message' => 'Datos inválidos'
			], 400);
		}

		$nombre = trim($data['nombre'] ?? $sprint->nombre);
		$fechaInicio = $data['fecha_inicio'] ?? $sprint->fecha_inicio;
		$fechaFin = $data['fecha_fin'] ?? $sprint->fecha_fin;

		if (
			$nombre === '' ||
			!$this->validarFechas($fechaInicio, $fechaFin)
		) {
			return $this->json($response, [
				'success' => false,
				'message' => 'Nombre o fechas inválidas'
			], 422);
		}

		$sprint->actualizar([
			'nombre' => $nombre,
			'fecha_inicio' => $fechaInicio,
			'fecha_fin' => $fechaFin
		]);

		return $this->json($response, [
			'success' => true,
			'message' => 'Sprint actualizado correctamente',
			'data' => $sprint->fresh()
		]);
	}

    /**
     * Elimina un sprint.
     */
	public function delete(
		Request $request,
		Response $response,
		array $args
	): Response {

		$sprint = Sprint::buscarPorId((int) $args['id']);

		if (!$sprint) {
			return $this->json($response, [
				'success' => false,
				'message' => 'Sprint no encontrado'
			], 404);
		}

		$sprint->eliminar();

		return $this->json($response, [
			'success' => true,
			'message' => 'Sprint eliminado correctamente'
		]);
	}

    /**
     * Comprueba el formato y el orden de las fechas.
     */
    private function validarFechas(
        mixed $inicio,
        mixed $fin
    ): bool {

        if (!is_string($inicio) || !is_string($fin)) {
            return false;
        }

        $fechaInicio = \DateTimeImmutable::createFromFormat(
            '!Y-m-d',
            $inicio
        );

        $fechaFin = \DateTimeImmutable::createFromFormat(
            '!Y-m-d',
            $fin
        );

        return $fechaInicio !== false
            && $fechaFin !== false
            && $fechaInicio->format('Y-m-d') === $inicio
            && $fechaFin->format('Y-m-d') === $fin
            && $fechaInicio <= $fechaFin;
    }
}

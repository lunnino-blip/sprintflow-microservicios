<?php

namespace App\Models;

use RuntimeException;

class Informe
{
    private string $historiasUrl = 'http://127.0.0.1:8001';
    private string $sprintsUrl = 'http://127.0.0.1:8002';

    /**
     * Realiza una petición GET a otro microservicio.
     */
    private function consultarApi(string $url): array
    {
        $curl = curl_init($url);

        curl_setopt_array($curl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPGET => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 15,
            CURLOPT_HTTPHEADER => [
                'Accept: application/json'
            ]
        ]);

        $respuesta = curl_exec($curl);
        $error = curl_error($curl);
        $codigo = curl_getinfo($curl, CURLINFO_HTTP_CODE);

        curl_close($curl);

        if ($respuesta === false) {
            throw new RuntimeException(
                'Error al conectar con el microservicio: ' . $error
            );
        }

        if ($codigo < 200 || $codigo >= 300) {
            throw new RuntimeException(
                'El microservicio respondió con el código HTTP ' . $codigo
            );
        }

        $datos = json_decode($respuesta, true);

        if (!is_array($datos)) {
            throw new RuntimeException(
                'El microservicio devolvió una respuesta JSON inválida.'
            );
        }

        return $datos;
    }

    /**
     * Obtiene todas las historias.
     */
    private function obtenerHistorias(): array
    {
        return $this->consultarApi(
            $this->historiasUrl . '/historias'
        );
    }

    /**
     * Obtiene todos los sprints.
     *
     * sprints_ms devuelve los datos dentro de success y data.
     */
    private function obtenerSprints(): array
    {
        $respuesta = $this->consultarApi(
            $this->sprintsUrl . '/sprints'
        );

        if (
            !isset($respuesta['success']) ||
            $respuesta['success'] !== true ||
            !isset($respuesta['data']) ||
            !is_array($respuesta['data'])
        ) {
            throw new RuntimeException(
                'La respuesta de sprints_ms tiene un formato inesperado.'
            );
        }

        return $respuesta['data'];
    }

    /**
     * Calcula las estadísticas de una colección de historias.
     */
    private function calcularEstadisticas(array $historias): array
    {
        $total = count($historias);

        $finalizadas = 0;
        $nuevas = 0;
        $activas = 0;
        $impedimentos = 0;
        $puntos = 0;

        foreach ($historias as $historia) {
            $estado = $historia['estado'] ?? '';

            switch ($estado) {
                case 'finalizada':
                    $finalizadas++;
                    break;

                case 'nueva':
                    $nuevas++;
                    break;

                case 'activa':
                    $activas++;
                    break;

                case 'impedimento':
                    $impedimentos++;
                    break;
            }

            $puntos += (int) ($historia['puntos'] ?? 0);
        }

        $porcentaje = $total > 0
            ? round(($finalizadas / $total) * 100, 2)
            : 0;

        return [
            'total_historias' => $total,
            'finalizadas' => $finalizadas,
            'nuevas' => $nuevas,
            'activas' => $activas,
            'impedimentos' => $impedimentos,
            'puntos_totales' => $puntos,
            'porcentaje_finalizacion' => $porcentaje
        ];
    }

    /**
     * Informe general del proyecto.
     */
    public function obtenerGeneral(): array
    {
        $historias = $this->obtenerHistorias();

        return $this->calcularEstadisticas($historias);
    }

    /**
     * Informe agrupado por responsable.
     */
    public function obtenerPorResponsable(): array
    {
        $historias = $this->obtenerHistorias();

        $grupos = [];

        foreach ($historias as $historia) {
            $responsable = $historia['responsable'] ?? 'Sin asignar';

            $grupos[$responsable][] = $historia;
        }

        $resultado = [];

        foreach ($grupos as $responsable => $elementos) {
            $resultado[] = array_merge(
                ['responsable' => $responsable],
                $this->calcularEstadisticas($elementos)
            );
        }

        return $resultado;
    }

    /**
     * Informe agrupado por sprint.
     */
    public function obtenerPorSprint(): array
    {
        $historias = $this->obtenerHistorias();
        $sprints = $this->obtenerSprints();

        $resultado = [];

        foreach ($sprints as $sprint) {
            $sprintId = (int) $sprint['id'];

            $historiasSprint = array_values(
                array_filter(
                    $historias,
                    fn($historia) =>
                        (int) $historia['sprint_id'] === $sprintId
                )
            );

            $resultado[] = array_merge(
                [
                    'sprint_id' => $sprintId,
                    'nombre' => $sprint['nombre'],
                    'fecha_inicio' => $sprint['fecha_inicio'],
                    'fecha_fin' => $sprint['fecha_fin']
                ],
                $this->calcularEstadisticas($historiasSprint)
            );
        }

        return $resultado;
    }

    /**
     * Informe de un sprint específico.
     */
    public function obtenerSprint(int $id): ?array
    {
        $sprints = $this->obtenerSprints();

        $sprintEncontrado = null;

        foreach ($sprints as $sprint) {
            if ((int) $sprint['id'] === $id) {
                $sprintEncontrado = $sprint;
                break;
            }
        }

        if ($sprintEncontrado === null) {
            return null;
        }

        $historias = $this->obtenerHistorias();

        $historiasSprint = array_values(
            array_filter(
                $historias,
                fn($historia) =>
                    (int) $historia['sprint_id'] === $id
            )
        );

        return array_merge(
            [
                'sprint_id' => $id,
                'nombre' => $sprintEncontrado['nombre'],
                'fecha_inicio' => $sprintEncontrado['fecha_inicio'],
                'fecha_fin' => $sprintEncontrado['fecha_fin']
            ],
            $this->calcularEstadisticas($historiasSprint)
        );
    }
}

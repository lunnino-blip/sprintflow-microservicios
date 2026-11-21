<?php

namespace App\Controllers;

use App\Models\Historia;
use Illuminate\Database\Eloquent\Collection;

class HistoriaController
{
    public function get_historias(?int $sprintId = null): Collection
    {
        if (!empty($sprintId)) {
            return Historia::where('sprint_id', $sprintId)->orderBy('id', 'desc')->get();
        }
        return Historia::orderBy('id', 'desc')->get();
    }

    public function find_historia(int $id): Historia
    {
        return Historia::findOrFail($id);
    }

    public function create(array $data): Historia
    {
        $historia = new Historia();
        $historia->titulo = $data['titulo'];
        $historia->descripcion = $data['descripcion'] ?? '';
        $historia->responsable = $data['responsable'];
        $historia->estado = $data['estado'] ?? 'pendiente';
        $historia->puntos = (int) ($data['puntos'] ?? 1);
        $historia->fecha_creacion = $data['fecha_creacion'] ?? date('Y-m-d');
        $historia->fecha_finalizacion = $data['fecha_finalizacion'] ?? null;
        $historia->sprint_id = (int) $data['sprint_id'];

        $historia->aplicarReglaDeCierre();
        $historia->save();

        return $historia;
    }

    public function update(int $id, array $data): Historia
    {
        $historia = Historia::findOrFail($id);

        if (isset($data['titulo'])) {
            $historia->titulo = $data['titulo'];
        }
        if (isset($data['descripcion'])) {
            $historia->descripcion = $data['descripcion'];
        }
        if (isset($data['responsable'])) {
            $historia->responsable = $data['responsable'];
        }
        if (isset($data['estado'])) {
            $historia->estado = $data['estado'];
        }
        if (isset($data['puntos'])) {
            $historia->puntos = (int) $data['puntos'];
        }
        if (isset($data['sprint_id'])) {
            $historia->sprint_id = (int) $data['sprint_id'];
        }

        $historia->aplicarReglaDeCierre();
        $historia->save();

        return $historia;
    }

    public function delete(int $id): Historia
    {
        $historia = Historia::findOrFail($id);
        $historia->delete();
        return $historia;
    }
}





<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;

class Sprint extends Model
{
    protected $table = 'sprints';

    protected $primaryKey = 'id';

    public $timestamps = true;

    protected $fillable = [
        'nombre',
        'fecha_inicio',
        'fecha_fin'
    ];

    // Consultar todos los sprints
    public static function obtenerTodos(): Collection
    {
        return self::all();
    }

    // Buscar un sprint por su identificador
    public static function buscarPorId(int $id): ?self
    {
        return self::find($id);
    }

    // Registrar un nuevo sprint
    public static function crear(array $datos): self
    {
        return self::create($datos);
    }

    // Actualizar un sprint existente
    public function actualizar(array $datos): bool
    {
        return $this->update($datos);
    }

    // Eliminar un sprint
    public function eliminar(): bool
    {
        return (bool) $this->delete();
    }
}

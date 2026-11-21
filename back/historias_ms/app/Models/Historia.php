<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Historia extends Model
{
    protected $table = 'historias';
    public $timestamps = true;

    protected $fillable = [
        'titulo',
        'descripcion',
        'responsable',
        'estado',
        'puntos',
        'fecha_creacion',
        'fecha_finalizacion',
        'sprint_id'
    ];

    public function aplicarReglaDeCierre(): void
    {
        if ($this->estado === 'finalizada' && empty($this->fecha_finalizacion)) {
            $this->fecha_finalizacion = date('Y-m-d');
        } elseif ($this->estado !== 'finalizada') {
            $this->fecha_finalizacion = null;
        }
    }
}
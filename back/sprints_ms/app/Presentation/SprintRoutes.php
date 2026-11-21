<?php

use Slim\App;
use App\Controllers\SprintController;

return function (App $app) {

    // Consultar todos los sprints
    $app->get('/sprints', [
        SprintController::class,
        'index'
    ]);

    // Consultar un sprint específico
    $app->get('/sprints/{id:[0-9]+}', [
        SprintController::class,
        'show'
    ]);

    // Crear un sprint
    $app->post('/sprints', [
        SprintController::class,
        'store'
    ]);

    // Actualizar un sprint
    $app->put('/sprints/{id:[0-9]+}', [
        SprintController::class,
        'update'
    ]);

    // Eliminar un sprint
    $app->delete('/sprints/{id:[0-9]+}', [
        SprintController::class,
        'delete'
    ]);
};

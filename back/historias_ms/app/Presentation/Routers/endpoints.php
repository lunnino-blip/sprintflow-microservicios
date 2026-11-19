<?php

use App\Presentation\Repositories\HistoriaRepository;
use Slim\App;

return function (App $app) {
    $app->get('/historias', [HistoriaRepository::class, 'all']);
    $app->get('/historias/{id}', [HistoriaRepository::class, 'find']);
    $app->post('/historias', [HistoriaRepository::class, 'create']);
    $app->put('/historias/{id}', [HistoriaRepository::class, 'update']);
    $app->delete('/historias/{id}', [HistoriaRepository::class, 'delete']);
};


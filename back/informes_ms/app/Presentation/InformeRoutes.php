
<?php

use Slim\App;
use App\Controllers\InformeController;

return function (App $app) {

    $app->get('/informes', [
        InformeController::class,
        'general'
    ]);

    $app->get('/informes/responsables', [
        InformeController::class,
        'responsables'
    ]);

    $app->get('/informes/sprints', [
        InformeController::class,
        'sprints'
    ]);

    $app->get('/informes/sprints/{id:[0-9]+}', [
        InformeController::class,
        'sprint'
    ]);
};

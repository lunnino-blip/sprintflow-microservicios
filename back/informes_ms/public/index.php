
<?php

use Slim\Factory\AppFactory;
use App\Middlewares\CorsMiddleware;

require __DIR__ . '/../vendor/autoload.php';

$app = AppFactory::create();

$app->addRoutingMiddleware();

$app->addBodyParsingMiddleware();

$app->add(new CorsMiddleware());

$app->addErrorMiddleware(true, true, true);

// Registrar rutas del microservicio.
$informeRoutes = require __DIR__ .
    '/../app/Presentation/InformeRoutes.php';

$informeRoutes($app);

$app->run();

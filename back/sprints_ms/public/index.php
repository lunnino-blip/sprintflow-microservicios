<?php

use Slim\Factory\AppFactory;
use App\Middlewares\CorsMiddleware;

require __DIR__ . '/../vendor/autoload.php';

// Inicializar la conexión con MySQL
require __DIR__ . '/../app/global/database_config.php';

// Crear aplicación Slim
$app = AppFactory::create();

// Configurar procesamiento de JSON
$app->addBodyParsingMiddleware();

// Registrar rutas
(require __DIR__ . '/../app/Presentation/SprintRoutes.php')($app);

// Middleware de enrutamiento
$app->addRoutingMiddleware();

// Middleware CORS
$app->add(new CorsMiddleware());

// Middleware de errores
$app->addErrorMiddleware(
    true,
    true,
    true
);

// Ejecutar aplicación
$app->run();

<?php

use Slim\Factory\AppFactory; //Importa la fábrica de slim q instancia el servidor de la API

require __DIR__ . '/../vendor/autoload.php'; //Composer y namespaces
require __DIR__ . '/../app/global/database_config.php'; //Ejecuta la configuración de Eloquent para la conexión 

$cors = require __DIR__ . '/../app/Middlewares/cors.php'; //función de permisos CORS para que el front pueda consumir la API
$historias_routers = require __DIR__ . '/../app/Presentation/Routers/endpoints.php'; //Carga el mapa de rutas

$app = AppFactory::create(); //Crea la aplicación principal de slim

$app->addBodyParsingMiddleware();
$app->addRoutingMiddleware();
$app->addErrorMiddleware(true, true, true);

$cors($app);
$historias_routers($app);

$app->run();
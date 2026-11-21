<?php

// Importa el gestor de conexiones de Eloquent ORM
use Illuminate\Database\Capsule\Manager as Capsule;

$capsule = new Capsule;

$capsule->addConnection([
    'driver'    => 'mysql',
    'host'      => '127.0.0.1',
    'database'  => 'gestor_historias_db',
    'username'  => 'root',
    'password'  => '',
    'charset'   => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix'    => '',
]);

// Enciende el motor de Eloquent de forma global
$capsule->setAsGlobal();
$capsule->bootEloquent();
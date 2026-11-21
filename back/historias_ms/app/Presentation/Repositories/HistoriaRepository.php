<?php

namespace App\Presentation\Repositories;  //Registra la clase en esa ruta lógica para que Composer la cargue automáticamente


use App\Controllers\HistoriaController;  //Importa el controlador para instanciarlo y pedir datos
use Illuminate\Database\Eloquent\ModelNotFoundException; //Importa la excepción de Eloquent cuando no encuentra el dato
use Psr\Http\Message\ResponseInterface as Response; //Objeto estandar de slim para la respuesta HTTP
use Psr\Http\Message\ServerRequestInterface as Request; //Objeto estandar de slim para la petición HTTP

class HistoriaRepository
{
    public function all(Request $request, Response $response, $args): Response
    {
        $params = $request->getQueryParams(); //Lee los parametros de la URL despues del ?
        $sprintId = isset($params['sprint_id']) && $params['sprint_id'] !== ''
            ? (int) $params['sprint_id']  //si llego el parametro lo convierte a int, si no null
            : null;

        $controller = new HistoriaController(); //instancia el controlador para usar sus metodos y obtener los datos
        $rows = $controller->get_historias($sprintId); //Le pide al controlador la colección de historia
        $response->getBody()->write($rows->toJson()); //Metodo que convierte los regisros de Mysql a JSON 
        return $response->withHeader("Content-Type", "application/json"); //Etiqueta HTTP que indica que la respuesta es JSON
    }

    public function find(Request $request, Response $response, $args): Response
    {
        try {
            $id = (int) $args['id']; //Lee el parametro de la URL que viene en la ruta /historias/{id} y lo convierte a int
            $controller = new HistoriaController(); //instancia el controlador para usar sus metodos y obtener los datos
            $row = $controller->find_historia($id); //Le pide al controlador la historia con ese id, si no existe lanza una excepción ModelNotFoundException
            $response->getBody()->write($row->toJson()); //Metodo que convierte el registro de Mysql a JSON
            return $response->withHeader("Content-Type", "application/json"); //Etiqueta HTTP que indica que la respuesta es JSON
        } catch (ModelNotFoundException $ex) {
            return $response->withStatus(404); 
        }
    }

    public function create(Request $request, Response $response, $args): Response
    {
        try {
            $body = $request->getBody()->getContents();
            $data = json_decode($body, true); //Convierte al JSON en un arreglo asociativo de PHP

            if (empty($data['titulo']) || empty($data['responsable']) || empty($data['sprint_id'])) {
                return $response->withStatus(400);
            }

            $controller = new HistoriaController();
            $row = $controller->create($data);
            $response->getBody()->write($row->toJson());
            return $response->withStatus(201)->withHeader("Content-Type", "application/json");
        } catch (ModelNotFoundException $ex) {
            return $response->withStatus(406);
        }
    }

    public function update(Request $request, Response $response, $args): Response
    {
        try {
            $id = (int) $args['id'];
            $body = $request->getBody()->getContents();
            $data = json_decode($body, true);
            $controller = new HistoriaController();
            $row = $controller->update($id, $data);
            $response->getBody()->write($row->toJson());
            return $response->withHeader("Content-Type", "application/json");
        } catch (ModelNotFoundException $ex) {
            return $response->withStatus(404);
        }
    }

    public function delete(Request $request, Response $response, $args): Response
    {
        try {
            $id = (int) $args['id'];
            $controller = new HistoriaController();
            $row = $controller->delete($id);
            $response->getBody()->write($row->toJson());
            return $response->withHeader("Content-Type", "application/json");
        } catch (ModelNotFoundException $ex) {
            return $response->withStatus(404);
        }
    }
}

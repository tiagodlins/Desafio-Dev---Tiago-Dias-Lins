import { Router } from "express";
import * as UserController from "@controllers/UserController";
import { PlantaController } from "@controllers/PlantaController";

const routes = Router();
const plantaController = new PlantaController();

// -----------------------------------------------------------------------------
// Rotas de Usuários (User)
// -----------------------------------------------------------------------------
routes.post("/users", UserController.createUser);
routes.get("/users", UserController.readAllUsers);
routes.get("/users/:id", UserController.readUserById);
routes.patch("/users/:id", UserController.updateUser);
routes.delete("/users/:id", UserController.deleteUser);

// -----------------------------------------------------------------------------
// Rotas de Plantas (Planta)
// -----------------------------------------------------------------------------
routes.post("/plantas", (req, res) => plantaController.create(req, res));
routes.get("/plantas", (req, res) => plantaController.findAll(req, res));

// NOTA: Esta rota específica DEVE vir ANTES de /plantas/:id
routes.get("/plantas/estoque/valor-total", (req, res) => plantaController.valorTotalEstoque(req, res));

routes.get("/plantas/:id", (req, res) => plantaController.findById(req, res));
routes.patch("/plantas/:id", (req, res) => plantaController.update(req, res));
routes.delete("/plantas/:id", (req, res) => plantaController.delete(req, res));
routes.post("/plantas/:id/venda", (req, res) => plantaController.venda(req, res));

export default routes;
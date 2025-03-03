const express = require("express");
const router = express.Router();
const clientsController = require("../controllers/clients.controller");

// Liste des clients
router.get("/", clientsController.listClients.bind(clientsController));

// Formulaire d'ajout d'un client
router.get(
  "/ajouter",
  clientsController.showAddClientForm.bind(clientsController)
);

// Traitement de l'ajout d'un client
router.post("/ajouter", clientsController.addClient.bind(clientsController));

// Formulaire de modification d'un client
router.get(
  "/:id/modifier",
  clientsController.showEditClientForm.bind(clientsController)
);

// Traitement de la modification d'un client
router.post(
  "/:id/modifier",
  clientsController.updateClient.bind(clientsController)
);

// Détail d'un client
router.get("/:id", clientsController.showClient.bind(clientsController));

module.exports = router;

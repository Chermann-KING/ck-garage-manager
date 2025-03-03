const express = require("express");
const router = express.Router();
const vehiculesController = require("../controllers/vehicules.controller");

// Liste de tous les véhicules
router.get("/", vehiculesController.listVehicules.bind(vehiculesController));

// Liste des véhicules d'un client
router.get(
  "/client/:clientId",
  vehiculesController.listVehiculesByClient.bind(vehiculesController)
);

// Formulaire d'ajout d'un véhicule
router.get(
  "/ajouter",
  vehiculesController.showAddVehiculeForm.bind(vehiculesController)
);

// Traitement de l'ajout d'un véhicule
router.post(
  "/ajouter",
  vehiculesController.addVehicule.bind(vehiculesController)
);

// Détail d'un véhicule
router.get("/:id", vehiculesController.showVehicule.bind(vehiculesController));

module.exports = router;

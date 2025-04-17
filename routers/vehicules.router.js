const express = require("express");
const router = express.Router();
const vehiculesController = require("../controllers/vehicules.controller");

// Liste des véhicules
router.get("/", vehiculesController.listVehicules);

// Liste des véhicules d'un client
router.get("/client/:clientId", vehiculesController.listVehiculesClient);

// Formulaire d'ajout d'un véhicule
router.get("/ajouter/:clientId", vehiculesController.showAddVehiculeForm);

// Traitement de l'ajout d'un véhicule
router.post("/ajouter/:clientId", vehiculesController.addVehicule);

// Détails d'un véhicule
router.get("/:id", vehiculesController.showVehicule);

// Formulaire de modification d'un véhicule
router.get("/:id/modifier", vehiculesController.showEditVehiculeForm);

// Traitement de la modification d'un véhicule
router.post("/:id/modifier", vehiculesController.updateVehicule);

module.exports = router;

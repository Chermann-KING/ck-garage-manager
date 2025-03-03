const express = require("express");
const router = express.Router();
const interventionsController = require("../controllers/interventions.controller");

// Liste de toutes les interventions
router.get(
  "/",
  interventionsController.listInterventions.bind(interventionsController)
);

// Formulaire de planification d'une intervention
router.get(
  "/planifier",
  interventionsController.showPlanifierInterventionForm.bind(
    interventionsController
  )
);

// Traitement de la planification d'une intervention
router.post(
  "/planifier",
  interventionsController.planifierIntervention.bind(interventionsController)
);

// Formulaire de mise à jour du statut d'une intervention
router.get(
  "/:id/statut",
  interventionsController.showUpdateStatusForm.bind(interventionsController)
);

// Traitement de la mise à jour du statut d'une intervention
router.post(
  "/:id/statut",
  interventionsController.updateInterventionStatus.bind(interventionsController)
);

// Détail d'une intervention
router.get(
  "/:id",
  interventionsController.showIntervention.bind(interventionsController)
);

module.exports = router;

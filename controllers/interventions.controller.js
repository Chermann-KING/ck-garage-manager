const interventionsService = require("../services/interventions.service");
const vehiculesService = require("../services/vehicules.service");
const clientsService = require("../services/clients.service");

class InterventionsController {
  // Afficher la liste de toutes les interventions
  async listInterventions(req, res) {
    try {
      const interventions = await interventionsService.getAllInterventions();

      res.render("interventions/list", {
        title: "Liste des interventions",
        interventions,
      });
    } catch (error) {
      console.error("Erreur dans listInterventions:", error);
      res.status(500).render("error", {
        title: "Erreur",
        message:
          "Une erreur est survenue lors de la récupération des interventions",
      });
    }
  }

  // Afficher le détail d'une intervention
  async showIntervention(req, res) {
    try {
      const interventionId = parseInt(req.params.id);
      const intervention = await interventionsService.getInterventionById(
        interventionId
      );

      if (!intervention) {
        return res.status(404).render("error", {
          title: "Intervention non trouvée",
          message: "L'intervention demandée n'existe pas",
        });
      }

      res.render("interventions/details", {
        title: `Intervention #${intervention.InterventionID}`,
        intervention,
      });
    } catch (error) {
      console.error("Erreur dans showIntervention:", error);
      res.status(500).render("error", {
        title: "Erreur",
        message:
          "Une erreur est survenue lors de la récupération de l'intervention",
      });
    }
  }

  // Afficher le formulaire de planification d'une intervention
  async showPlanifierInterventionForm(req, res) {
    try {
      // Récupérer les types d'interventions pour le formulaire
      const typesInterventions =
        await interventionsService.getAllInterventionTypes();

      // Si un ID véhicule est fourni, on le récupère pour pré-sélectionner
      let vehicule = null;
      let client = null;

      if (req.query.vehiculeId) {
        const vehiculeId = parseInt(req.query.vehiculeId);
        vehicule = await vehiculesService.getVehiculeById(vehiculeId);

        if (vehicule) {
          // Récupérer le client associé
          client = await clientsService.getClientById(vehicule.ClientID);
        }
      }

      // Si pas de véhicule spécifié, récupérer tous les véhicules pour le menu déroulant
      let vehicules = [];
      if (!vehicule) {
        vehicules = await vehiculesService.getAllVehicules();
      }

      // Date d'aujourd'hui formatée pour le champ date
      const today = new Date().toISOString().split("T")[0];

      res.render("interventions/form", {
        title: "Planifier une intervention",
        intervention: {
          VehiculeID: vehicule ? vehicule.VehiculeID : "",
          Date_Intervention: today,
          Statut: "Planifié",
        },
        typesInterventions,
        vehicules,
        selectedVehicule: vehicule,
        selectedClient: client,
        isNew: true,
      });
    } catch (error) {
      console.error("Erreur dans showPlanifierInterventionForm:", error);
      res.status(500).render("error", {
        title: "Erreur",
        message: "Une erreur est survenue lors du chargement du formulaire",
      });
    }
  }

  // Traiter la planification d'une intervention
  async planifierIntervention(req, res) {
    try {
      // Récupérer le prix de base du type d'intervention
      const typeId = parseInt(req.body.typeId);
      let prix = null;

      // Si un prix personnalisé est fourni
      if (req.body.prix && req.body.prix.trim() !== "") {
        prix = parseFloat(req.body.prix);
      } else {
        // Calculer le prix basé sur le type d'intervention
        prix = await interventionsService.calculateInterventionPrice(typeId);
      }

      const interventionData = {
        vehiculeId: parseInt(req.body.vehiculeId),
        typeId: typeId,
        dateIntervention: req.body.dateIntervention,
        statut: req.body.statut || "Planifié",
        prix: prix,
        description: req.body.description || "",
      };

      const interventionId = await interventionsService.planifierIntervention(
        interventionData
      );

      req.session.flashMessage = {
        type: "success",
        text: "Intervention planifiée avec succès",
      };

      // Rediriger vers la page de l'intervention ou vers la page du véhicule
      if (req.body.returnToVehicule) {
        res.redirect(`/vehicules/${interventionData.vehiculeId}`);
      } else {
        res.redirect(`/interventions/${interventionId}`);
      }
    } catch (error) {
      console.error("Erreur dans planifierIntervention:", error);

      try {
        // Récupérer à nouveau les données nécessaires pour le formulaire
        const typesInterventions =
          await interventionsService.getAllInterventionTypes();
        const vehicules = await vehiculesService.getAllVehicules();

        res.render("interventions/form", {
          title: "Planifier une intervention",
          intervention: {
            VehiculeID: req.body.vehiculeId,
            Date_Intervention: req.body.dateIntervention,
            Statut: req.body.statut || "Planifié",
            Description: req.body.description,
          },
          typesInterventions,
          vehicules,
          selectedTypeId: req.body.typeId,
          isNew: true,
          error:
            "Une erreur est survenue lors de la planification de l'intervention",
        });
      } catch (err) {
        res.status(500).render("error", {
          title: "Erreur",
          message:
            "Une erreur est survenue lors de la planification de l'intervention",
        });
      }
    }
  }

  // Afficher le formulaire de mise à jour du statut d'une intervention
  async showUpdateStatusForm(req, res) {
    try {
      const interventionId = parseInt(req.params.id);
      const intervention = await interventionsService.getInterventionById(
        interventionId
      );

      if (!intervention) {
        return res.status(404).render("error", {
          title: "Intervention non trouvée",
          message: "L'intervention demandée n'existe pas",
        });
      }

      res.render("interventions/update-status", {
        title: `Mettre à jour le statut - Intervention #${intervention.InterventionID}`,
        intervention,
        statuts: [
          "Planifié",
          "En cours",
          "En attente de pièces",
          "Terminé",
          "Annulé",
        ],
      });
    } catch (error) {
      console.error("Erreur dans showUpdateStatusForm:", error);
      res.status(500).render("error", {
        title: "Erreur",
        message: "Une erreur est survenue lors du chargement du formulaire",
      });
    }
  }

  // Traiter la mise à jour du statut d'une intervention
  async updateInterventionStatus(req, res) {
    try {
      const interventionId = parseInt(req.params.id);
      const newStatus = req.body.statut;
      const description = req.body.description;

      await interventionsService.updateInterventionStatus(
        interventionId,
        newStatus,
        description
      );

      req.session.flashMessage = {
        type: "success",
        text: "Statut de l'intervention mis à jour avec succès",
      };

      res.redirect(`/interventions/${interventionId}`);
    } catch (error) {
      console.error("Erreur dans updateInterventionStatus:", error);

      try {
        const intervention = await interventionsService.getInterventionById(
          req.params.id
        );

        res.render("interventions/update-status", {
          title: `Mettre à jour le statut - Intervention #${req.params.id}`,
          intervention: {
            ...intervention,
            Statut: req.body.statut,
            Description: req.body.description,
          },
          statuts: [
            "Planifié",
            "En cours",
            "En attente de pièces",
            "Terminé",
            "Annulé",
          ],
          error: "Une erreur est survenue lors de la mise à jour du statut",
        });
      } catch (err) {
        res.status(500).render("error", {
          title: "Erreur",
          message: "Une erreur est survenue lors de la mise à jour du statut",
        });
      }
    }
  }
}

module.exports = new InterventionsController();

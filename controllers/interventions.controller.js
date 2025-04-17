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
        title: `Intervention #${intervention.interventionid}`,
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
      console.log("Début du chargement du formulaire");
      console.log("Query params:", req.query);

      // Récupérer les types d'interventions pour le formulaire
      const typesInterventions =
        await interventionsService.getAllInterventionTypes();
      console.log("Types d'interventions récupérés:", typesInterventions);

      // Récupérer la liste des véhicules
      const vehicules = await vehiculesService.getAllVehicules();
      console.log("Véhicules récupérés:", vehicules);

      // Si un ID véhicule est fourni, on le récupère pour pré-sélectionner
      let vehicule = null;
      let client = null;

      if (req.query.vehiculeId) {
        console.log("VehiculeID fourni:", req.query.vehiculeId);
        vehicule = await vehiculesService.getVehiculeById(
          parseInt(req.query.vehiculeId)
        );
        console.log("Véhicule récupéré:", vehicule);

        if (vehicule) {
          client = await clientsService.getClientById(vehicule.clientid);
          console.log("Client récupéré:", client);
        }
      }

      // Date d'aujourd'hui formatée pour le champ date
      const today = new Date().toISOString().split("T")[0];

      const viewData = {
        title: "Planifier une intervention",
        intervention: {
          vehicule_id: vehicule ? vehicule.id : "",
          date_intervention: today,
          statut: "Planifié",
          description: "",
          prix: "",
        },
        typesInterventions: typesInterventions.map((type) => ({
          id: type.typeid,
          nom: type.nom,
          description: type.description,
          prix_base: type.prix_base,
        })),
        vehicules: vehicules,
        selectedVehicule: vehicule,
        selectedClient: client,
        isNew: true,
      };

      console.log("Données pour la vue:", viewData);
      res.render("interventions/form", viewData);
    } catch (error) {
      console.error("Erreur lors du chargement du formulaire:", error);
      res.status(500).render("error", {
        title: "Erreur",
        message: "Une erreur est survenue lors du chargement du formulaire",
      });
    }
  }

  // Traiter la planification d'une intervention
  async planifierIntervention(req, res) {
    try {
      console.log("Données reçues du formulaire:", req.body);

      // Récupérer le prix de base du type d'intervention
      const typeId = parseInt(req.body.type_id);
      let prix = null;

      // Si un prix personnalisé est fourni
      if (req.body.prix && req.body.prix.trim() !== "") {
        prix = parseFloat(req.body.prix);
      } else {
        // Calculer le prix basé sur le type d'intervention
        prix = await interventionsService.calculateInterventionPrice(typeId);
      }

      const interventionData = {
        vehicule_id: parseInt(req.body.vehicule_id),
        type_id: typeId,
        date_intervention: req.body.date_intervention,
        statut: req.body.statut || "Planifié",
        prix: prix,
        description: req.body.description || null,
      };

      console.log("Données préparées pour le service:", interventionData);

      const interventionId = await interventionsService.planifierIntervention(
        interventionData
      );

      req.session.flashMessage = {
        type: "success",
        text: "Intervention planifiée avec succès",
      };

      // Rediriger vers la page de l'intervention ou vers la page du véhicule
      if (req.body.returnToVehicule) {
        res.redirect(`/vehicules/${interventionData.vehicule_id}`);
      } else {
        res.redirect(`/interventions/${interventionId}`);
      }
    } catch (error) {
      console.error("Erreur dans planifierIntervention:", error);

      // Récupérer à nouveau les données nécessaires pour le formulaire
      const typesInterventions =
        await interventionsService.getAllInterventionTypes();
      let vehicule = null;
      let client = null;

      if (req.body.vehicule_id) {
        vehicule = await vehiculesService.getVehiculeById(
          parseInt(req.body.vehicule_id)
        );
        if (vehicule) {
          client = await clientsService.getClientById(vehicule.clientid);
        }
      }

      res.render("interventions/form", {
        title: "Planifier une intervention",
        intervention: {
          vehicule_id: req.body.vehicule_id,
          type_id: req.body.type_id,
          date_intervention: req.body.date_intervention,
          statut: req.body.statut || "Planifié",
          description: req.body.description,
          prix: req.body.prix,
        },
        typesInterventions,
        selectedVehicule: vehicule,
        selectedClient: client,
        isNew: true,
        error:
          "Une erreur est survenue lors de la planification de l'intervention",
      });
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
        title: `Mettre à jour le statut - Intervention #${intervention.interventionid}`,
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
            statut: req.body.statut,
            description: req.body.description,
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

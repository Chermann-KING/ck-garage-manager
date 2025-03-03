const vehiculesService = require("../services/vehicules.service");
const clientsService = require("../services/clients.service");

class VehiculesController {
  // Afficher tous les véhicules avec tri par type si demandé
  async listVehicules(req, res) {
    try {
      let vehicules;

      // Si le paramètre de tri est présent et égal à 'type'
      if (req.query.sort === "type") {
        vehicules = await vehiculesService.getVehiculesSortedByType();
      } else {
        vehicules = await vehiculesService.getAllVehicules();
      }

      res.render("vehicules/list", {
        title: "Liste des véhicules",
        vehicules,
        sortByType: req.query.sort === "type",
      });
    } catch (error) {
      console.error("Erreur dans listVehicules:", error);
      res.status(500).render("error", {
        title: "Erreur",
        message:
          "Une erreur est survenue lors de la récupération des véhicules",
      });
    }
  }

  // Afficher les véhicules d'un client spécifique
  async listVehiculesByClient(req, res) {
    try {
      const clientId = parseInt(req.params.clientId);

      // Récupérer les infos du client
      const client = await clientsService.getClientById(clientId);

      if (!client) {
        return res.status(404).render("error", {
          title: "Client non trouvé",
          message: "Le client demandé n'existe pas",
        });
      }

      // Récupérer les véhicules du client
      const vehicules = await vehiculesService.getVehiculesByClientId(clientId);

      res.render("vehicules/client-vehicules", {
        title: `Véhicules de ${client.Prenom} ${client.Nom}`,
        client,
        vehicules,
      });
    } catch (error) {
      console.error("Erreur dans listVehiculesByClient:", error);
      res.status(500).render("error", {
        title: "Erreur",
        message:
          "Une erreur est survenue lors de la récupération des véhicules",
      });
    }
  }

  // Afficher le détail d'un véhicule avec son historique d'interventions
  async showVehicule(req, res) {
    try {
      const vehiculeId = parseInt(req.params.id);

      // Récupérer les infos du véhicule
      const vehicule = await vehiculesService.getVehiculeById(vehiculeId);

      if (!vehicule) {
        return res.status(404).render("error", {
          title: "Véhicule non trouvé",
          message: "Le véhicule demandé n'existe pas",
        });
      }

      // Récupérer l'historique des interventions
      const interventions =
        await vehiculesService.getVehiculeInterventionsHistory(vehiculeId);

      res.render("vehicules/details", {
        title: `${vehicule.Marque} ${vehicule.Modele} - ${vehicule.Immatriculation}`,
        vehicule,
        interventions,
      });
    } catch (error) {
      console.error("Erreur dans showVehicule:", error);
      res.status(500).render("error", {
        title: "Erreur",
        message: "Une erreur est survenue lors de la récupération du véhicule",
      });
    }
  }

  // Afficher le formulaire d'ajout de véhicule
  async showAddVehiculeForm(req, res) {
    try {
      // Si un ID client est fourni, on le récupère pour pré-sélectionner
      let client = null;
      if (req.query.clientId) {
        const clientId = parseInt(req.query.clientId);
        client = await clientsService.getClientById(clientId);
      }

      // Récupérer tous les clients pour le menu déroulant
      const clients = await clientsService.getAllClients();

      res.render("vehicules/form", {
        title: "Ajouter un véhicule",
        vehicule: { ClientID: client ? client.ClientID : "" },
        clients,
        selectedClient: client,
        isNew: true,
      });
    } catch (error) {
      console.error("Erreur dans showAddVehiculeForm:", error);
      res.status(500).render("error", {
        title: "Erreur",
        message: "Une erreur est survenue lors du chargement du formulaire",
      });
    }
  }

  // Traiter l'ajout d'un véhicule
  async addVehicule(req, res) {
    try {
      const vehiculeData = {
        clientId: parseInt(req.body.clientId),
        immatriculation: req.body.immatriculation,
        marque: req.body.marque,
        modele: req.body.modele,
        annee: parseInt(req.body.annee),
      };

      const vehiculeId = await vehiculesService.addVehicule(vehiculeData);

      req.session.flashMessage = {
        type: "success",
        text: "Véhicule ajouté avec succès",
      };

      // Rediriger vers la page du véhicule ou vers la liste des véhicules du client
      if (req.body.returnToClient) {
        res.redirect(`/clients/${vehiculeData.clientId}`);
      } else {
        res.redirect(`/vehicules/${vehiculeId}`);
      }
    } catch (error) {
      console.error("Erreur dans addVehicule:", error);

      try {
        // Récupérer à nouveau la liste des clients pour le formulaire
        const clients = await clientsService.getAllClients();

        res.render("vehicules/form", {
          title: "Ajouter un véhicule",
          vehicule: {
            ClientID: req.body.clientId,
            Immatriculation: req.body.immatriculation,
            Marque: req.body.marque,
            Modele: req.body.modele,
            Annee: req.body.annee,
          },
          clients,
          isNew: true,
          error: "Une erreur est survenue lors de l'ajout du véhicule",
        });
      } catch (err) {
        res.status(500).render("error", {
          title: "Erreur",
          message: "Une erreur est survenue lors de l'ajout du véhicule",
        });
      }
    }
  }
}

module.exports = new VehiculesController();

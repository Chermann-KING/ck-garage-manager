const vehiculesService = require("../services/vehicules.service");
const clientsService = require("../services/clients.service");

class VehiculesController {
  // Afficher la liste des véhicules
  async listVehicules(req, res) {
    try {
      const sortByType = req.query.sort === "type";
      const vehicules = await vehiculesService.getAllVehicules();

      // Trier les véhicules si nécessaire
      if (sortByType) {
        vehicules.sort((a, b) => a.marque.localeCompare(b.marque));
      }

      res.render("vehicules/list", {
        title: "Liste des véhicules",
        vehicules,
        sortByType,
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

  // Afficher les véhicules d'un client
  async listVehiculesClient(req, res) {
    try {
      const clientId = req.params.clientId;
      const vehicules = await vehiculesService.getVehiculesByClientId(clientId);
      res.render("vehicules/list", {
        title: "Véhicules du client",
        vehicules,
        clientId,
      });
    } catch (error) {
      console.error("Erreur dans listVehiculesClient:", error);
      res.status(500).render("error", {
        title: "Erreur",
        message:
          "Une erreur est survenue lors de la récupération des véhicules du client",
      });
    }
  }

  // Afficher le détail d'un véhicule
  async showVehicule(req, res) {
    try {
      const vehiculeId = req.params.id;
      const vehicule = await vehiculesService.getVehiculeById(vehiculeId);

      if (!vehicule) {
        return res.status(404).render("error", {
          title: "Véhicule non trouvé",
          message: "Le véhicule demandé n'existe pas",
        });
      }

      res.render("vehicules/details", {
        title: `${vehicule.marque} ${vehicule.modele}`,
        vehicule,
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
      console.log("Paramètres reçus:", req.params);
      const clientId = req.params.clientId;

      if (!clientId) {
        return res.status(400).render("error", {
          title: "Erreur",
          message: "L'ID du client est requis",
        });
      }

      const clients = await clientsService.getAllClients();
      const selectedClient = await clientsService.getClientById(clientId);

      if (!selectedClient) {
        return res.status(404).render("error", {
          title: "Client non trouvé",
          message: "Le client spécifié n'existe pas",
        });
      }

      console.log("Client sélectionné:", selectedClient);

      res.render("vehicules/form", {
        title: "Ajouter un véhicule",
        vehicule: { clientid: clientId },
        clients,
        selectedClient,
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
      console.log("Données reçues:", req.body);
      console.log("Paramètres:", req.params);

      const clientId = req.params.clientId;
      const vehiculeData = {
        ...req.body,
        clientid: clientId,
      };

      const newVehicule = await vehiculesService.createVehicule(vehiculeData);

      if (req.body.returnToClient) {
        res.redirect(`/clients/${clientId}`);
      } else {
        res.redirect(`/vehicules/${newVehicule.id}`);
      }
    } catch (error) {
      console.error("Erreur dans addVehicule:", error);
      res.render("vehicules/form", {
        title: "Ajouter un véhicule",
        vehicule: { ...req.body, clientid: req.params.clientId },
        isNew: true,
        error: "Une erreur est survenue lors de l'ajout du véhicule",
      });
    }
  }

  // Afficher le formulaire de modification d'un véhicule
  async showEditVehiculeForm(req, res) {
    try {
      const vehiculeId = req.params.id;
      const vehicule = await vehiculesService.getVehiculeById(vehiculeId);

      if (!vehicule) {
        return res.status(404).render("error", {
          title: "Véhicule non trouvé",
          message: "Le véhicule demandé n'existe pas",
        });
      }

      res.render("vehicules/form", {
        title: `Modifier ${vehicule.marque} ${vehicule.modele}`,
        vehicule,
        isNew: false,
      });
    } catch (error) {
      console.error("Erreur dans showEditVehiculeForm:", error);
      res.status(500).render("error", {
        title: "Erreur",
        message: "Une erreur est survenue lors de la récupération du véhicule",
      });
    }
  }

  // Traiter la modification d'un véhicule
  async updateVehicule(req, res) {
    try {
      const vehiculeId = req.params.id;
      const updatedVehicule = await vehiculesService.updateVehicule(
        vehiculeId,
        req.body
      );

      req.session.flashMessage = {
        type: "success",
        text: "Véhicule modifié avec succès",
      };

      res.redirect(`/vehicules/${updatedVehicule.id}`);
    } catch (error) {
      console.error("Erreur dans updateVehicule:", error);
      res.render("vehicules/form", {
        title: "Modifier un véhicule",
        vehicule: {
          id: req.params.id,
          ...req.body,
        },
        isNew: false,
        error: "Une erreur est survenue lors de la modification du véhicule",
      });
    }
  }
}

module.exports = new VehiculesController();

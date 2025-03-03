const clientsService = require("../services/clients.service");

class ClientsController {
  // Afficher la liste des clients
  async listClients(req, res) {
    try {
      let clients;
      // Si le paramètre de tri est présent et égal à 'vehicules'
      if (req.query.sort === "vehicules") {
        clients = await clientsService.getClientsSortedByVehicleCount();
      } else {
        clients = await clientsService.getAllClients();
      }

      res.render("clients/list", {
        title: "Liste des clients",
        clients,
        sortByVehicles: req.query.sort === "vehicules",
      });
    } catch (error) {
      console.error("Erreur dans listClients:", error);
      res.status(500).render("error", {
        title: "Erreur",
        message: "Une erreur est survenue lors de la récupération des clients",
      });
    }
  }

  // Afficher le détail d'un client
  async showClient(req, res) {
    try {
      const clientId = parseInt(req.params.id);
      const client = await clientsService.getClientById(clientId);

      if (!client) {
        return res.status(404).render("error", {
          title: "Client non trouvé",
          message: "Le client demandé n'existe pas",
        });
      }

      res.render("clients/details", {
        title: `${client.Prenom} ${client.Nom}`,
        client,
      });
    } catch (error) {
      console.error("Erreur dans showClient:", error);
      res.status(500).render("error", {
        title: "Erreur",
        message: "Une erreur est survenue lors de la récupération du client",
      });
    }
  }

  // Afficher le formulaire d'ajout de client
  showAddClientForm(req, res) {
    res.render("clients/form", {
      title: "Ajouter un client",
      client: {},
      isNew: true,
    });
  }

  // Traiter l'ajout d'un client
  async addClient(req, res) {
    const { nom, prenom, telephone, email } = req.body;
    try {
      const clientData = {
        nom,
        prenom,
        telephone,
        email,
      };

      const clientId = await clientsService.addClient(clientData);

      req.session.flashMessage = {
        type: "success",
        text: "Client ajouté avec succès",
      };

      res.redirect(`/clients/${clientId}`);
    } catch (error) {
      console.error("Erreur dans addClient:", error);
      res.render("clients/form", {
        title: "Ajouter un client",
        client: req.body,
        isNew: true,
        error: "Une erreur est survenue lors de l'ajout du client",
      });
    }
  }

  // Afficher le formulaire de modification d'un client
  async showEditClientForm(req, res) {
    try {
      const clientId = parseInt(req.params.id);
      const client = await clientsService.getClientById(clientId);

      if (!client) {
        return res.status(404).render("error", {
          title: "Client non trouvé",
          message: "Le client demandé n'existe pas",
        });
      }

      res.render("clients/form", {
        title: `Modifier ${client.Prenom} ${client.Nom}`,
        client,
        isNew: false,
      });
    } catch (error) {
      console.error("Erreur dans showEditClientForm:", error);
      res.status(500).render("error", {
        title: "Erreur",
        message: "Une erreur est survenue lors de la récupération du client",
      });
    }
  }

  // Traiter la modification d'un client
  async updateClient(req, res) {
    const { nom, prenom, telephone, email } = req.body;
    try {
      const clientId = parseInt(req.params.id);
      const clientData = {
        nom,
        prenom,
        telephone,
        email,
      };

      await clientsService.updateClient(clientId, clientData);

      req.session.flashMessage = {
        type: "success",
        text: "Client modifié avec succès",
      };

      res.redirect(`/clients/${clientId}`);
    } catch (error) {
      console.error("Erreur dans updateClient:", error);

      const client = {
        ClientID: req.params.id,
        ...req.body,
      };

      res.render("clients/form", {
        title: "Modifier un client",
        client,
        isNew: false,
        error: "Une erreur est survenue lors de la modification du client",
      });
    }
  }
}

module.exports = new ClientsController();

const supabase = require("../config/supabase");

class ClientsService {
  // Récupérer tous les clients avec leurs véhicules
  async getAllClients() {
    try {
      console.log("[ClientsService] Tentative de récupération des clients...");

      const { data: clientsData, error } = await supabase
        .from("clients")
        .select(
          `
          *,
          nombre_vehicules:vehicules(count)
        `
        )
        .order("nom");

      if (error) {
        console.error("[ClientsService] Erreur Supabase:", error);
        throw error;
      }

      console.log("[ClientsService] Données reçues:", clientsData);

      // Transformer les données pour correspondre au format attendu
      const clients = clientsData.map((client) => ({
        clientid: client.clientid,
        nom: client.nom,
        prenom: client.prenom,
        email: client.email,
        telephone: client.telephone,
        nombre_vehicules: client.nombre_vehicules[0].count,
      }));

      console.log("[ClientsService] Données transformées:", clients);
      return clients;
    } catch (error) {
      console.error("[ClientsService] Erreur détaillée:", error);
      throw error;
    }
  }

  // Récupérer un client par son ID avec ses véhicules
  async getClientById(id) {
    try {
      console.log("[ClientsService] Récupération du client:", id);
      const { data: client, error } = await supabase
        .from("clients")
        .select(
          `
          *,
          vehicules (
            vehiculeid,
            marque,
            modele,
            annee,
            immatriculation,
            interventions (
              statut
            )
          )
        `
        )
        .eq("clientid", id)
        .single();

      if (error) {
        console.error(
          "[ClientsService] Erreur lors de la récupération du client:",
          error
        );
        throw error;
      }

      console.log("[ClientsService] Client récupéré:", client);

      // Traiter les interventions pour chaque véhicule
      const vehiculesWithInterventions = client.vehicules.map((vehicule) => {
        const interventions_en_cours =
          vehicule.interventions?.filter((i) => i.statut === "En cours")
            .length || 0;
        const interventions_terminees =
          vehicule.interventions?.filter((i) => i.statut === "Terminé")
            .length || 0;

        return {
          vehiculeid: vehicule.vehiculeid,
          marque: vehicule.marque,
          modele: vehicule.modele,
          annee: vehicule.annee,
          immatriculation: vehicule.immatriculation,
          interventions_en_cours,
          interventions_terminees,
        };
      });

      return {
        clientid: client.clientid,
        nom: client.nom,
        prenom: client.prenom,
        email: client.email,
        telephone: client.telephone,
        vehicules: vehiculesWithInterventions,
      };
    } catch (error) {
      console.error(
        `[ClientsService] Erreur détaillée pour le client ${id}:`,
        error
      );
      throw error;
    }
  }

  // Ajouter un nouveau client
  async createClient(clientData) {
    try {
      const { data: newClient, error } = await supabase
        .from("clients")
        .insert([
          {
            nom: clientData.nom,
            prenom: clientData.prenom,
            email: clientData.email,
            telephone: clientData.telephone,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return {
        clientid: newClient.clientid,
        nom: newClient.nom,
        prenom: newClient.prenom,
        email: newClient.email,
        telephone: newClient.telephone,
        nombre_vehicules: 0,
      };
    } catch (error) {
      console.error("Erreur lors de la création du client:", error);
      throw error;
    }
  }

  // Mettre à jour un client existant
  async updateClient(id, clientData) {
    try {
      const { data: updatedClient, error } = await supabase
        .from("clients")
        .update({
          nom: clientData.nom,
          prenom: clientData.prenom,
          email: clientData.email,
          telephone: clientData.telephone,
        })
        .eq("clientid", id)
        .select()
        .single();

      if (error) throw error;

      return {
        clientid: updatedClient.clientid,
        nom: updatedClient.nom,
        prenom: updatedClient.prenom,
        email: updatedClient.email,
        telephone: updatedClient.telephone,
      };
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du client ${id}:`, error);
      throw error;
    }
  }

  // Trier les clients par nombre de véhicules
  async getClientsSortedByVehicleCount() {
    try {
      const { data: clientsData, error } = await supabase.from("clients")
        .select(`
          *,
          nombre_vehicules:vehicules(count)
        `);

      if (error) throw error;

      console.log("[ClientsService] Données reçues pour le tri:", clientsData);

      // Transformer et trier les données
      const sortedClients = clientsData
        .map((client) => ({
          clientid: client.clientid,
          nom: client.nom,
          prenom: client.prenom,
          email: client.email,
          telephone: client.telephone,
          nombre_vehicules: client.nombre_vehicules[0].count,
        }))
        .sort((a, b) => b.nombre_vehicules - a.nombre_vehicules);

      console.log("[ClientsService] Données triées:", sortedClients);
      return sortedClients;
    } catch (error) {
      console.error(
        "Erreur lors du tri des clients par nombre de véhicules:",
        error
      );
      throw error;
    }
  }

  async deleteClient(id) {
    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("clientid", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression du client ${id}:`, error);
      throw error;
    }
  }
}

module.exports = new ClientsService();

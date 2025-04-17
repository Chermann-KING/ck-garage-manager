const supabase = require("../config/supabase");

class VehiculesService {
  // Récupérer tous les véhicules avec le nom de leur propriétaire
  async getAllVehicules() {
    try {
      const { data: vehiculesData, error } = await supabase
        .from("vehicules")
        .select(
          `
          vehiculeid,
          clientid,
          marque,
          modele,
          annee,
          immatriculation,
          clients (
            nom,
            prenom
          ),
          interventions:interventions!left (
            interventionid,
            statut
          )
        `
        )
        .order("marque");

      if (error) throw error;

      // Compter les interventions pour chaque véhicule
      const vehiculesWithCounts = vehiculesData.map((vehicule) => {
        const interventions = vehicule.interventions || [];
        return {
          id: vehicule.vehiculeid,
          clientid: vehicule.clientid,
          marque: vehicule.marque,
          modele: vehicule.modele,
          annee: vehicule.annee,
          immatriculation: vehicule.immatriculation,
          proprietaire: vehicule.clients
            ? `${vehicule.clients.nom} ${vehicule.clients.prenom}`
            : "Non renseigné",
          interventions_en_cours: interventions.filter(
            (i) => i.statut === "En cours"
          ).length,
          interventions_terminees: interventions.filter(
            (i) => i.statut === "Terminé"
          ).length,
        };
      });

      return vehiculesWithCounts;
    } catch (error) {
      console.error("Erreur lors de la récupération des véhicules:", error);
      throw error;
    }
  }

  // Récupérer les véhicules d'un client spécifique
  async getVehiculesByClientId(clientId) {
    try {
      const { data: vehiculesData, error } = await supabase
        .from("vehicules")
        .select(
          `
          vehiculeid,
          clientid,
          marque,
          modele,
          annee,
          immatriculation,
          interventions:interventions!left (
            interventionid,
            statut
          )
        `
        )
        .eq("clientid", clientId)
        .order("marque");

      if (error) throw error;

      // Compter les interventions pour chaque véhicule
      const vehiculesWithCounts = vehiculesData.map((vehicule) => {
        const interventions = vehicule.interventions || [];
        return {
          id: vehicule.vehiculeid,
          clientid: vehicule.clientid,
          marque: vehicule.marque,
          modele: vehicule.modele,
          annee: vehicule.annee,
          immatriculation: vehicule.immatriculation,
          nombre_interventions: interventions.length,
          interventions_en_cours: interventions.filter(
            (i) => i.statut === "En cours"
          ).length,
          interventions_terminees: interventions.filter(
            (i) => i.statut === "Terminé"
          ).length,
        };
      });

      return vehiculesWithCounts;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des véhicules du client ${clientId}:`,
        error
      );
      throw error;
    }
  }

  // Récupérer un véhicule par son ID
  async getVehiculeById(id) {
    try {
      const { data: vehicule, error } = await supabase
        .from("vehicules")
        .select(
          `
          vehiculeid,
          clientid,
          marque,
          modele,
          annee,
          immatriculation,
          clients (
            nom,
            prenom,
            email,
            telephone
          ),
          interventions!left (
            interventionid,
            date_intervention,
            description,
            prix,
            statut,
            types_interventions (
              nom,
              description,
              prix_base
            )
          )
        `
        )
        .eq("vehiculeid", id)
        .single();

      if (error) throw error;

      return {
        id: vehicule.vehiculeid,
        clientid: vehicule.clientid,
        marque: vehicule.marque,
        modele: vehicule.modele,
        annee: vehicule.annee,
        immatriculation: vehicule.immatriculation,
        proprietaire: vehicule.clients
          ? `${vehicule.clients.nom} ${vehicule.clients.prenom}`
          : "Non renseigné",
        client: vehicule.clients
          ? {
              nom: vehicule.clients.nom,
              prenom: vehicule.clients.prenom,
              email: vehicule.clients.email,
              telephone: vehicule.clients.telephone,
            }
          : null,
        interventions: vehicule.interventions
          ? vehicule.interventions.map((intervention) => ({
              id: intervention.interventionid,
              date: intervention.date_intervention,
              type: intervention.types_interventions.nom,
              description: intervention.description,
              prix: intervention.prix,
              statut: intervention.statut,
            }))
          : [],
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération du véhicule ${id}:`, error);
      throw error;
    }
  }

  // Ajouter un nouveau véhicule
  async createVehicule(vehiculeData) {
    try {
      const { data: newVehicule, error } = await supabase
        .from("vehicules")
        .insert([
          {
            clientid: vehiculeData.clientid,
            marque: vehiculeData.marque,
            modele: vehiculeData.modele,
            annee: vehiculeData.annee,
            immatriculation: vehiculeData.immatriculation,
          },
        ])
        .select(
          `
          *,
          clients (
            nom,
            prenom
          )
        `
        )
        .single();

      if (error) throw error;

      return {
        id: newVehicule.vehiculeid,
        clientid: newVehicule.clientid,
        marque: newVehicule.marque,
        modele: newVehicule.modele,
        annee: newVehicule.annee,
        immatriculation: newVehicule.immatriculation,
        proprietaire: `${newVehicule.clients.nom} ${newVehicule.clients.prenom}`,
      };
    } catch (error) {
      console.error("Erreur lors de la création du véhicule:", error);
      throw error;
    }
  }

  // Récupérer l'historique des interventions d'un véhicule
  async getVehiculeInterventionsHistory(vehiculeId) {
    try {
      const { data, error } = await supabase
        .from("interventions")
        .select(
          `
          *,
          types_interventions (
            nom
          )
        `
        )
        .eq("vehiculeid", vehiculeId)
        .order("date_intervention", { ascending: false });

      if (error) throw error;
      return data.map((intervention) => ({
        ...intervention,
        type_intervention: intervention.types_interventions.nom,
      }));
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de l'historique des interventions:",
        error
      );
      throw error;
    }
  }

  // Trier les véhicules par type (marque)
  async getVehiculesSortedByType() {
    try {
      const { data, error } = await supabase
        .from("vehicules")
        .select(
          `
          *,
          clients (
            nom,
            prenom
          )
        `
        )
        .order("marque");

      if (error) throw error;
      return data.map((vehicule) => ({
        ...vehicule,
        proprietaire: `${vehicule.clients.nom} ${vehicule.clients.prenom}`,
      }));
    } catch (error) {
      console.error("Erreur lors du tri des véhicules par type:", error);
      throw error;
    }
  }

  async updateVehicule(id, vehiculeData) {
    try {
      const { data: updatedVehicule, error } = await supabase
        .from("vehicules")
        .update({
          marque: vehiculeData.marque,
          modele: vehiculeData.modele,
          annee: vehiculeData.annee,
          immatriculation: vehiculeData.immatriculation,
        })
        .eq("vehiculeid", id)
        .select(
          `
          *,
          clients (
            nom,
            prenom
          )
        `
        )
        .single();

      if (error) throw error;

      return {
        id: updatedVehicule.vehiculeid,
        clientid: updatedVehicule.clientid,
        marque: updatedVehicule.marque,
        modele: updatedVehicule.modele,
        annee: updatedVehicule.annee,
        immatriculation: updatedVehicule.immatriculation,
        proprietaire: `${updatedVehicule.clients.nom} ${updatedVehicule.clients.prenom}`,
      };
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du véhicule ${id}:`, error);
      throw error;
    }
  }

  async deleteVehicule(id) {
    try {
      const { error } = await supabase
        .from("vehicules")
        .delete()
        .eq("vehiculeid", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression du véhicule ${id}:`, error);
      throw error;
    }
  }

  async getVehiculesByMarque() {
    try {
      const { data, error } = await supabase
        .from("vehicules")
        .select(
          `
          *,
          clients (
            nom,
            prenom
          )
        `
        )
        .order("marque");

      if (error) throw error;
      return data.map((vehicule) => ({
        ...vehicule,
        proprietaire: `${vehicule.clients.nom} ${vehicule.clients.prenom}`,
      }));
    } catch (error) {
      console.error("Erreur lors du tri des véhicules par marque:", error);
      throw error;
    }
  }
}

module.exports = new VehiculesService();

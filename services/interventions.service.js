const supabase = require("../config/supabase");

class InterventionsService {
  // Récupérer toutes les interventions avec détails
  async getAllInterventions() {
    try {
      const { data, error } = await supabase
        .from("interventions")
        .select(
          `
          *,
          vehicules (
            *,
            clients (
              nom,
              prenom
            )
          ),
          types_interventions (
            nom
          )
        `
        )
        .order("date_intervention", { ascending: false });

      if (error) throw error;
      return data.map((intervention) => ({
        ...intervention,
        marque: intervention.vehicules.marque,
        modele: intervention.vehicules.modele,
        immatriculation: intervention.vehicules.immatriculation,
        proprietaire: `${intervention.vehicules.clients.nom} ${intervention.vehicules.clients.prenom}`,
        type_intervention: intervention.types_interventions.nom,
      }));
    } catch (error) {
      console.error("Erreur lors de la récupération des interventions:", error);
      throw error;
    }
  }

  // Récupérer une intervention par son ID
  async getInterventionById(id) {
    try {
      const { data, error } = await supabase
        .from("interventions")
        .select(
          `
          *,
          vehicules (
            *,
            clients (
              *
            )
          ),
          types_interventions (
            *
          )
        `
        )
        .eq("interventionid", id)
        .single();

      if (error) throw error;
      return {
        ...data,
        marque: data.vehicules.marque,
        modele: data.vehicules.modele,
        immatriculation: data.vehicules.immatriculation,
        proprietaire: `${data.vehicules.clients.nom} ${data.vehicules.clients.prenom}`,
        type_intervention: data.types_interventions.nom,
      };
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de l'intervention ${id}:`,
        error
      );
      throw error;
    }
  }

  // Récupérer tous les types d'interventions
  async getAllInterventionTypes() {
    try {
      console.log(
        "[InterventionsService] Récupération des types d'interventions"
      );
      const { data, error } = await supabase
        .from("types_interventions")
        .select("*");

      if (error) {
        console.error(
          "[InterventionsService] Erreur lors de la récupération des types d'interventions:",
          error
        );
        throw error;
      }

      console.log(
        "[InterventionsService] Types d'interventions récupérés:",
        data
      );
      return data.map((type) => ({
        typeid: type.typeid,
        nom: type.nom,
        description: type.description,
        prix_base: type.prix_base,
      }));
    } catch (error) {
      console.error("[InterventionsService] Erreur détaillée:", error);
      throw error;
    }
  }

  // Récupérer un type d'intervention par son ID
  async getInterventionTypeById(typeId) {
    try {
      const { data, error } = await supabase
        .from("types_interventions")
        .select("*")
        .eq("typeid", typeId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération du type d'intervention:",
        error
      );
      throw error;
    }
  }

  // Planifier une nouvelle intervention
  async planifierIntervention(interventionData) {
    try {
      console.log("Données reçues:", interventionData);

      const dataToInsert = {
        vehiculeid: parseInt(interventionData.vehicule_id),
        typeid: parseInt(interventionData.type_id),
        date_intervention: interventionData.date_intervention,
        statut: interventionData.statut,
        prix: interventionData.prix ? parseFloat(interventionData.prix) : null,
        description: interventionData.description || null,
      };

      console.log("Données à insérer:", dataToInsert);

      const { data, error } = await supabase
        .from("interventions")
        .insert([dataToInsert])
        .select()
        .single();

      if (error) {
        console.error(
          "Erreur lors de la planification de l'intervention:",
          error
        );
        throw error;
      }

      console.log("Intervention créée:", data);
      return data.interventionid;
    } catch (error) {
      console.error(
        "Erreur lors de la planification de l'intervention:",
        error
      );
      throw error;
    }
  }

  // Mettre à jour le statut d'une intervention
  async updateInterventionStatus(id, status, description = null) {
    try {
      const updateData = {
        statut: status,
        ...(description && { description: description }),
      };

      const { data, error } = await supabase
        .from("interventions")
        .update(updateData)
        .eq("interventionid", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour du statut de l'intervention ${id}:`,
        error
      );
      throw error;
    }
  }

  // Calculer le prix d'une intervention
  async calculateInterventionPrice(typeId, customPrice = null) {
    try {
      if (customPrice !== null) {
        return parseFloat(customPrice);
      }

      const { data, error } = await supabase
        .from("types_interventions")
        .select("prix_base")
        .eq("typeid", typeId)
        .single();

      if (error) throw error;
      return data.prix_base;
    } catch (error) {
      console.error("Erreur lors du calcul du prix de l'intervention:", error);
      throw error;
    }
  }

  async createIntervention(interventionData) {
    try {
      const { data, error } = await supabase
        .from("interventions")
        .insert([interventionData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erreur lors de la création de l'intervention:", error);
      throw error;
    }
  }

  async updateIntervention(id, interventionData) {
    try {
      const { data, error } = await supabase
        .from("interventions")
        .update(interventionData)
        .eq("interventionid", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour de l'intervention ${id}:`,
        error
      );
      throw error;
    }
  }

  async deleteIntervention(id) {
    try {
      const { error } = await supabase
        .from("interventions")
        .delete()
        .eq("interventionid", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(
        `Erreur lors de la suppression de l'intervention ${id}:`,
        error
      );
      throw error;
    }
  }
}

module.exports = new InterventionsService();

const { connectToDatabase, sql } = require("../config/db");

class InterventionsService {
  // Récupérer toutes les interventions avec détails
  async getAllInterventions() {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request().query(`
        SELECT i.*, 
               ti.Nom AS TypeIntervention, 
               v.Immatriculation, v.Marque, v.Modele,
               c.Nom + ' ' + c.Prenom AS Proprietaire
        FROM Interventions i
        JOIN Types_Interventions ti ON i.TypeID = ti.TypeID
        JOIN Vehicules v ON i.VehiculeID = v.VehiculeID
        JOIN Clients c ON v.ClientID = c.ClientID
        ORDER BY i.Date_Intervention DESC
      `);
      return result.recordset;
    } catch (error) {
      console.error("Erreur lors de la récupération des interventions:", error);
      throw error;
    }
  }

  // Récupérer une intervention par son ID
  async getInterventionById(interventionId) {
    try {
      const pool = await connectToDatabase();
      const result = await pool
        .request()
        .input("interventionId", sql.Int, interventionId).query(`
          SELECT i.*, 
                 ti.Nom AS TypeIntervention, ti.Prix_base,
                 v.VehiculeID, v.Immatriculation, v.Marque, v.Modele,
                 c.ClientID, c.Nom + ' ' + c.Prenom AS Proprietaire
          FROM Interventions i
          JOIN Types_Interventions ti ON i.TypeID = ti.TypeID
          JOIN Vehicules v ON i.VehiculeID = v.VehiculeID
          JOIN Clients c ON v.ClientID = c.ClientID
          WHERE i.InterventionID = @interventionId
        `);

      if (result.recordset.length === 0) {
        return null;
      }

      return result.recordset[0];
    } catch (error) {
      console.error("Erreur lors de la récupération de l'intervention:", error);
      throw error;
    }
  }

  // Récupérer tous les types d'interventions
  async getAllInterventionTypes() {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request().query(`
        SELECT * FROM Types_Interventions
        ORDER BY Nom
      `);
      return result.recordset;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des types d'interventions:",
        error
      );
      throw error;
    }
  }

  // Récupérer un type d'intervention par son ID
  async getInterventionTypeById(typeId) {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request().input("typeId", sql.Int, typeId)
        .query(`
          SELECT * FROM Types_Interventions
          WHERE TypeID = @typeId
        `);

      if (result.recordset.length === 0) {
        return null;
      }

      return result.recordset[0];
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
      // Récupérer le prix de base du type d'intervention
      const pool = await connectToDatabase();
      const typeResult = await pool
        .request()
        .input("typeId", sql.Int, interventionData.typeId).query(`
          SELECT Prix_base FROM Types_Interventions
          WHERE TypeID = @typeId
        `);

      if (typeResult.recordset.length === 0) {
        throw new Error("Type d'intervention non trouvé");
      }

      // Calculer le prix final (on utilise le prix de base si aucun prix personnalisé n'est spécifié)
      const prixBase = typeResult.recordset[0].Prix_base;
      const prixFinal = interventionData.prix || prixBase;

      // Insérer l'intervention
      const result = await pool
        .request()
        .input("vehiculeId", sql.Int, interventionData.vehiculeId)
        .input("typeId", sql.Int, interventionData.typeId)
        .input(
          "dateIntervention",
          sql.Date,
          new Date(interventionData.dateIntervention)
        )
        .input("statut", sql.NVarChar, interventionData.statut || "Planifié")
        .input("prix", sql.Decimal, prixFinal)
        .input("description", sql.NVarChar, interventionData.description || "")
        .query(`
          INSERT INTO Interventions (VehiculeID, TypeID, Date_Intervention, Statut, Prix, Description)
          OUTPUT INSERTED.InterventionID
          VALUES (@vehiculeId, @typeId, @dateIntervention, @statut, @prix, @description)
        `);

      return result.recordset[0].InterventionID;
    } catch (error) {
      console.error(
        "Erreur lors de la planification de l'intervention:",
        error
      );
      throw error;
    }
  }

  // Mettre à jour le statut d'une intervention
  async updateInterventionStatus(
    interventionId,
    newStatus,
    description = null
  ) {
    try {
      const pool = await connectToDatabase();

      let query = `
        UPDATE Interventions
        SET Statut = @statut
      `;

      // Ajouter la mise à jour de la description si fournie
      if (description !== null) {
        query += `, Description = @description`;
      }

      query += ` WHERE InterventionID = @interventionId`;

      const request = pool
        .request()
        .input("interventionId", sql.Int, interventionId)
        .input("statut", sql.NVarChar, newStatus);

      if (description !== null) {
        request.input("description", sql.NVarChar, description);
      }

      await request.query(query);

      return true;
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du statut de l'intervention:",
        error
      );
      throw error;
    }
  }

  // Calculer le prix d'une intervention
  async calculateInterventionPrice(typeId, customPrice = null) {
    try {
      // Si un prix personnalisé est fourni, on l'utilise
      if (customPrice !== null) {
        return parseFloat(customPrice);
      }

      // Sinon, on utilise le prix de base du type d'intervention
      const pool = await connectToDatabase();
      const result = await pool.request().input("typeId", sql.Int, typeId)
        .query(`
          SELECT Prix_base FROM Types_Interventions
          WHERE TypeID = @typeId
        `);

      if (result.recordset.length === 0) {
        throw new Error("Type d'intervention non trouvé");
      }

      return result.recordset[0].Prix_base;
    } catch (error) {
      console.error("Erreur lors du calcul du prix de l'intervention:", error);
      throw error;
    }
  }
}

module.exports = new InterventionsService();

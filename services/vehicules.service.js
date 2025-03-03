const { connectToDatabase, sql } = require("../config/db");

class VehiculesService {
  // Récupérer tous les véhicules avec le nom de leur propriétaire
  async getAllVehicules() {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request().query(`
        SELECT v.*, c.Nom + ' ' + c.Prenom AS Proprietaire
        FROM Vehicules v
        JOIN Clients c ON v.ClientID = c.ClientID
        ORDER BY v.Marque, v.Modele
      `);
      return result.recordset;
    } catch (error) {
      console.error("Erreur lors de la récupération des véhicules:", error);
      throw error;
    }
  }

  // Récupérer les véhicules d'un client spécifique
  async getVehiculesByClientId(clientId) {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request().input("clientId", sql.Int, clientId)
        .query(`
          SELECT v.*
          FROM Vehicules v
          WHERE v.ClientID = @clientId
          ORDER BY v.Marque, v.Modele
        `);
      return result.recordset;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des véhicules du client:",
        error
      );
      throw error;
    }
  }

  // Récupérer un véhicule par son ID
  async getVehiculeById(vehiculeId) {
    try {
      const pool = await connectToDatabase();
      const result = await pool
        .request()
        .input("vehiculeId", sql.Int, vehiculeId).query(`
          SELECT v.*, c.Nom + ' ' + c.Prenom AS Proprietaire, c.ClientID
          FROM Vehicules v
          JOIN Clients c ON v.ClientID = c.ClientID
          WHERE v.VehiculeID = @vehiculeId
        `);

      if (result.recordset.length === 0) {
        return null;
      }

      return result.recordset[0];
    } catch (error) {
      console.error("Erreur lors de la récupération du véhicule:", error);
      throw error;
    }
  }

  // Ajouter un nouveau véhicule
  async addVehicule(vehiculeData) {
    try {
      const pool = await connectToDatabase();
      const result = await pool
        .request()
        .input("clientId", sql.Int, vehiculeData.clientId)
        .input("immatriculation", sql.NVarChar, vehiculeData.immatriculation)
        .input("marque", sql.NVarChar, vehiculeData.marque)
        .input("modele", sql.NVarChar, vehiculeData.modele)
        .input("annee", sql.Int, vehiculeData.annee).query(`
          INSERT INTO Vehicules (ClientID, Immatriculation, Marque, Modele, Annee)
          OUTPUT INSERTED.VehiculeID
          VALUES (@clientId, @immatriculation, @marque, @modele, @annee)
        `);

      return result.recordset[0].VehiculeID;
    } catch (error) {
      console.error("Erreur lors de l'ajout du véhicule:", error);
      throw error;
    }
  }

  // Récupérer l'historique des interventions d'un véhicule
  async getVehiculeInterventionsHistory(vehiculeId) {
    try {
      const pool = await connectToDatabase();
      const result = await pool
        .request()
        .input("vehiculeId", sql.Int, vehiculeId).query(`
          SELECT i.*, ti.Nom AS TypeIntervention
          FROM Interventions i
          JOIN Types_Interventions ti ON i.TypeID = ti.TypeID
          WHERE i.VehiculeID = @vehiculeId
          ORDER BY i.Date_Intervention DESC
        `);

      return result.recordset;
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
      const pool = await connectToDatabase();
      const result = await pool.request().query(`
        SELECT v.*, c.Nom + ' ' + c.Prenom AS Proprietaire
        FROM Vehicules v
        JOIN Clients c ON v.ClientID = c.ClientID
        ORDER BY v.Marque, v.Modele, v.Annee DESC
      `);
      return result.recordset;
    } catch (error) {
      console.error("Erreur lors du tri des véhicules par type:", error);
      throw error;
    }
  }
}

module.exports = new VehiculesService();

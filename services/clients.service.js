const { connectToDatabase, sql } = require("../config/db");

class ClientsService {
  // Récupérer tous les clients avec leurs véhicules
  async getAllClients() {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request().query(`
        SELECT c.*, 
               COUNT(v.VehiculeID) AS NombreVehicules
        FROM Clients c
        LEFT JOIN Vehicules v ON c.ClientID = v.ClientID
        GROUP BY c.ClientID, c.Nom, c.Prenom, c.Telephone, c.Email
        ORDER BY c.Nom, c.Prenom
      `);
      return result.recordset;
    } catch (error) {
      console.error("Erreur lors de la récupération des clients:", error);
      throw error;
    }
  }

  // Récupérer un client par son ID avec ses véhicules
  async getClientById(clientId) {
    try {
      const pool = await connectToDatabase();

      // Récupérer les infos du client
      const clientResult = await pool
        .request()
        .input("clientId", sql.Int, clientId).query(`
          SELECT * FROM Clients
          WHERE ClientID = @clientId
        `);

      if (clientResult.recordset.length === 0) {
        return null;
      }

      const client = clientResult.recordset[0];

      // Récupérer les véhicules du client
      const vehiculesResult = await pool
        .request()
        .input("clientId", sql.Int, clientId).query(`
          SELECT * FROM Vehicules
          WHERE ClientID = @clientId
        `);

      client.vehicules = vehiculesResult.recordset;

      // Récupérer l'historique des interventions pour les véhicules du client
      const interventionsResult = await pool
        .request()
        .input("clientId", sql.Int, clientId).query(`
          SELECT i.*, v.Immatriculation, v.Marque, v.Modele, ti.Nom AS TypeIntervention
          FROM Interventions i
          JOIN Vehicules v ON i.VehiculeID = v.VehiculeID
          JOIN Types_Interventions ti ON i.TypeID = ti.TypeID
          WHERE v.ClientID = @clientId
          ORDER BY i.Date_Intervention DESC
        `);

      client.interventions = interventionsResult.recordset;

      return client;
    } catch (error) {
      console.error("Erreur lors de la récupération du client:", error);
      throw error;
    }
  }

  // Ajouter un nouveau client
  async addClient(clientData) {
    try {
      const pool = await connectToDatabase();
      const result = await pool
        .request()
        .input("nom", sql.NVarChar, clientData.nom)
        .input("prenom", sql.NVarChar, clientData.prenom)
        .input("telephone", sql.NVarChar, clientData.telephone)
        .input("email", sql.NVarChar, clientData.email).query(`
          INSERT INTO Clients (Nom, Prenom, Telephone, Email)
          OUTPUT INSERTED.ClientID
          VALUES (@nom, @prenom, @telephone, @email)
        `);

      return result.recordset[0].ClientID;
    } catch (error) {
      console.error("Erreur lors de l'ajout du client:", error);
      throw error;
    }
  }

  // Mettre à jour un client existant
  async updateClient(clientId, clientData) {
    try {
      const pool = await connectToDatabase();
      await pool
        .request()
        .input("clientId", sql.Int, clientId)
        .input("nom", sql.NVarChar, clientData.nom)
        .input("prenom", sql.NVarChar, clientData.prenom)
        .input("telephone", sql.NVarChar, clientData.telephone)
        .input("email", sql.NVarChar, clientData.email).query(`
          UPDATE Clients
          SET Nom = @nom,
              Prenom = @prenom,
              Telephone = @telephone,
              Email = @email
          WHERE ClientID = @clientId
        `);

      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du client:", error);
      throw error;
    }
  }

  // Trier les clients par nombre de véhicules
  async getClientsSortedByVehicleCount() {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request().query(`
        SELECT c.*, 
               COUNT(v.VehiculeID) AS NombreVehicules
        FROM Clients c
        LEFT JOIN Vehicules v ON c.ClientID = v.ClientID
        GROUP BY c.ClientID, c.Nom, c.Prenom, c.Telephone, c.Email
        ORDER BY COUNT(v.VehiculeID) DESC, c.Nom, c.Prenom
      `);
      return result.recordset;
    } catch (error) {
      console.error(
        "Erreur lors du tri des clients par nombre de véhicules:",
        error
      );
      throw error;
    }
  }
}

module.exports = new ClientsService();

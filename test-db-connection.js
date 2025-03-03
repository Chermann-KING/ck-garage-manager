const db = require("./config/db");

async function testDatabaseConnection() {
  try {
    console.log("Tentative de connexion à la base de données...");
    const pool = await db.connectToDatabase();
    console.log("Connexion établie avec succès!");

    // Test simple pour vérifier l'accès à la base de données
    try {
      const result = await pool.request().query("SELECT @@VERSION AS version");
      console.log("Version de SQL Server:", result.recordset[0].version);
      console.log("Test de requête réussi!");
    } catch (queryError) {
      console.error(
        "Erreur lors de l'exécution de la requête test:",
        queryError
      );
    }

    // Fermer la connexion
    await pool.close();
    console.log("Connexion fermée");
  } catch (error) {
    console.error("Erreur de connexion à la base de données:", error);

    console.log("\nSuggestions de dépannage:");
    console.log("1. Vérifiez que SQL Server est en cours d'exécution");
    console.log('2. Vérifiez que le service "SQL Server Browser" est démarré');
    console.log(
      "3. Assurez-vous que TCP/IP est activé dans SQL Server Configuration Manager"
    );
    console.log(
      "4. Vérifiez que le pare-feu Windows autorise les connexions SQL Server"
    );
    console.log(
      '5. Essayez de vous connecter avec "localhost" ou "127.0.0.1" plutôt que le nom de la machine'
    );
    console.log(
      "6. Vérifiez les paramètres d'authentification (Windows vs SQL)"
    );
  }
}

testDatabaseConnection();

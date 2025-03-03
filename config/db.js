const sql = require("mssql");

const { DB_USER, DB_PASSWORD, DB_SERVER, DB_DATABASE, DB_PORT } = process.env;

const dbConfig = {
  user: DB_USER,
  password: DB_PASSWORD,
  server: DB_SERVER,
  database: DB_DATABASE,
  options: {
    trustServerCertificate: true,
  },
  port: parseInt(DB_PORT),
};

async function connectToDatabase() {
  try {
    console.log("Tentative de connexion à SQL Server...");
    const pool = await sql.connect(dbConfig);
    console.log("Connecté à la base de données SQL Server");
    return pool;
  } catch (error) {
    console.error("Erreur de connexion à la base de données:", error);
    throw error;
  }
}

module.exports = {
  connectToDatabase,
  sql,
};

const supabase = require("./supabase");

async function connectToDatabase() {
  try {
    console.log("Tentative de connexion à Supabase...");

    // Test de connexion
    const { data, error } = await supabase
      .from("clients")
      .select("count")
      .single();

    if (error) throw error;

    console.log("Connecté à la base de données Supabase");
    return supabase;
  } catch (error) {
    console.error("Erreur de connexion à la base de données:", error);
    throw error;
  }
}

module.exports = {
  connectToDatabase,
  supabase,
};

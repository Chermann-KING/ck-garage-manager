const { createClient } = require("@supabase/supabase-js");

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error("Erreur: Variables d'environnement Supabase manquantes");
  console.error(
    "Assurez-vous que SUPABASE_URL et SUPABASE_ANON_KEY sont définies dans le fichier .env"
  );
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = supabase;

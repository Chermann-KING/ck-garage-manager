const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");

// Importation des routers
const clientsRouter = require("./routers/clients.router");
const vehiculesRouter = require("./routers/vehicules.router");
const interventionsRouter = require("./routers/interventions.router");

// Initialisation de l'application Express
const app = express();
const port = process.env.PORT || 3000;

// Configuration du moteur de template PUG
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "garage_management_secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Mettre à true si HTTPS est utilisé
  })
);

// Routes
app.get("/", (req, res) => {
  res.render("index", { title: "Gestionnaire de Garage" });
});

// Utilisation des routers
app.use("/clients", clientsRouter);
app.use("/vehicules", vehiculesRouter);
app.use("/interventions", interventionsRouter);

// Gestion des erreurs 404
app.use((req, res, next) => {
  res.status(404).render("error", {
    title: "Page non trouvée",
    message: "La page que vous recherchez n'existe pas.",
  });
});

// Gestion des erreurs serveur
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", {
    title: "Erreur serveur",
    message: "Une erreur est survenue sur le serveur.",
  });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});

module.exports = app;

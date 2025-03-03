// Script pour l'application de gestion de garage

// Initialisation de Lucide pour les icônes
lucide.createIcons();

// Toggle du menu mobile
const navToggle = document.querySelector(".nav-mobile-toggle");
const navMenu = document.getElementById("navbarMenu");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("hidden");
  });
}

// Système de thème (light/dark)
const themeToggle = document.getElementById("theme-toggle");

// Vérifier la préférence de l'utilisateur dans le localStorage
const storedTheme = localStorage.getItem("theme") || "light";

// Appliquer le thème au chargement de la page
if (
  storedTheme === "dark" ||
  (!storedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
) {
  document.documentElement.classList.add("dark");
} else {
  document.documentElement.classList.remove("dark");
}

// Toggle du thème au clic
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

// Auto-disparition des messages flash après 5 secondes
const flashMessage = document.querySelector(".alert:not(.alert-info)");
if (flashMessage) {
  setTimeout(function () {
    flashMessage.style.opacity = "0";
    flashMessage.style.transition = "opacity 0.5s";
    setTimeout(function () {
      flashMessage.remove();
    }, 500);
  }, 5000);
}

// Gestion des dropdowns
document.querySelectorAll("[data-dropdown]").forEach((toggle) => {
  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    const dropdown = toggle.nextElementSibling;
    dropdown.classList.toggle("hidden");
  });
});

// Montrer les sous-menus au survol sur desktop
document.querySelectorAll(".group").forEach((group) => {
  group.addEventListener("mouseenter", () => {
    if (window.innerWidth >= 768) {
      const dropdown = group.querySelector(".dropdown-menu");
      if (dropdown) dropdown.classList.remove("hidden");
    }
  });

  group.addEventListener("mouseleave", () => {
    if (window.innerWidth >= 768) {
      const dropdown = group.querySelector(".dropdown-menu");
      if (dropdown) dropdown.classList.add("hidden");
    }
  });
});

// Mise à jour automatique du prix basé sur le type d'intervention sélectionné
const typeSelect = document.getElementById("typeId");
const prixInput = document.getElementById("prix");

if (typeSelect && prixInput) {
  typeSelect.addEventListener("change", function () {
    const selectedOption = this.options[this.selectedIndex];
    if (selectedOption && selectedOption.dataset.prix) {
      prixInput.placeholder = selectedOption.dataset.prix + " €";
    } else {
      prixInput.placeholder = "Laissez vide pour le prix de base";
    }
  });
}

// Validation des formulaires
const forms = document.querySelectorAll("form");
forms.forEach((form) => {
  form.addEventListener(
    "submit",
    function (event) {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add("was-validated");
    },
    false
  );
});

// Adaptation du menu pour mobile/desktop
function adjustMenuForScreen() {
  if (window.innerWidth >= 768) {
    navMenu.classList.remove("hidden");
    navMenu.classList.add("desktop-menu");
  } else {
    navMenu.classList.add("hidden");
    navMenu.classList.remove("desktop-menu");
  }
}

// Appliquer les ajustements au chargement et au redimensionnement
window.addEventListener("load", adjustMenuForScreen);
window.addEventListener("resize", adjustMenuForScreen);

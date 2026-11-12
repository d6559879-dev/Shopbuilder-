/* =====================================
   DUKANI — Système d'internationalisation
===================================== */

import { CONFIG } from './config.js';
import { fr } from './locales/fr.js';
import { en } from './locales/en.js';

const messages = { fr, en };

let localeActuelle = localStorage.getItem("dukani-locale") || CONFIG.DEFAULT_LOCALE;

/**
 * Récupère une traduction
 * Exemple : t("nav.home") → "Accueil"
 */
export function t(cle) {
  const parties = cle.split(".");
  let valeur = messages[localeActuelle];

  for (const partie of parties) {
    if (valeur && typeof valeur === "object") {
      valeur = valeur[partie];
    } else {
      return cle; // clé non trouvée
    }
  }

  return valeur || cle;
}

/**
 * Change la langue de l'application
 */
export function setLocale(nouvelleLocale) {
  if (!CONFIG.SUPPORTED_LOCALES.includes(nouvelleLocale)) return;

  localeActuelle = nouvelleLocale;
  localStorage.setItem("dukani-locale", nouvelleLocale);
  document.documentElement.lang = nouvelleLocale;

  // Déclenche un événement pour que les pages puissent se mettre à jour
  window.dispatchEvent(new CustomEvent("locale-changed", { detail: nouvelleLocale }));
}

/**
 * Retourne la langue actuelle
 */
export function getLocale() {
  return localeActuelle;
}

/**
 * Applique les traductions sur tous les éléments qui ont data-i18n
 * Exemple : <span data-i18n="nav.home"></span>
 */
export function appliquerTraductions() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const cle = el.getAttribute("data-i18n");
    el.textContent = t(cle);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const cle = el.getAttribute("data-i18n-placeholder");
    el.placeholder = t(cle);
  });
}

// Initialisation
document.documentElement.lang = localeActuelle;

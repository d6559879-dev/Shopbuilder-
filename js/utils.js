/* =====================================
   DUKANI — Fonctions utilitaires
===================================== */

/**
 * Raccourci pour document.getElementById
 */
export const $ = (id) => document.getElementById(id);

/**
 * Ouvre une fenêtre (ajoute la classe "active")
 */
export function ouvrir(id) {
  const el = $(id);
  if (el) el.classList.add("active");
}

/**
 * Ferme une fenêtre (retire la classe "active")
 */
export function fermer(id) {
  const el = $(id);
  if (el) el.classList.remove("active");
}

/**
 * Affiche un message d'erreur simple
 */
export function echec(e) {
  const msg = (e && e.message) || "Erreur de connexion. Réessayez.";
  alert("⚠️ " + msg);
}

/**
 * Formate un prix selon la devise
 */
export function formaterPrix(montant, devise = "FC") {
  const symbole = devise === "USD" ? "$" : "FC";
  return Number(montant).toLocaleString("fr-FR") + " " + symbole;
}

/**
 * Temps écoulé depuis une date ISO (ex: "il y a 5 min")
 */
export function tempsEcoule(iso) {
  const minutes = Math.max(
    0,
    Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  );

  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return "il y a " + minutes + " min";
  if (minutes < 1440) return "il y a " + Math.floor(minutes / 60) + " h";
  return "il y a " + Math.floor(minutes / 1440) + " j";
}

/**
 * Crée un élément HTML simple
 */
export function creerElement(tag, texte = "", className = "") {
  const el = document.createElement(tag);
  if (texte) el.textContent = texte;
  if (className) el.className = className;
  return el;
}

/**
 * Vérifie si une valeur est un entier valide ≥ 0
 */
export function entierValide(v) {
  return v !== "" && Number.isInteger(Number(v)) && Number(v) >= 0;
}

/**
 * Vérifie si une valeur est un prix valide ≥ 0
 */
export function prixValide(v) {
  return v !== "" && Number.isFinite(Number(v)) && Number(v) >= 0;
}

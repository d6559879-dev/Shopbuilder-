/* =====================================
   DUKANI — Boot (initialisation des modules)
   À charger en type="module" après le SDK Supabase
===================================== */

import { appliquerTraductions, setLocale, getLocale, t } from './i18n.js';
import { CONFIG } from './config.js';

// Expose quelques fonctions globalement pour pouvoir les utiliser
// depuis le HTML existant (onclick, etc.) pendant la transition
window.Dukani = window.Dukani || {};
window.Dukani.t = t;
window.Dukani.setLocale = setLocale;
window.Dukani.getLocale = getLocale;
window.Dukani.appliquerTraductions = appliquerTraductions;

// Applique les traductions au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  appliquerTraductions();
  console.log('[Dukani] Modules chargés — langue :', getLocale());
});

// Ré-applique les traductions si la langue change
window.addEventListener('locale-changed', () => {
  appliquerTraductions();
});

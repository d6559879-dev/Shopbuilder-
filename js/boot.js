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

/**
 * Crée le sélecteur de langue (Français / English)
 * Style proche du sélecteur de thème existant.
 */
window.creerChoixLangue = function () {
  const groupe = document.createElement('div');
  groupe.className = 'choix-theme choix-langue';

  const langues = [
    { code: 'fr', nom: 'Français' },
    { code: 'en', nom: 'English' }
  ];

  const localeActuelle = getLocale();

  langues.forEach((l) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('data-locale', l.code);
    b.textContent = l.nom;

    if (l.code === localeActuelle) {
      b.classList.add('actif');
      b.setAttribute('aria-pressed', 'true');
    } else {
      b.setAttribute('aria-pressed', 'false');
    }

    b.addEventListener('click', () => {
      setLocale(l.code);

      // Met à jour l'état visuel des boutons
      groupe.querySelectorAll('button').forEach((btn) => {
        const actif = btn.getAttribute('data-locale') === l.code;
        btn.classList.toggle('actif', actif);
        btn.setAttribute('aria-pressed', actif ? 'true' : 'false');
      });

      // Reconstruit le menu pour traduire les libellés du menu aussi
      if (typeof construireMenu === 'function') {
        construireMenu();
      }
    });

    groupe.appendChild(b);
  });

  return groupe;
};

// Applique les traductions au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  appliquerTraductions();
  console.log('[Dukani] Modules chargés — langue :', getLocale());
});

// Ré-applique les traductions si la langue change
window.addEventListener('locale-changed', () => {
  appliquerTraductions();
});

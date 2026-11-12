# Architecture Vanilla — Dukani

## Nouveaux modules créés

```
js/
├── config.js          ← Configuration centrale (Supabase, langues...)
├── supabase.js        ← Client Supabase + urlPublique()
├── utils.js           ← Fonctions communes ($, ouvrir, fermer, prix...)
├── i18n.js            ← Système de traduction
└── locales/
    ├── fr.js          ← Français
    └── en.js          ← English
```

## Comment utiliser

### 1. Dans ton HTML (exemple index.html)

```html
<!-- Charger le SDK Supabase d'abord -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- Puis tes modules (type="module") -->
<script type="module">
  import { t, setLocale, appliquerTraductions } from './js/i18n.js';
  import { sb } from './js/supabase.js';
  import { $, formaterPrix } from './js/utils.js';

  // Appliquer les traductions au chargement
  appliquerTraductions();

  // Changer de langue
  // setLocale('en');
</script>
```

### 2. Traduire un texte dans le HTML

```html
<button data-i18n="nav.home">Accueil</button>
<input data-i18n-placeholder="home.searchPlaceholder" placeholder="Rechercher...">
```

### 3. Traduire en JavaScript

```js
import { t } from './js/i18n.js';

alert(t('common.error'));
```

## Prochaines étapes

1. Migrer progressivement le code de `marche.js` et `script.js` vers ces modules
2. Remplacer les textes en dur par `t('clé')` ou `data-i18n`
3. Découper le CSS en plusieurs fichiers plus petits

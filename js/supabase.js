/* =====================================
   DUKANI — Client Supabase
===================================== */

import { CONFIG } from './config.js';

// Le SDK Supabase doit être chargé dans le HTML avant ce module :
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

export const sb = supabase.createClient(
  CONFIG.SUPABASE_URL,
  CONFIG.SUPABASE_ANON_KEY
);

/**
 * Retourne l'URL publique d'un fichier dans le bucket "produits"
 */
export function urlPublique(chemin) {
  if (!chemin) return null;
  return (
    CONFIG.SUPABASE_URL +
    "/storage/v1/object/public/" +
    CONFIG.STORAGE_BUCKET +
    "/" +
    chemin.split("/").map(encodeURIComponent).join("/")
  );
}

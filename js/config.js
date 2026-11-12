/* =====================================
   DUKANI — Configuration centrale
===================================== */

export const CONFIG = {
  // Supabase
  SUPABASE_URL: "https://aowfjpaclhrmmhpuxauq.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_bHKXQAMowU0qoVOp5RqlmA_Qm_LrKC6",

  // Application
  APP_NAME: "Dukani",
  DEFAULT_LOCALE: "fr",
  SUPPORTED_LOCALES: ["fr", "en"],

  // Storage
  STORAGE_BUCKET: "produits",

  // Divers
  INACTIVITE_MAX: 30 * 60 * 1000, // 30 minutes
};

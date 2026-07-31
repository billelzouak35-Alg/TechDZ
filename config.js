// ============================================
// TechDZ — Supabase Configuration
// ============================================

const SUPABASE_CONFIG = {
  url: 'https://iguuxkodbvegnocqvfso.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlndXV4a29kYnZlZ25vY3F2ZnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5ODQ2MTUsImV4cCI6MjEwMDU2MDYxNX0.s954UrmstKudcgWCkfUq3-oWAYjL9oYVdpsc1FOyUUs'
};

window.SUPABASE_URL = SUPABASE_CONFIG.url;
window.SUPABASE_ANON_KEY = SUPABASE_CONFIG.anonKey;

// ============================================
// URL de base de l'application (GitHub Pages avec sous-dossier ou local)
// Ex: https://user.github.io/TechDZ-master/ ou file:///.../TechDZ-master/
// ============================================
const APP_URL = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/') + '/';
window.APP_URL = APP_URL;

// ============================================
// CONFIGURATION DU DASHBOARD SUPABASE (à faire une fois) :
//
// 1. Authentication → Sign In / Up :
//    - Activez "Email" → désactivez "Confirm email" ? NON :
//      GARDEZ "Confirm email" COCHÉ (le site gère l'email non confirmé).
//
// 2. Authentication → URL Configuration :
//    - Site URL (production) : https://<votre-utilisateur>.github.io/TechDZ-master/
//    - Redirect URLs :
//        https://<votre-utilisateur>.github.io/TechDZ-master/auth-callback.html
//        https://<votre-utilisateur>.github.io/TechDZ-master/change-password.html
//        https://<votre-utilisateur>.github.io/TechDZ-master/index.html
//        http://localhost:5500/auth-callback.html  (si test en local)
//        http://localhost:5500/change-password.html (si test en local)
//
// 3. Authentication → Providers : Google activé avec Client ID/Secret OAuth
//    (Console Google Cloud) si le bouton Google doit fonctionner.
//
// 4. Émails de confirmation : personnalisables dans
//    Authentication → Emails Templates ("Confirm signup").
//
// IMPORTANT : sans ces réglages, le lien de confirmation redirigera
// vers l'URL par défaut (non reconnue) et auth-callback.html ne sera pas appelé.
// ============================================

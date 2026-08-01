// ============================================
// TechDZ — Authentication Module
// ============================================

const Auth = {
  supabase: null,

  init() {
    if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
      console.error('Supabase config missing: check config.js');
      return false;
    }
    if (!window.supabase) {
      console.error('Supabase client library not loaded');
      return false;
    }
    this.supabase = window.supabase.createClient(
      window.SUPABASE_URL,
      window.SUPABASE_ANON_KEY
    );
    return true;
  },

  getClient() {
    if (!this.supabase) {
      const ok = this.init();
      if (!ok) throw new Error('Supabase not initialized — check config.js');
    }
    return this.supabase;
  },

  // URL de retour après confirmation d'email
  authCallbackUrl() {
    const lang = localStorage.getItem('techdz-lang');
    return window.APP_URL + 'auth-callback.html' + (lang ? '?lang=' + lang : '');
  },

  // Sign up with email/password
  async signUp(email, password, fullName, captchaToken, emailRedirectTo) {
    try {
      const client = this.getClient();
      const options = { data: { full_name: fullName } };
      // Token hCaptcha (optionnel : requis uniquement si le captcha est activé côté Supabase)
      if (captchaToken) options.captchaToken = captchaToken;
      if (emailRedirectTo || window.APP_URL) {
        options.emailRedirectTo = emailRedirectTo || this.authCallbackUrl();
      }
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options
      });

      if (error) return { data, error };

      // Ne créer le profil qu'une fois l'email confirmé
      // (la création au moment de la confirmation se fait dans auth-callback.html)
      if (data?.user && data.user.email_confirmed_at) {
        await client.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName || 'Utilisateur'
        }, { onConflict: 'id' });
      }

      return { data, error };
    } catch (e) {
      return { data: null, error: { message: e.message } };
    }
  },

  // Renvoyer l'email de confirmation
  async resendConfirmation(email) {
    try {
      const client = this.getClient();
      const options = {};
      if (window.APP_URL) options.emailRedirectTo = this.authCallbackUrl();
      const { data, error } = await client.auth.resend({
        type: 'signup',
        email,
        options
      });
      return { data, error };
    } catch (e) {
      return { data: null, error: { message: e.message } };
    }
  },

  // Vérifier si l'email d'un utilisateur est confirmé
  isEmailConfirmed(user) {
    return !!(user && user.email_confirmed_at);
  },

  // Demander un email de réinitialisation de mot de passe
  // Le lien de l'email mène vers change-password.html (URL à ajouter
  // dans les Redirect URLs du dashboard Supabase)
  async requestPasswordReset(email) {
    try {
      const client = this.getClient();
      const lang = localStorage.getItem('techdz-lang');
      const redirectTo = window.APP_URL + 'change-password.html' + (lang ? '?lang=' + lang : '');
      const { data, error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo
      });
      return { data, error };
    } catch (e) {
      return { data: null, error: { message: e.message } };
    }
  },

  // Changer le mot de passe (session de récupération active)
  async updatePassword(newPassword) {
    try {
      const client = this.getClient();
      const { data, error } = await client.auth.updateUser({
        password: newPassword
      });
      return { data, error };
    } catch (e) {
      return { data: null, error: { message: e.message } };
    }
  },

  // Récupérer la session courante (jetons dans l'URL après confirmation)
  // Compatible avec les versions sync et async de supabase-js v2
  async getSession() {
    const client = this.getClient();
    const res = await client.auth.getSession();
    return { session: (res && res.data && res.data.session) || null };
  },

  // Sign in with email/password
  async signIn(email, password, captchaToken) {
    try {
      const client = this.getClient();
      const options = {};
      // Token hCaptcha (optionnel : requis uniquement si le captcha est activé côté Supabase)
      if (captchaToken) options.captchaToken = captchaToken;
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
        options
      });
      return { data, error };
    } catch (e) {
      return { data: null, error: { message: e.message } };
    }
  },

  // Réinitialiser le widget hCaptcha (token utilisé, expiré ou erreur)
  resetCaptcha() {
    try {
      if (window.hcaptcha && typeof window.hcaptcha.reset === 'function') {
        window.hcaptcha.reset();
      }
    } catch (e) {
      console.error('Erreur lors de la réinitialisation hCaptcha :', e);
    }
  },

  // Sign in with Google
  async signInWithGoogle() {
    const client = this.getClient();
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: (window.APP_URL || window.location.origin + '/') + 'index.html'
      }
    });
    return { data, error };
  },

  // Sign out — comportement selon redirectUrl :
  //   - string : redirige vers cette URL
  //   - null   : aucune redirection (déconnexion seule)
  //   - absent : redirige vers index.html (comportement par défaut)
  async signOut(redirectUrl) {
    try {
      const client = this.getClient();
      const { error } = await client.auth.signOut();
      localStorage.removeItem('techdz-user');
      if (typeof redirectUrl === 'string') {
        window.location.href = redirectUrl;
        return { error };
      }
      if (redirectUrl === null) return { error };
      const base = window.location.pathname.includes('/admin/') ? '../' : '';
      window.location.href = base + 'index.html';
      return { error };
    } catch (e) {
      localStorage.removeItem('techdz-user');
      if (typeof redirectUrl === 'string') {
        window.location.href = redirectUrl;
        return { error: e };
      }
      if (redirectUrl === null) return { error: e };
      window.location.href = 'index.html';
      return { error: e };
    }
  },

  // Get current user
  async getUser() {
    const client = this.getClient();
    const { data: { user }, error } = await client.auth.getUser();
    return { user, error };
  },

  // Get user profile
  async getProfile(userId) {
    const client = this.getClient();
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  // Update profile
  async updateProfile(userId, updates) {
    try {
      const client = this.getClient();
      const { data, error } = await client
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      return { data, error };
    } catch (e) {
      return { data: null, error: { message: e.message } };
    }
  },

  // Listen for auth changes
  onAuthStateChange(callback) {
    const client = this.getClient();
    return client.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },

  // Check if user is admin
  async isAdmin(userId) {
    const { data } = await this.getProfile(userId);
    return data && data.role === 'admin';
  },

  // Check if user is moderator or admin
  async isModerator(userId) {
    const { data } = await this.getProfile(userId);
    return data && ['admin', 'moderator'].includes(data.role);
  }
};

window.Auth = Auth;

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

  // Sign up with email/password
  async signUp(email, password, fullName) {
    try {
      const client = this.getClient();
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });

      if (error) return { data, error };

      if (data?.user) {
        await client.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName || 'Utilisateur'
        }, { onConflict: 'id' });
      }

      return { data, error };
    } catch (e) {
      return { data: null, error: { message: e.message } };
    }
  },

  // Sign in with email/password
  async signIn(email, password) {
    try {
      const client = this.getClient();
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password
      });
      return { data, error };
    } catch (e) {
      return { data: null, error: { message: e.message } };
    }
  },

  // Sign in with Google
  async signInWithGoogle() {
    const client = this.getClient();
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/index.html'
      }
    });
    return { data, error };
  },

  // Sign out
  async signOut() {
    const client = this.getClient();
    const { error } = await client.auth.signOut();
    if (!error) {
      localStorage.removeItem('techdz-user');
      window.location.href = '/index.html';
    }
    return { error };
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
    const client = this.getClient();
    const { data, error } = await client
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
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

// ============================================
// TechDZ — Database Module
// ============================================

const DB = {
  getClient() {
    return window.Auth.getClient();
  },

  // ==========================================
  // FORUM
  // ==========================================
  async getForumCategories() {
    const client = this.getClient();
    const { data, error } = await client
      .from('forum_categories')
      .select('*')
      .order('sort_order');
    return { data, error };
  },

  async getForumPosts({ category, page = 1, limit = 20, search } = {}) {
    const client = this.getClient();
    let query = client
      .from('forum_posts')
      .select('*, author:profiles(full_name, avatar_url, role), category:forum_categories(name, slug, color)', { count: 'exact' })
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (category) query = query.eq('category_id', category);
    if (search) query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);

    const { data, error, count } = await query;
    return { data, error, count };
  },

  async getForumPost(postId) {
    const client = this.getClient();
    const { data, error } = await client
      .from('forum_posts')
      .select('*, author:profiles(full_name, avatar_url, role, job_title), category:forum_categories(name, slug, color)')
      .eq('id', postId)
      .single();
    return { data, error };
  },

  async createForumPost(post) {
    const client = this.getClient();
    const { data, error } = await client
      .from('forum_posts')
      .insert(post)
      .select()
      .single();
    return { data, error };
  },

  async updateForumPost(postId, updates) {
    const client = this.getClient();
    const { data, error } = await client
      .from('forum_posts')
      .update(updates)
      .eq('id', postId)
      .select()
      .single();
    return { data, error };
  },

  async deleteForumPost(postId) {
    const client = this.getClient();
    const { error } = await client
      .from('forum_posts')
      .delete()
      .eq('id', postId);
    return { error };
  },

  async getForumReplies(postId) {
    const client = this.getClient();
    const { data, error } = await client
      .from('forum_replies')
      .select('*, author:profiles(full_name, avatar_url, role, job_title)')
      .eq('post_id', postId)
      .order('is_accepted', { ascending: false })
      .order('created_at');
    return { data, error };
  },

  async createForumReply(reply) {
    const client = this.getClient();
    const { data, error } = await client
      .from('forum_replies')
      .insert(reply)
      .select()
      .single();
    return { data, error };
  },

  async votePost(postId, userId, value) {
    const client = this.getClient();
    const { data, error } = await client
      .from('forum_votes')
      .upsert({ post_id: postId, user_id: userId, value })
      .select();
    return { data, error };
  },

  async incrementViews(table, id) {
    const client = this.getClient();
    await client.rpc('increment_views', { table_name: table, row_id: id });
  },

  // ==========================================
  // JOBS
  // ==========================================
  async getJobOffers({ category, location, type, page = 1, limit = 20 } = {}) {
    const client = this.getClient();
    let query = client
      .from('job_offers')
      .select('*, author:profiles(full_name, avatar_url)', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (category) query = query.eq('category', category);
    if (location) query = query.ilike('location', `%${location}%`);
    if (type) query = query.eq('job_type', type);

    const { data, error, count } = await query;
    return { data, error, count };
  },

  async createJobOffer(job) {
    const client = this.getClient();
    const { data, error } = await client
      .from('job_offers')
      .insert(job)
      .select()
      .single();
    return { data, error };
  },

  async deleteJobOffer(jobId) {
    const client = this.getClient();
    const { error } = await client
      .from('job_offers')
      .delete()
      .eq('id', jobId);
    return { error };
  },

  // ==========================================
  // TRAINING
  // ==========================================
  async getTrainingCourses({ level, category, page = 1, limit = 20 } = {}) {
    const client = this.getClient();
    let query = client
      .from('training_courses')
      .select('*, instructor:profiles(full_name, avatar_url)', { count: 'exact' })
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (level) query = query.eq('level', level);
    if (category) query = query.eq('category', category);

    const { data, error, count } = await query;
    return { data, error, count };
  },

  async createCourse(course) {
    const client = this.getClient();
    const { data, error } = await client
      .from('training_courses')
      .insert(course)
      .select()
      .single();
    return { data, error };
  },

  // ==========================================
  // EVENTS
  // ==========================================
  async getEvents({ type, upcoming = true, page = 1, limit = 20 } = {}) {
    const client = this.getClient();
    let query = client
      .from('events')
      .select('*, organizer:profiles(full_name, avatar_url)', { count: 'exact' })
      .eq('is_active', true)
      .order('event_date', { ascending: true })
      .range((page - 1) * limit, page * limit - 1);

    if (type) query = query.eq('event_type', type);
    if (upcoming) query = query.gte('event_date', new Date().toISOString().slice(0, 10));

    const { data, error, count } = await query;
    return { data, error, count };
  },

  async createEvent(event) {
    const client = this.getClient();
    const { data, error } = await client
      .from('events')
      .insert(event)
      .select()
      .single();
    return { data, error };
  },

  async registerForEvent(eventId, userId) {
    const client = this.getClient();
    const { data, error } = await client
      .from('event_registrations')
      .insert({ event_id: eventId, user_id: userId })
      .select()
      .single();
    return { data, error };
  },

  // ==========================================
  // NEWS
  // ==========================================
  async getNewsArticles({ category, page = 1, limit = 20 } = {}) {
    return this.getNews({ category, page, limit });
  },

  async createNewsArticle(article) {
    const client = this.getClient();
    const { data, error } = await client
      .from('news_articles')
      .insert(article)
      .select()
      .single();
    return { data, error };
  },

  async getNews({ category, page = 1, limit = 20 } = {}) {
    const client = this.getClient();
    let query = client
      .from('news_articles')
      .select('*, author:profiles(full_name, avatar_url)', { count: 'exact' })
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (category) query = query.eq('category', category);

    const { data, error, count } = await query;
    return { data, error, count };
  },

  // ==========================================
  // ADMIN STATISTICS
  // ==========================================
  async getUsers() {
    const client = this.getClient();
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async getJobOffersForStats() {
    const client = this.getClient();
    const { data, error } = await client
      .from('job_offers')
      .select('*')
      .eq('is_active', true);
    return { data, error };
  },

  async getAdminStats() {
    const client = this.getClient();

    const [users, posts, jobs, courses, events, news] = await Promise.all([
      client.from('profiles').select('*', { count: 'exact', head: true }),
      client.from('forum_posts').select('*', { count: 'exact', head: true }),
      client.from('job_offers').select('*', { count: 'exact', head: true }).eq('is_active', true),
      client.from('training_courses').select('*', { count: 'exact', head: true }).eq('is_published', true),
      client.from('events').select('*', { count: 'exact', head: true }).eq('is_active', true),
      client.from('news_articles').select('*', { count: 'exact', head: true }).eq('is_published', true)
    ]);

    return {
      users: users.count || 0,
      posts: posts.count || 0,
      jobs: jobs.count || 0,
      courses: courses.count || 0,
      events: events.count || 0,
      news: news.count || 0
    };
  },

  async getAllUsers({ page = 1, limit = 50, search } = {}) {
    const client = this.getClient();
    let query = client
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) query = query.or(`full_name.ilike.%${search}%,job_title.ilike.%${search}%`);

    const { data, error, count } = await query;
    return { data, error, count };
  },

  async updateUserRole(userId, role) {
    const client = this.getClient();
    const { data, error } = await client
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  async deleteUser(userId) {
    const client = this.getClient();
    const { error } = await client
      .from('profiles')
      .delete()
      .eq('id', userId);
    return { error };
  },

  // Get all forum posts (admin)
  async getAllForumPosts({ page = 1, limit = 50, search } = {}) {
    const client = this.getClient();
    let query = client
      .from('forum_posts')
      .select('*, author:profiles(full_name, email), category:forum_categories(name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);

    const { data, error, count } = await query;
    return { data, error, count };
  },

  // Get all job offers (admin)
  async getAllJobOffers({ page = 1, limit = 50 } = {}) {
    const client = this.getClient();
    const { data, error, count } = await client
      .from('job_offers')
      .select('*, author:profiles(full_name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    return { data, error, count };
  },

  // Notifications
  async getNotifications(userId) {
    const client = this.getClient();
    const { data, error } = await client
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    return { data, error };
  },

  async markNotificationRead(notifId) {
    const client = this.getClient();
    await client
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notifId);
  }
};

window.DB = DB;

/* ============================================
   TechDZ Admin — Script
   ============================================ */

document.addEventListener('DOMContentLoaded', async () => {
  // Init Supabase
  const ok = Auth.init();
  console.log('Auth.init():', ok);
  if (!ok) {
    console.error('Auth init failed');
    return;
  }

  // Check auth
  const { user, error: userError } = await Auth.getUser();
  console.log('User:', user?.email, 'Error:', userError);
  if (user && !Auth.isEmailConfirmed(user)) {
    await Auth.signOut('../login.html');
    return;
  }
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const isAdmin = await Auth.isAdmin(user.id);
  console.log('Is admin:', isAdmin);
  if (!isAdmin) {
    window.location.href = 'login.html';
    return;
  }

  // Load profile
  const { data: profile } = await Auth.getProfile(user.id);
  if (profile) {
    document.getElementById('sidebarName').textContent = profile.full_name || 'Admin';
    document.getElementById('sidebarAvatar').textContent = (profile.full_name || 'A')[0].toUpperCase();
  }

  // ==========================================
  // Sidebar Navigation
  // ==========================================
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  const sections = document.querySelectorAll('.admin-section');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');

      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      sections.forEach(s => s.classList.remove('active'));
      document.getElementById(`section-${page}`).classList.add('active');

      // Load data for section
      loadSection(page);
    });
  });

  // ==========================================
  // Load Stats
  // ==========================================
  async function loadStats() {
    const stats = await DB.getAdminStats();
    document.getElementById('statUsers').textContent = stats.users.toLocaleString();
    document.getElementById('statPosts').textContent = stats.posts.toLocaleString();
    document.getElementById('statJobs').textContent = stats.jobs.toLocaleString();
    document.getElementById('statEvents').textContent = stats.events.toLocaleString();
    document.getElementById('statCourses').textContent = stats.courses.toLocaleString();
    document.getElementById('statNews').textContent = stats.news.toLocaleString();
    document.getElementById('usersCount').textContent = stats.users;
    document.getElementById('postsCount').textContent = stats.posts;
    document.getElementById('jobsCount').textContent = stats.jobs;
  }

  document.getElementById('refreshBtn')?.addEventListener('click', loadStats);

  // ==========================================
  // Load Section Data
  // ==========================================
  async function loadSection(page) {
    switch (page) {
      case 'dashboard': await loadStats(); break;
      case 'users': await loadUsers(); break;
      case 'posts': await loadPosts(); break;
      case 'jobs': await loadJobs(); break;
      case 'courses': await loadCourses(); break;
      case 'events': await loadEvents(); break;
      case 'news': await loadNews(); break;
    }
  }

  // ==========================================
  // Users
  // ==========================================
  async function loadUsers(search = '') {
    const { data, count } = await DB.getAllUsers({ search });
    const tbody = document.getElementById('usersTableBody');

    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:40px; color:var(--text-muted);">Aucun utilisateur trouvé</td></tr>';
      return;
    }

    tbody.innerHTML = data.map(u => `
      <tr>
        <td>
          <div class="user-cell">
            <div class="user-cell-avatar">${(u.full_name || 'U')[0].toUpperCase()}</div>
            <div>
              <strong>${u.full_name || 'N/A'}</strong><br>
              <span style="color:var(--text-muted); font-size:0.78rem;">${u.job_title || ''}</span>
            </div>
          </div>
        </td>
        <td><span class="role-badge ${u.role}">${u.role}</span></td>
        <td>${u.city || '—'}</td>
        <td>${new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
        <td>
          <div class="actions-cell">
            <button title="Modérateur" onclick="setRole('${u.id}', 'moderator')"><i class="fas fa-shield-alt"></i></button>
            <button title="Admin" onclick="setRole('${u.id}', 'admin')"><i class="fas fa-crown"></i></button>
            <button class="delete" title="Supprimer" onclick="deleteUser('${u.id}')"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');

    document.getElementById('usersInfo').textContent = `${count || data.length} utilisateurs`;
  }

  window.setRole = async (userId, role) => {
    if (!confirm(`Changer le rôle de cet utilisateur en "${role}" ?`)) return;
    await DB.updateUserRole(userId, role);
    loadUsers();
  };

  window.deleteUser = async (userId) => {
    if (!confirm('Supprimer cet utilisateur ? Cette action est irréversible.')) return;
    await DB.deleteUser(userId);
    loadUsers();
  };

  document.getElementById('usersSearch')?.addEventListener('input', (e) => {
    clearTimeout(window._usersSearchTimeout);
    window._usersSearchTimeout = setTimeout(() => loadUsers(e.target.value), 300);
  });

  // ==========================================
  // Posts
  // ==========================================
  async function loadPosts(search = '') {
    const { data } = await DB.getAllForumPosts({ search });
    const tbody = document.getElementById('postsTableBody');

    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px; color:var(--text-muted);">Aucun post trouvé</td></tr>';
      return;
    }

    tbody.innerHTML = data.map(p => `
      <tr>
        <td><strong>${p.title}</strong></td>
        <td>${p.author?.full_name || 'N/A'}</td>
        <td>${p.category?.name || '—'}</td>
        <td>${p.reply_count}</td>
        <td>${new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
        <td>
          <div class="actions-cell">
            <button title="Supprimer" class="delete" onclick="deletePost(${p.id})"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  window.deletePost = async (postId) => {
    if (!confirm('Supprimer ce post ?')) return;
    await DB.deleteForumPost(postId);
    loadPosts();
  };

  document.getElementById('postsSearch')?.addEventListener('input', (e) => {
    clearTimeout(window._postsSearchTimeout);
    window._postsSearchTimeout = setTimeout(() => loadPosts(e.target.value), 300);
  });

  // ==========================================
  // Jobs
  // ==========================================
  async function loadJobs() {
    const { data } = await DB.getAllJobOffers();
    const tbody = document.getElementById('jobsTableBody');

    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px; color:var(--text-muted);">Aucune offre</td></tr>';
      return;
    }

    tbody.innerHTML = data.map(j => `
      <tr>
        <td><strong>${j.title}</strong></td>
        <td>${j.company}</td>
        <td>${j.location}</td>
        <td><span class="role-badge ${j.job_type}">${j.job_type}</span></td>
        <td>${new Date(j.created_at).toLocaleDateString('fr-FR')}</td>
        <td>
          <div class="actions-cell">
            <button class="delete" onclick="deleteJob(${j.id})"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  window.deleteJob = async (jobId) => {
    if (!confirm('Supprimer cette offre ?')) return;
    await DB.deleteJobOffer(jobId);
    loadJobs();
  };

  // ==========================================
  // Courses
  // ==========================================
  async function loadCourses() {
    const client = Auth.getClient();
    const { data } = await client
      .from('training_courses')
      .select('*, instructor:profiles(full_name, avatar_url)')
      .order('created_at', { ascending: false });
    const tbody = document.getElementById('coursesTableBody');

    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px; color:var(--text-muted);">Aucune formation</td></tr>';
      return;
    }

    tbody.innerHTML = data.map(c => `
      <tr>
        <td><strong>${c.title}</strong></td>
        <td><span class="role-badge ${c.level}">${c.level}</span></td>
        <td>${c.enrollment_count}</td>
        <td>⭐ ${c.rating}</td>
        <td><span class="status-badge ${c.is_published ? 'active' : 'inactive'}">${c.is_published ? 'Publié' : 'Brouillon'}</span></td>
        <td>
          <div class="actions-cell">
            <button title="${c.is_published ? 'Dépublier' : 'Publier'}" onclick="toggleCourse(${c.id}, ${!c.is_published})"><i class="fas fa-${c.is_published ? 'eye-slash' : 'eye'}"></i></button>
            <button class="delete" title="Supprimer" onclick="deleteCourse(${c.id})"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  window.toggleCourse = async (id, publish) => {
    const { error } = await DB.toggleCoursePublish(id, publish);
    if (error) console.error('Toggle course error:', error);
    loadCourses();
  };

  window.deleteCourse = async (id) => {
    if (!confirm('Supprimer cette formation ?')) return;
    const { error } = await DB.deleteCourse(id);
    if (error) console.error('Delete course error:', error);
    loadCourses();
  };

  // ==========================================
  // Events
  // ==========================================
  async function loadEvents() {
    const client = Auth.getClient();
    const { data } = await client
      .from('events')
      .select('*, organizer:profiles(full_name, avatar_url)')
      .order('event_date', { ascending: false });
    const tbody = document.getElementById('eventsTableBody');

    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px; color:var(--text-muted);">Aucun événement</td></tr>';
      return;
    }

    tbody.innerHTML = data.map(e => `
      <tr>
        <td><strong>${e.title}</strong></td>
        <td><span class="role-badge">${e.event_type}</span></td>
        <td>${e.location || '—'}</td>
        <td>${new Date(e.event_date).toLocaleDateString('fr-FR')}</td>
        <td>${e.registration_count || 0}/${e.max_participants || '∞'}</td>
        <td>
          <div class="actions-cell">
            <button class="delete" title="Supprimer" onclick="deleteEvent(${e.id})"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  window.deleteEvent = async (id) => {
    if (!confirm('Supprimer cet événement ?')) return;
    const { error } = await DB.deleteEvent(id);
    if (error) console.error('Delete event error:', error);
    loadEvents();
  };

  // ==========================================
  // News
  // ==========================================
  async function loadNews() {
    const client = Auth.getClient();
    const { data } = await client.from('news_articles').select('*').order('created_at', { ascending: false });
    const tbody = document.getElementById('newsTableBody');

    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px; color:var(--text-muted);">Aucune actualité</td></tr>';
      return;
    }

    tbody.innerHTML = data.map(n => `
      <tr>
        <td><strong>${n.title}</strong></td>
        <td>${n.category}</td>
        <td>${n.author_name || '—'}</td>
        <td>${n.views || 0}</td>
        <td><span class="status-badge ${n.is_published ? 'active' : 'inactive'}">${n.is_published ? 'Publié' : 'Brouillon'}</span></td>
        <td>
          <div class="actions-cell">
            <button title="${n.is_published ? 'Dépublier' : 'Publier'}" onclick="toggleNews(${n.id}, ${!n.is_published})"><i class="fas fa-${n.is_published ? 'eye-slash' : 'eye'}"></i></button>
            <button class="delete" title="Supprimer" onclick="deleteNews(${n.id})"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  window.toggleNews = async (id, publish) => {
    const { error } = await DB.toggleNewsPublish(id, publish);
    if (error) console.error('Toggle news error:', error);
    loadNews();
  };

  window.deleteNews = async (id) => {
    if (!confirm('Supprimer cette actualité ?')) return;
    const { error } = await DB.deleteNewsArticle(id);
    if (error) console.error('Delete news error:', error);
    loadNews();
  };

  // ==========================================
  // Logout
  // ==========================================
  document.getElementById('adminLogoutBtn')?.addEventListener('click', async () => {
    await Auth.signOut();
  });

  // ==========================================
  // FORM: Add Job
  // ==========================================
  document.getElementById('formJob')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const client = Auth.getClient();
    const { error } = await client.from('job_offers').insert({
      title: document.getElementById('jobTitle').value.trim(),
      company: document.getElementById('jobCompany').value.trim(),
      location: document.getElementById('jobLocation').value.trim(),
      job_type: document.getElementById('jobType').value,
      category: document.getElementById('jobCategory').value,
      description: document.getElementById('jobDesc').value.trim(),
      contact_email: document.getElementById('jobEmail').value.trim() || null,
      author_id: user.id
    });
    if (error) { alert('Erreur: ' + error.message); return; }
    document.getElementById('modalJob').classList.remove('open');
    e.target.reset();
    loadJobs();
  });

  // ==========================================
  // FORM: Add Course
  // ==========================================
  document.getElementById('formCourse')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const client = Auth.getClient();
    const { error } = await client.from('training_courses').insert({
      title: document.getElementById('courseTitle').value.trim(),
      description: document.getElementById('courseDesc').value.trim(),
      level: document.getElementById('courseLevel').value,
      category: document.getElementById('courseCat').value,
      duration_hours: parseInt(document.getElementById('courseDuration').value) || null,
      instructor_id: user.id,
      is_published: true
    });
    if (error) { alert('Erreur: ' + error.message); return; }
    document.getElementById('modalCourse').classList.remove('open');
    e.target.reset();
    loadCourses();
  });

  // ==========================================
  // FORM: Add Event
  // ==========================================
  document.getElementById('formEvent')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const client = Auth.getClient();
    const { error } = await client.from('events').insert({
      title: document.getElementById('eventTitle').value.trim(),
      description: document.getElementById('eventDesc').value.trim(),
      event_type: document.getElementById('eventType').value,
      event_date: document.getElementById('eventDate').value,
      event_time: document.getElementById('eventTime').value,
      location: document.getElementById('eventLocation').value.trim() || null,
      max_participants: parseInt(document.getElementById('eventMax').value) || null,
      organizer_id: user.id
    });
    if (error) { alert('Erreur: ' + error.message); return; }
    document.getElementById('modalEvent').classList.remove('open');
    e.target.reset();
    loadEvents();
  });

  // ==========================================
  // FORM: Add News
  // ==========================================
  document.getElementById('formNews')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const client = Auth.getClient();
    const { error } = await client.from('news_articles').insert({
      title: document.getElementById('newsTitle').value.trim(),
      content: document.getElementById('newsContent').value.trim(),
      category: document.getElementById('newsCat').value,
      external_link: document.getElementById('newsLink').value.trim() || null,
      author_id: user.id,
      author_name: profile?.full_name || 'Admin'
    });
    if (error) { alert('Erreur: ' + error.message); return; }
    document.getElementById('modalNews').classList.remove('open');
    e.target.reset();
    loadNews();
  });

  // ==========================================
  // FORM: Add User
  // ==========================================
  document.getElementById('formUser')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('userEmail').value.trim();
    const password = document.getElementById('userPassword').value;
    const fullName = document.getElementById('userName').value.trim();
    const role = document.getElementById('userRole').value;
    const city = document.getElementById('userCity').value.trim();
    const jobTitle = document.getElementById('userJobTitle').value.trim();

    const { data, error: signUpError } = await Auth.signUp(email, password, fullName);
    if (signUpError) { alert('Erreur: ' + signUpError.message); return; }

    if (data?.user) {
      const client = Auth.getClient();
      await client.from('profiles').update({ role, city: city || null, job_title: jobTitle || null }).eq('id', data.user.id);
    }

    document.getElementById('modalUser').classList.remove('open');
    e.target.reset();
    loadUsers();
  });

  // ==========================================
  // FORM: Add Post
  // ==========================================
  document.getElementById('formPost')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const client = Auth.getClient();
    const { error } = await client.from('forum_posts').insert({
      title: document.getElementById('postTitle').value.trim(),
      content: document.getElementById('postContent').value.trim(),
      category_id: parseInt(document.getElementById('postCategory').value),
      author_id: user.id
    });
    if (error) { alert('Erreur: ' + error.message); return; }
    document.getElementById('modalPost').classList.remove('open');
    e.target.reset();
    loadPosts();
  });

  // ==========================================
  // Initial Load
  // ==========================================
  await loadStats();
});

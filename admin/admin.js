/* ============================================
   TechDZ Admin — Script
   ============================================ */

document.addEventListener('DOMContentLoaded', async () => {
  // Init Supabase
  Auth.init();

  // Check auth
  const { user } = await Auth.getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const isAdmin = await Auth.isAdmin(user.id);
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
    const { data } = await DB.getTrainingCourses();
    const tbody = document.getElementById('coursesTableBody');

    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:40px; color:var(--text-muted);">Aucune formation</td></tr>';
      return;
    }

    tbody.innerHTML = data.map(c => `
      <tr>
        <td><strong>${c.title}</strong></td>
        <td><span class="role-badge ${c.level}">${c.level}</span></td>
        <td>${c.enrollment_count}</td>
        <td>⭐ ${c.rating}</td>
        <td><span class="status-badge ${c.is_published ? 'active' : 'inactive'}">${c.is_published ? 'Publié' : 'Brouillon'}</span></td>
      </tr>
    `).join('');
  }

  // ==========================================
  // Events
  // ==========================================
  async function loadEvents() {
    const { data } = await DB.getEvents({ upcoming: false });
    const tbody = document.getElementById('eventsTableBody');

    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:40px; color:var(--text-muted);">Aucun événement</td></tr>';
      return;
    }

    tbody.innerHTML = data.map(e => `
      <tr>
        <td><strong>${e.title}</strong></td>
        <td><span class="role-badge">${e.event_type}</span></td>
        <td>${e.location}</td>
        <td>${new Date(e.date_start).toLocaleDateString('fr-FR')}</td>
        <td>${e.current_participants}/${e.max_participants || '∞'}</td>
      </tr>
    `).join('');
  }

  // ==========================================
  // Initial Load
  // ==========================================
  await loadStats();
});

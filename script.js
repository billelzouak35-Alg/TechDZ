/* ============================================
   TechDZ — Script
   ============================================ */

// ==========================================
// Language — apply immediately on script load
// ==========================================
(function initLang() {
  const urlParams = new URLSearchParams(window.location.search);
  const lang = urlParams.get('lang') || localStorage.getItem('techdz-lang');
  if (!lang) return;
  localStorage.setItem('techdz-lang', lang);
  const tr = window.translations;
  if (!tr) return;
  const langData = tr[lang];
  if (!langData) return;
  const html = document.documentElement;
  html.setAttribute('lang', lang);
  if (lang === 'ar') html.setAttribute('dir', 'rtl');
  else html.removeAttribute('dir');
  const i18nEls = document.querySelectorAll('[data-i18n]');
  i18nEls.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (langData[key]) el.textContent = langData[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (langData[key]) el.placeholder = langData[key];
  });
})();

function t(key, fallback) {
  const tr = window.translations;
  if (!tr) return fallback !== undefined ? fallback : key;
  const lang = localStorage.getItem('techdz-lang') || 'fr';
  const data = tr[lang] || tr.fr || {};
  const v = data[key];
  return (v !== undefined && v !== null && v !== '') ? v : (fallback !== undefined ? fallback : key);
}

function getTranslationUrl(url, lang) {
  const sep = url.includes('?') ? '&' : '?';
  return url + sep + 'lang=' + lang;
}

function updateLinksWithLang() {
  const lang = localStorage.getItem('techdz-lang');
  if (!lang) return;
  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
    let url;
    try { url = new URL(a.href); } catch (e) { return; }
    if (url.protocol !== 'http:' && url.protocol !== 'https:' && url.protocol !== 'file:') return;
    if (url.hostname !== window.location.hostname) return;
    url.searchParams.set('lang', lang);
    a.href = url.toString();
  });
}
updateLinksWithLang();

function setLanguage(lang) {
  const html = document.documentElement;
  const tr = window.translations;
  if (!tr) return;
  const langData = tr[lang];
  if (!langData) return;
  html.setAttribute('lang', lang);
  if (lang === 'ar') html.setAttribute('dir', 'rtl');
  else html.removeAttribute('dir');
  localStorage.setItem('techdz-lang', lang);
  const i18nEls = document.querySelectorAll('[data-i18n]');
  i18nEls.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (langData[key]) el.textContent = langData[key];
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (langData[key]) el.placeholder = langData[key];
  });
  // Sync URL with lang param
  const url = new URL(window.location);
  url.searchParams.set('lang', lang);
  history.replaceState(null, '', url.toString());
  // Update all internal links
  updateLinksWithLang();
}

document.addEventListener('DOMContentLoaded', () => {
  const html = document.documentElement;

  // ==========================================
  // Preloader
  // ==========================================
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      setTimeout(() => preloader.classList.add('hidden'), 800);
    });
    setTimeout(() => preloader.classList.add('hidden'), 3000);
  }

  // ==========================================
  // Theme Toggle
  // ==========================================
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    const themeIcon = themeToggle.querySelector('i');
    const savedTheme = localStorage.getItem('techdz-theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('techdz-theme', next);
      updateThemeIcon(next);
    });

    function updateThemeIcon(theme) {
      themeIcon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
  }

  // ==========================================
  // Language Switcher UI
  // ==========================================
  const savedLang = localStorage.getItem('techdz-lang');
  if (savedLang) {
    const url = new URL(window.location);
    url.searchParams.set('lang', savedLang);
    history.replaceState(null, '', url.toString());
  }
  const langSwitcher = document.getElementById('langSwitcher');
  const langBtn = document.getElementById('langBtn');
  if (langSwitcher && langBtn) {
    const langOptions = document.querySelectorAll('.lang-option');
    if (savedLang) {
      langOptions.forEach(opt => opt.classList.toggle('active', opt.getAttribute('data-lang') === savedLang));
      langBtn.querySelector('.lang-flag').textContent = savedLang.toUpperCase();
    }

    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langSwitcher.classList.toggle('open');
    });

    langOptions.forEach(option => {
      option.addEventListener('click', () => {
        const lang = option.getAttribute('data-lang');
        setLanguage(lang);
        langOptions.forEach(opt => opt.classList.toggle('active', opt.getAttribute('data-lang') === lang));
        langBtn.querySelector('.lang-flag').textContent = lang.toUpperCase();
        langSwitcher.classList.remove('open');
      });
    });

    document.addEventListener('click', (e) => {
      if (!langSwitcher.contains(e.target)) langSwitcher.classList.remove('open');
    });
  }

  // ==========================================
  // Navbar Scroll
  // ==========================================
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // ==========================================
  // Mobile Navigation
  // ==========================================
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileNav = document.getElementById('mobileNav');
  const mobileClose = document.getElementById('mobileClose');
  const mobileOverlay = document.getElementById('mobileOverlay');

  function closeMobileNav() {
    if (mobileNav) mobileNav.classList.remove('open');
    if (mobileOverlay) mobileOverlay.classList.remove('visible');
    if (mobileToggle) mobileToggle.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileToggle && mobileNav) {
    function openMobileNav() {
      mobileNav.classList.add('open');
      if (mobileOverlay) mobileOverlay.classList.add('visible');
      mobileToggle.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    mobileToggle.addEventListener('click', () => {
      mobileNav.classList.contains('open') ? closeMobileNav() : openMobileNav();
    });
    if (mobileClose) mobileClose.addEventListener('click', closeMobileNav);
    if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileNav);
    document.querySelectorAll('.mobile-link').forEach(link => link.addEventListener('click', closeMobileNav));
  }

  // ==========================================
  // AUTH STATE MANAGEMENT
  // ==========================================
  const authLoggedOut = document.getElementById('authLoggedOut');
  const authLoggedIn = document.getElementById('authLoggedIn');
  const mobileAuthOut = document.getElementById('mobileAuthOut');
  const mobileAuthIn = document.getElementById('mobileAuthIn');
  const navUserAvatar = document.getElementById('navUserAvatar');
  const dropdownName = document.getElementById('dropdownName');
  const dropdownEmail = document.getElementById('dropdownEmail');
  const adminLink = document.getElementById('adminLink');
  const userMenu = document.getElementById('userMenu');
  const userDropdown = document.getElementById('userDropdown');

  let currentUser = null;
  let currentProfile = null;

  function showLoggedIn(user, profile) {
    currentUser = user;
    currentProfile = profile;
    if (authLoggedOut) authLoggedOut.style.display = 'none';
    if (authLoggedIn) authLoggedIn.style.display = 'flex';
    if (mobileAuthOut) mobileAuthOut.style.display = 'none';
    if (mobileAuthIn) mobileAuthIn.style.display = 'block';
    if (navUserAvatar) navUserAvatar.textContent = (profile?.full_name || user.email || 'U')[0].toUpperCase();
    if (dropdownName) dropdownName.textContent = profile?.full_name || 'Utilisateur';
    if (dropdownEmail) dropdownEmail.textContent = user.email;
    if (adminLink && profile?.role === 'admin') adminLink.style.display = 'block';
  }

  function showLoggedOut() {
    currentUser = null;
    currentProfile = null;
    if (authLoggedOut) authLoggedOut.style.display = 'flex';
    if (authLoggedIn) authLoggedIn.style.display = 'none';
    if (mobileAuthOut) mobileAuthOut.style.display = 'block';
    if (mobileAuthIn) mobileAuthIn.style.display = 'none';
  }

  // User menu toggle
  if (userMenu) {
    document.getElementById('userAvatarBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!userMenu.contains(e.target)) userDropdown.classList.remove('open');
    });
  }

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await Auth.signOut();
  });
  document.getElementById('mobileLogoutBtn')?.addEventListener('click', async () => {
    await Auth.signOut();
  });

  // Initialize Supabase and listen for auth
  function initAuth() {
    if (typeof Auth === 'undefined') {
      console.error('Auth module not loaded');
      showLoggedOut();
      return;
    }
    if (!Auth.init()) {
      console.error('Auth.init() failed');
      showLoggedOut();
      return;
    }

    Auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      if (session?.user) {
        const { data: profile, error } = await Auth.getProfile(session.user.id);
        if (error) console.warn('Profile error:', error);
        showLoggedIn(session.user, profile);
      } else {
        showLoggedOut();
      }
    });

    Auth.getUser().then(async ({ user, error }) => {
      console.log('Initial user check:', user ? user.email : 'none', error);
      if (user) {
        if (!Auth.isEmailConfirmed(user)) {
          // Email non confirmé → déconnexion et retour à la page de connexion
          await Auth.signOut('login.html');
          return;
        }
        const { data: profile } = await Auth.getProfile(user.id);
        showLoggedIn(user, profile);
      } else {
        showLoggedOut();
      }
    }).catch(err => {
      console.error('getUser error:', err);
      showLoggedOut();
    });
  }

  initAuth();

  // ==========================================
  // CTA Registration Form → Supabase
  // ==========================================
  const ctaForm = document.getElementById('ctaRegisterForm');
  if (ctaForm) {
    ctaForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('ctaName').value.trim();
      const email = document.getElementById('ctaEmail').value.trim();
      if (!name || !email) return;

      const btn = ctaForm.querySelector('button[type="submit"]');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      btn.disabled = true;

      // Redirect to register with pre-filled data
      window.location.href = `register.html?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`;
    });
  }

  // ==========================================
  // Scroll Animations
  // ==========================================
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.getAttribute('data-delay') || 0;
        setTimeout(() => entry.target.classList.add('visible'), parseInt(delay));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

  // ==========================================
  // Smooth Scroll
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ==========================================
  // Animated Counters
  // ==========================================
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          document.querySelectorAll('.stat-number').forEach(el => {
            const text = el.textContent.replace(/,/g, '');
            const target = parseInt(text);
            if (isNaN(target)) return;
            const duration = 2000;
            const startTime = performance.now();
            function update(currentTime) {
              const progress = Math.min((currentTime - startTime) / duration, 1);
              el.textContent = Math.floor(target * (1 - Math.pow(1 - progress, 3))).toLocaleString();
              if (progress < 1) requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
          });
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statsObserver.observe(heroStats);
  }

  // ==========================================
  // Forum Vote (placeholder for DB)
  // ==========================================
  document.querySelectorAll('.vote-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const countEl = btn.parentElement.querySelector('.vote-count');
      const current = parseInt(countEl.textContent);
      countEl.textContent = btn.querySelector('.fa-caret-up') ? current + 1 : current - 1;
    });
  });

  // ==========================================
  // Keyboard
  // ==========================================
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileNav();
      if (langSwitcher) langSwitcher.classList.remove('open');
      const userDropdown = document.getElementById('userDropdown');
      if (userDropdown) userDropdown.classList.remove('open');
    }
  });
});

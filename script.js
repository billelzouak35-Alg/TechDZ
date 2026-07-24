/* ============================================
   TechDZ — Script
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // Preloader
  // ==========================================
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('hidden');
    }, 800);
  });

  // Fallback: hide preloader after 3s even if load event already fired
  setTimeout(() => {
    preloader.classList.add('hidden');
  }, 3000);

  // ==========================================
  // Theme Toggle
  // ==========================================
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  const themeIcon = themeToggle.querySelector('i');

  // Load saved theme
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

  // ==========================================
  // Language Switcher
  // ==========================================
  const langSwitcher = document.getElementById('langSwitcher');
  const langBtn = document.getElementById('langBtn');
  const langDropdown = document.getElementById('langDropdown');
  const langOptions = document.querySelectorAll('.lang-option');

  // Load saved language
  const savedLang = localStorage.getItem('techdz-lang') || 'fr';
  setLanguage(savedLang);

  langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    langSwitcher.classList.toggle('open');
  });

  langOptions.forEach(option => {
    option.addEventListener('click', () => {
      const lang = option.getAttribute('data-lang');
      setLanguage(lang);
      langSwitcher.classList.remove('open');
    });
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!langSwitcher.contains(e.target)) {
      langSwitcher.classList.remove('open');
    }
  });

  function setLanguage(lang) {
    localStorage.setItem('techdz-lang', lang);

    // Update active state
    langOptions.forEach(opt => {
      opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
    });

    // Update button flag
    const flagEl = langBtn.querySelector('.lang-flag');
    flagEl.textContent = lang.toUpperCase();

    // Apply RTL for Arabic
    if (lang === 'ar') {
      html.setAttribute('dir', 'rtl');
      html.setAttribute('lang', 'ar');
    } else {
      html.removeAttribute('dir');
      html.setAttribute('lang', lang);
    }

    // Translate all elements
    const langData = translations[lang];
    if (!langData) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (langData[key]) {
        el.textContent = langData[key];
      }
    });

    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (langData[key]) {
        el.placeholder = langData[key];
      }
    });
  }

  // ==========================================
  // Navbar Scroll Effect
  // ==========================================
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    navbar.classList.toggle('scrolled', scrollY > 50);
    lastScroll = scrollY;
  });

  // ==========================================
  // Mobile Navigation
  // ==========================================
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileNav = document.getElementById('mobileNav');
  const mobileClose = document.getElementById('mobileClose');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function openMobileNav() {
    mobileNav.classList.add('open');
    mobileOverlay.classList.add('visible');
    mobileToggle.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileNav() {
    mobileNav.classList.remove('open');
    mobileOverlay.classList.remove('visible');
    mobileToggle.classList.remove('active');
    document.body.style.overflow = '';
  }

  mobileToggle.addEventListener('click', () => {
    if (mobileNav.classList.contains('open')) {
      closeMobileNav();
    } else {
      openMobileNav();
    }
  });

  mobileClose.addEventListener('click', closeMobileNav);
  mobileOverlay.addEventListener('click', closeMobileNav);

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  // ==========================================
  // Scroll Animations
  // ==========================================
  const animateElements = document.querySelectorAll('[data-animate]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.getAttribute('data-delay') || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, parseInt(delay));
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  animateElements.forEach(el => observer.observe(el));

  // ==========================================
  // Smooth Scroll for Anchor Links
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
  const statNumbers = document.querySelectorAll('.stat-number');

  function animateCounter(el) {
    const text = el.textContent.replace(/,/g, '');
    const target = parseInt(text);
    if (isNaN(target)) return;

    const duration = 2000;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(target * eased);
      el.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // Observe hero stats
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          statNumbers.forEach(el => animateCounter(el));
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statsObserver.observe(heroStats);
  }

  // ==========================================
  // Form Handling
  // ==========================================
  const registerForm = document.querySelector('.register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = registerForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>...</span>';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> <span>✓</span>';
        btn.style.background = 'var(--secondary)';

        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.disabled = false;
          btn.style.background = '';
          registerForm.reset();
        }, 2000);
      }, 1500);
    });
  }

  // ==========================================
  // Forum Vote Interaction
  // ==========================================
  document.querySelectorAll('.vote-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const countEl = btn.parentElement.querySelector('.vote-count');
      const current = parseInt(countEl.textContent);

      if (btn.querySelector('.fa-caret-up')) {
        countEl.textContent = current + 1;
        btn.style.color = 'var(--primary)';
      } else {
        countEl.textContent = current - 1;
        btn.style.color = 'var(--red)';
      }
    });
  });

  // ==========================================
  // Keyboard Navigation
  // ==========================================
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMobileNav();
      langSwitcher.classList.remove('open');
    }
  });
});

// =====================================================
// TulipaMouse – main.js
// Tema dark/light + hamburger menu
// =====================================================

(function () {
  const STORAGE_KEY = 'tulipa-theme';
  const root = document.documentElement;

  // ── Tema ────────────────────────────────────────────
  function getSavedTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function toggleTheme() {
    const current = root.getAttribute('data-theme') || 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  // Aplica antes do render (anti-flash já feito inline nos HTMLs)
  applyTheme(getSavedTheme());

  // ── Hamburger ────────────────────────────────────────
  function initHamburger() {
    const btn    = document.getElementById('navHamburger');
    const mobile = document.getElementById('navMobile');
    if (!btn || !mobile) return;

    btn.addEventListener('click', () => {
      const isOpen = mobile.classList.contains('open');
      mobile.classList.toggle('open', !isOpen);
      btn.classList.toggle('open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    // Fecha ao clicar em link
    mobile.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobile.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Fecha ao clicar fora
    document.addEventListener('click', (e) => {
      const nav = document.getElementById('mainNav');
      if (nav && !nav.contains(e.target) && !mobile.contains(e.target)) {
        mobile.classList.remove('open');
        btn.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // ── Nav shrink ao rolar ──────────────────────────────
  function initNavScroll() {
    const nav = document.getElementById('mainNav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  // ── Active link por hash ─────────────────────────────
  function initActiveLinks() {
    const links = document.querySelectorAll('nav ul li a.nav-link');
    const path  = window.location.pathname.split('/').pop();

    links.forEach(a => {
      const href = a.getAttribute('href') || '';
      if (href.startsWith('#')) {
        // links de âncora: ativa ao rolar
      } else if (href === path || (path === '' && href === 'index.html')) {
        a.classList.add('active');
      } else if (href === 'tutorial.html' && path === 'tutorial.html') {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  }

  // ── Init ────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    // Conecta botão de tema
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', toggleTheme);
    });

    initHamburger();
    initNavScroll();
    initActiveLinks();
  });
})();

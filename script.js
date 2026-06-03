(function () {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
  const root = document.documentElement;
  const progress = $('#scrollProgress');
  const header = $('.site-header');
  const navMenu = $('#navMenu');
  const mobileToggle = $('#mobileToggle');
  const themeToggle = $('#themeToggle');
  const themeIcon = $('.theme-icon');

  const savedTheme = localStorage.getItem('adithya-theme');
  if (savedTheme) root.setAttribute('data-theme', savedTheme);
  updateThemeIcon();

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progress) progress.style.width = `${value}%`;
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
  }
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });

  mobileToggle?.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    mobileToggle.classList.toggle('active', isOpen);
    mobileToggle.setAttribute('aria-expanded', String(isOpen));
  });

  $$('.nav-menu a').forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      mobileToggle?.classList.remove('active');
      mobileToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  themeToggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('adithya-theme', next);
    updateThemeIcon();
  });

  function updateThemeIcon() {
    if (!themeIcon) return;
    themeIcon.textContent = root.getAttribute('data-theme') === 'dark' ? '☾' : '☀';
  }

  const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }) : null;

  $$('.reveal').forEach((element) => {
    if (revealObserver) revealObserver.observe(element);
    else element.classList.add('visible');
  });

  const counterObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: 0.35 }) : null;

  $$('.counter').forEach((counter) => {
    if (counterObserver) counterObserver.observe(counter);
    else animateCounter(counter);
  });

  function animateCounter(element) {
    const target = Number(element.dataset.target || 0);
    const isMillion = element.dataset.format === 'million';
    const start = performance.now();
    const duration = 1300;
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const value = target * eased;
      element.textContent = isMillion ? value.toFixed(progress < 1 ? 1 : 0) : Math.round(value).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const photo = $('#profilePhoto');
  const fallback = $('#profileFallback');
  if (photo) {
    const sources = (photo.dataset.photoSrcs || '').split(',').map((item) => item.trim()).filter(Boolean);
    let index = 0;
    const trySource = () => {
      if (!sources[index]) {
        photo.style.display = 'none';
        fallback?.classList.add('show');
        return;
      }
      photo.src = sources[index];
    };
    photo.addEventListener('load', () => {
      photo.classList.add('loaded');
      fallback?.classList.remove('show');
    });
    photo.addEventListener('error', () => {
      index += 1;
      trySource();
    });
    trySource();
  }

  const sectionLinks = $$('.nav-menu a[href^="#"]');
  const sections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  const activeObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = `#${entry.target.id}`;
      sectionLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === id));
    });
  }, { threshold: 0.35 }) : null;

  sections.forEach((section) => activeObserver?.observe(section));
})();

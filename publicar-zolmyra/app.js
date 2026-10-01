'use strict';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const menu = $('.menu-toggle');
const nav = $('#navigation');
function closeMenu() { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Abrir menú'); nav.classList.remove('is-open'); }
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú'); nav.classList.toggle('is-open', open); });
$$('a', nav).forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); menu.focus(); } });
document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });
matchMedia('(min-width: 601px)').addEventListener('change', closeMenu);
$('#year').textContent = new Date().getFullYear();
$$('.brand').forEach(brand => {
  let touchTimer;
  brand.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse') return;
    clearTimeout(touchTimer);
    brand.classList.add('brand-touched');
    touchTimer = setTimeout(() => brand.classList.remove('brand-touched'), 1100);
  });
});
const services = {
  web: { title: 'Desarrollo Web y Móvil', icon: 'web', description: 'Creamos productos digitales que conectan a las personas con tu negocio. Desde la primera idea hasta una plataforma lista para crecer.', features: ['Sitios corporativos y plataformas web a medida', 'Aplicaciones móviles y experiencias responsive', 'Integración de APIs y sistemas de negocio', 'Diseño centrado en el usuario y rendimiento'] },
  automation: { title: 'Automatización', icon: 'gear', description: 'Liberamos a tu equipo de tareas repetitivas y conectamos tus herramientas para que pueda enfocarse en lo que genera valor.', features: ['Análisis y optimización de procesos', 'Flujos de trabajo e integraciones entre sistemas', 'Automatización de reportes y operaciones', 'Trazabilidad y seguimiento de resultados'] },
  ai: { title: 'Inteligencia Artificial', icon: 'brain', description: 'Transformamos tus datos y conocimientos en soluciones de inteligencia artificial útiles, integradas y alineadas con tus objetivos.', features: ['Asistentes y agentes de IA para tu negocio', 'Búsqueda inteligente en documentos', 'Análisis predictivo y apoyo a decisiones', 'Integración, evaluación y mejora continua'] },
  cloud: { title: 'Cloud & Infraestructura', icon: 'cloud', description: 'Diseñamos una base tecnológica preparada para evolucionar contigo, con disponibilidad, seguridad y eficiencia como prioridades.', features: ['Arquitectura y migración a la nube', 'Contenedores con Docker y Kubernetes', 'Integración y despliegue continuos', 'Monitoreo y optimización de recursos'] },
  security: { title: 'Ciberseguridad', icon: 'shield', description: 'Integramos la seguridad en tus procesos, aplicaciones e infraestructura para proteger la continuidad de tu negocio.', features: ['Evaluación de riesgos y vulnerabilidades', 'Seguridad de aplicaciones e infraestructura', 'Gestión de accesos y protección de datos', 'Planes de prevención y respuesta'] },
  consulting: { title: 'Consultoría TI', icon: 'chart', description: 'Te ayudamos a tomar decisiones tecnológicas con una visión clara del negocio, desde la estrategia hasta la ejecución.', features: ['Diagnóstico de madurez tecnológica', 'Hoja de ruta de transformación digital', 'Arquitectura de soluciones y selección tecnológica', 'Acompañamiento técnico y estratégico'] }
};
const serviceDialog = $('#service-dialog');
const contactDialog = $('#contact-dialog');
serviceDialog.setAttribute('aria-labelledby', 'service-dialog-title');
let selectedService = '';
function showDialog(dialog) { closeMenu(); dialog.showModal(); document.body.classList.add('dialog-open'); }
$$('[data-service]').forEach(button => button.addEventListener('click', () => { const service = services[button.dataset.service]; selectedService = service.title; $('#service-dialog-title').textContent = service.title; $('#service-description').textContent = service.description; $('.dialog-icon use').setAttribute('href', '#' + service.icon); $('#service-features').replaceChildren(...service.features.map(feature => { const li = document.createElement('li'); li.textContent = feature; return li; })); showDialog(serviceDialog); }));
$$('dialog').forEach(dialog => { $('.dialog-close', dialog).addEventListener('click', () => dialog.close()); dialog.addEventListener('close', () => { if (!$('dialog[open]')) document.body.classList.remove('dialog-open'); }); dialog.addEventListener('click', event => { const rect = dialog.getBoundingClientRect(); if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close(); }); });
function openContact(service = '') { if (serviceDialog.open) serviceDialog.close(); if (service) $('#project-form select').value = service; $('#form-status').textContent = ''; showDialog(contactDialog); }
$('#open-contact').addEventListener('click', () => openContact());
$$('[data-contact]').forEach(button => button.addEventListener('click', () => openContact()));
$('#service-contact').addEventListener('click', () => openContact(selectedService));
$('#project-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = $('button[type="submit"]', form);
  if (button.disabled || !form.reportValidity()) return;
  const status = $('#form-status');
  if (location.protocol === 'file:') {
    status.textContent = 'El envío estará disponible en la web publicada. Por ahora puedes escribir a zolmyrard@gmail.com.';
    return;
  }
  const label = button.innerHTML;
  button.disabled = true;
  button.textContent = 'Enviando…';
  form.setAttribute('aria-busy', 'true');
  status.textContent = '';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString(),
      signal: controller.signal
    });
    if (!response.ok) throw new Error('Submission failed');
    form.reset();
    status.textContent = 'Gracias. Recibimos tu consulta y te responderemos al correo que indicaste.';
  } catch (error) {
    status.textContent = error.name === 'AbortError'
      ? 'No pudimos confirmar la recepción. Puedes consultar el estado escribiéndonos a '
      : 'No se pudo enviar la consulta. Tus datos siguen aquí para reintentar. También puedes escribir a ';
    const fallback = document.createElement('a');
    fallback.href = 'mailto:zolmyrard@gmail.com';
    fallback.textContent = 'zolmyrard@gmail.com';
    status.append(fallback);
  } finally {
    clearTimeout(timeout);
    button.disabled = false;
    button.innerHTML = label;
    form.removeAttribute('aria-busy');
  }
});
const techClone = $('.tech-group').cloneNode(true); techClone.setAttribute('aria-hidden', 'true'); $('.tech-track').append(techClone);
let paused = reduceMotion.matches;
const motionButton = $('.motion-toggle');
function applyMotion() { document.body.classList.toggle('motion-paused', paused); motionButton.setAttribute('aria-pressed', String(paused)); motionButton.setAttribute('aria-label', paused ? 'Reanudar animaciones' : 'Pausar animaciones'); $('.motion-label').textContent = paused ? 'Movimiento pausado' : 'Paisaje vivo'; $('.pause-symbol').textContent = paused ? '▷' : 'Ⅱ'; }
applyMotion();
motionButton.addEventListener('click', () => { paused = !paused; applyMotion(); });
reduceMotion.addEventListener('change', () => { paused = reduceMotion.matches; applyMotion(); });
const hero = $('.hero');
let framePending = false; let pointerX = 0; let pointerY = 0;
function updateLandscape() { if (framePending || paused || reduceMotion.matches || innerWidth <= 600 || hero.classList.contains('is-offscreen')) return; framePending = true; requestAnimationFrame(() => { hero.style.setProperty('--mx', pointerX + 'px'); hero.style.setProperty('--my', pointerY + 'px'); hero.style.setProperty('--scroll', Math.min(scrollY, 650) + 'px'); framePending = false; }); }
hero.addEventListener('pointermove', event => { if (event.pointerType !== 'mouse') return; const rect = hero.getBoundingClientRect(); pointerX = ((event.clientX - rect.left) / rect.width - .5) * 12; pointerY = ((event.clientY - rect.top) / rect.height - .5) * 8; updateLandscape(); });
hero.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; updateLandscape(); });
window.addEventListener('scroll', updateLandscape, { passive: true });
// Native vector illustrations keep the lower sections sharp without extra images.
$$('.steps article').forEach((article, index) => {
  const art = document.createElement('div'); art.className = 'step-art'; art.setAttribute('aria-hidden', 'true');
  const icons = ['globe', 'web', 'chart'];
  art.innerHTML = '<svg><use href="#' + icons[index] + '"/></svg><strong>0' + (index + 1) + '</strong>';
  article.prepend(art);
});
const header = $('.header');
window.addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 10), { passive: true });
document.addEventListener('visibilitychange', () => document.body.classList.toggle('page-hidden', document.hidden));
if ('IntersectionObserver' in window) {
  const motionObserver = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('is-offscreen', !entry.isIntersecting)));
  motionObserver.observe($('.technologies'));
  if (!reduceMotion.matches) {
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
    }), { threshold: .08 });
    $$('.section-heading, .service-card, .about-copy, .stats, .purpose-card, .values-grid article, .tech-heading, .steps article, .contact-inner').forEach(element => {
      // Already visible content stays visible; only reveal content below the fold.
      if (element.getBoundingClientRect().top >= innerHeight) { element.classList.add('reveal-ready'); revealObserver.observe(element); }
    });
    reduceMotion.addEventListener('change', () => { if (reduceMotion.matches) $$('.reveal-ready').forEach(element => element.classList.add('is-visible')); });
  }
  new IntersectionObserver(entries => entries.forEach(entry => hero.classList.toggle('is-offscreen', !entry.isIntersecting))).observe(hero);
  const counterObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (!entry.isIntersecting) return; counterObserver.unobserve(entry.target); if (reduceMotion.matches || paused) return; const target = Number(entry.target.dataset.count); const start = performance.now(); function tick(now) { const progress = Math.min((now - start) / 1300, 1); entry.target.textContent = '+' + Math.round(target * (1 - Math.pow(1 - progress, 3))); if (progress < 1) requestAnimationFrame(tick); } requestAnimationFrame(tick); }), { threshold: .7 });
  $$('[data-count]').forEach(counter => counterObserver.observe(counter));
  const sections = $$('main > section[id]'); const navLinks = $$('a', nav);
  const navObserver = new IntersectionObserver(entries => { entries.forEach(entry => { if (!entry.isIntersecting) return; navLinks.forEach(link => { const current = link.hash === '#' + entry.target.id; link.classList.toggle('active', current); if (current) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); }); }); }, { rootMargin: '-15% 0px -60% 0px' }); sections.forEach(section => navObserver.observe(section));
}

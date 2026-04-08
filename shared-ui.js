/* ============================================
   shared-ui.js — Barre utilitaire partagée
   Dark mode + Langue (FR/EN)
   ============================================ */

const LANG = {
  fr: {
    nav_projet:'Le projet', nav_benevoles:'Bénévoles', nav_confidentialite:'Confidentialité',
    nav_cta:'Commencer', dark_label:'Sombre', light_label:'Clair', lang_toggle:'EN',
    footer_copy:'© 2025 Écoute Anonyme · Tous droits réservés', footer_available:'Service disponible',
    footer_nav:'Navigation', footer_info:'Informations',
    footer_desc:"Un espace d'écoute bénévole, gratuit et confidentiel.",
    footer_home:'Accueil', footer_start:'Commencer', footer_support:'Soutenir le projet',
    footer_contact:'Contact', footer_emergency:'Urgences : 3114', footer_volunteer:'Devenir bénévole',
    footer_privacy:'Confidentialité',
  },
  en: {
    nav_projet:'The project', nav_benevoles:'Volunteers', nav_confidentialite:'Privacy',
    nav_cta:'Start', dark_label:'Dark', light_label:'Light', lang_toggle:'FR',
    footer_copy:'© 2025 Écoute Anonyme · All rights reserved', footer_available:'Service available',
    footer_nav:'Navigation', footer_info:'Information',
    footer_desc:'A free, confidential volunteer listening service.',
    footer_home:'Home', footer_start:'Start', footer_support:'Support us',
    footer_contact:'Contact', footer_emergency:'Emergency: 3114', footer_volunteer:'Become a volunteer',
    footer_privacy:'Privacy',
  }
};

let currentLang = localStorage.getItem('ea-lang') || 'fr';
let isDark = localStorage.getItem('ea-dark') === '1';

function injectUtilBar() {
  const bar = document.createElement('div');
  bar.className = 'util-bar';
  bar.id = 'util-bar';
  bar.innerHTML = `
    <span class="util-label" id="util-mode-label"></span>
    <div class="dark-toggle" id="dark-toggle" onclick="toggleDark()" title="Mode sombre / clair" style="cursor:pointer;">
      <div class="dark-toggle-knob"></div>
    </div>
    <span class="util-sep"></span>
    <button class="util-btn" id="lang-btn" onclick="toggleLang()"></button>
  `;
  document.body.prepend(bar);
}

function applyDark() {
  document.body.classList.toggle('dark', isDark);
  const t = document.getElementById('dark-toggle');
  const l = document.getElementById('util-mode-label');
  if (t) t.classList.toggle('on', isDark);
  if (l) l.textContent = isDark ? LANG[currentLang].dark_label : LANG[currentLang].light_label;
  localStorage.setItem('ea-dark', isDark ? '1' : '0');
}

function toggleDark() { isDark = !isDark; applyDark(); }

function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n');
    if (LANG[currentLang][k] !== undefined) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = LANG[currentLang][k];
      else el.textContent = LANG[currentLang][k];
    }
  });
  const btn = document.getElementById('lang-btn');
  if (btn) btn.textContent = LANG[currentLang].lang_toggle;
  const lbl = document.getElementById('util-mode-label');
  if (lbl) lbl.textContent = isDark ? LANG[currentLang].dark_label : LANG[currentLang].light_label;
  localStorage.setItem('ea-lang', currentLang);
  document.documentElement.setAttribute('lang', currentLang);
}

function toggleLang() { currentLang = currentLang === 'fr' ? 'en' : 'fr'; applyLang(); }

function initNav() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 30));
}

function toggleMenu() {
  const p = document.getElementById('mobilePanel');
  const o = document.getElementById('mobileOverlay');
  const b = document.getElementById('hamburger');
  if (!p) return;
  const open = p.classList.toggle('open');
  o?.classList.toggle('open', open);
  b?.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
}

document.addEventListener('DOMContentLoaded', () => {
  injectUtilBar();
  applyDark();
  applyLang();
  initNav();
});
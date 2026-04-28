/* ============================================
   shared-ui.js — Barre utilitaire partagée
   Dark mode + Langue (FR/EN)
   ============================================ */

const LANG = {
  fr: {
    /* Nav */
    nav_projet:'Le projet', nav_comment:'Comment ça marche', nav_benevoles:'Bénévoles',
    nav_confidentialite:'Confidentialité', nav_cta:'Commencer',
    /* Util bar */
    dark_label:'Sombre', light_label:'Clair', lang_toggle:'EN',
    /* Footer */
    footer_copy:'© 2025 Écoute Anonyme · Tous droits réservés', footer_available:'Service disponible',
    footer_nav:'Navigation', footer_info:'Informations',
    footer_desc:"Un espace d'écoute bénévole, gratuit et confidentiel.",
    footer_home:'Accueil', footer_start:'Commencer', footer_support:'Soutenir le projet',
    footer_contact:'Contact', footer_emergency:'Urgences : 3114', footer_volunteer:'Devenir bénévole',
    footer_privacy:'Confidentialité',
    /* Index — Hero */
    hero_badge:'Service gratuit · 100 % anonyme',
    hero_h1_1:'Un espace pour', hero_h1_em:"s'exprimer librement",
    hero_sub:"Écoute Anonyme est un lieu sûr où vous pouvez parler sans jugement, sans dévoiler votre identité. Des bénévoles attentifs sont là pour vous écouter.",
    hero_cta:'Commencer à écrire', hero_learn:'En savoir plus',
    hero_note:'Aucune inscription · Aucune donnée personnelle',
    /* Index — Sections labels */
    sec_fondements:'Nos fondements', sec_processus:'Le processus', sec_engagements:'Nos engagements',
    sec_benevoles:'Les bénévoles', sec_temoignages:'Témoignages',
    /* Presentation page */
    page_pres_label:'Présentation',
    page_pres_h1:'Un espace pour', page_pres_h1_em:'ceux qui en ont besoin',
    page_pres_lead:"Écoute Anonyme est né d'une conviction simple : tout le monde mérite d'être entendu, sans conditions ni jugement.",
    /* Bénévoles page */
    page_benv_label:'Notre équipe',
    page_benv_h1:'Des bénévoles', page_benv_h1_em:'engagés pour vous',
    page_benv_lead:'Des personnes formées à l\'écoute active, disponibles pour vous accompagner.',
    /* Confidentialité page */
    page_conf_label:'Charte de confidentialité',
    page_conf_h1:'Votre vie privée', page_conf_h1_em:'protégée avant tout',
    page_conf_lead:'Un engagement fort pour la protection de vos données personnelles.',
    /* Chat page */
    chat_pseudo_h1:'Avant de commencer', chat_pseudo_em:'choisissez un pseudonyme',
    chat_pseudo_desc:'Facultatif — vous pouvez aussi rester totalement anonyme.',
    chat_pseudo_placeholder:'Votre pseudonyme (facultatif)',
    chat_btn_enter:'Continuer', chat_btn_anon:'Rester anonyme',
    chat_notice:'En continuant, vous acceptez notre',
    chat_vol_h2:'Choisissez', chat_vol_h2_em:'un bénévole',
    chat_vol_desc:'Tous nos bénévoles sont formés à l\'écoute active et au respect de la confidentialité.',
    /* Soutenir page */
    page_sout_label:'Soutenir le projet',
    page_sout_h1:'Contribuer à', page_sout_h1_em:'Écoute Anonyme',
  },
  en: {
    /* Nav */
    nav_projet:'The project', nav_comment:'How it works', nav_benevoles:'Volunteers',
    nav_confidentialite:'Privacy', nav_cta:'Start',
    /* Util bar */
    dark_label:'Dark', light_label:'Light', lang_toggle:'FR',
    /* Footer */
    footer_copy:'© 2025 Écoute Anonyme · All rights reserved', footer_available:'Service available',
    footer_nav:'Navigation', footer_info:'Information',
    footer_desc:'A free, confidential volunteer listening service.',
    footer_home:'Home', footer_start:'Start', footer_support:'Support us',
    footer_contact:'Contact', footer_emergency:'Emergency: 3114', footer_volunteer:'Become a volunteer',
    footer_privacy:'Privacy',
    /* Index — Hero */
    hero_badge:'Free service · 100% anonymous',
    hero_h1_1:'A space to', hero_h1_em:'express yourself freely',
    hero_sub:"Écoute Anonyme is a safe place where you can talk without judgment, without revealing your identity. Attentive volunteers are here to listen to you.",
    hero_cta:'Start writing', hero_learn:'Learn more',
    hero_note:'No registration · No personal data',
    /* Index — Sections labels */
    sec_fondements:'Our foundations', sec_processus:'The process', sec_engagements:'Our commitments',
    sec_benevoles:'The volunteers', sec_temoignages:'Testimonials',
    /* Presentation page */
    page_pres_label:'Presentation',
    page_pres_h1:'A space for', page_pres_h1_em:'those who need it',
    page_pres_lead:'Écoute Anonyme was born from a simple conviction: everyone deserves to be heard, without conditions or judgment.',
    /* Bénévoles page */
    page_benv_label:'Our team',
    page_benv_h1:'Volunteers', page_benv_h1_em:'committed to you',
    page_benv_lead:'People trained in active listening, available to support you.',
    /* Confidentialité page */
    page_conf_label:'Privacy policy',
    page_conf_h1:'Your privacy', page_conf_h1_em:'protected above all',
    page_conf_lead:'A strong commitment to protecting your personal data.',
    /* Chat page */
    chat_pseudo_h1:'Before you start', chat_pseudo_em:'choose a username',
    chat_pseudo_desc:'Optional — you can also remain completely anonymous.',
    chat_pseudo_placeholder:'Your username (optional)',
    chat_btn_enter:'Continue', chat_btn_anon:'Stay anonymous',
    chat_notice:'By continuing, you accept our',
    chat_vol_h2:'Choose', chat_vol_h2_em:'a volunteer',
    chat_vol_desc:'All our volunteers are trained in active listening and respect for confidentiality.',
    /* Soutenir page */
    page_sout_label:'Support the project',
    page_sout_h1:'Contribute to', page_sout_h1_em:'Écoute Anonyme',
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
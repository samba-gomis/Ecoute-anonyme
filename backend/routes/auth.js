const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const crypto  = require('crypto');
const db      = require('../database');
const ah      = require('../asyncHandler');

const SESSION_COOKIE = 'ea_admin_session';
const SESSION_MAX_AGE = 12 * 60 * 60 * 1000; // 12h
const adminSessions = new Map(); // token -> expiresAt

function requireAdmin(req, res, next) {
  const token = req.cookies?.[SESSION_COOKIE];
  const expiresAt = token && adminSessions.get(token);
  if (!expiresAt || expiresAt < Date.now()) {
    if (token) adminSessions.delete(token);
    return res.status(401).json({ error: 'Authentification admin requise.' });
  }
  next();
}

// Purge périodique des sessions expirées pour éviter une fuite mémoire
// (le Set/Map n'était sinon jamais nettoyé que sur logout explicite).
setInterval(() => {
  const now = Date.now();
  for (const [token, expiresAt] of adminSessions) {
    if (expiresAt < now) adminSessions.delete(token);
  }
}, 60 * 60 * 1000).unref();

// Anti brute-force sur les routes de connexion : n'importe quel appelant
// (pas de whitelist par utilisateur) est limité à quelques tentatives par
// fenêtre de temps et par IP. `trust proxy` (server.js) fait que req.ip
// reflète bien l'IP du client derrière le proxy Render.
const loginAttempts = new Map(); // ip -> { count, resetAt }
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 10;

function rateLimitLogin(req, res, next) {
  const now = Date.now();
  let entry = loginAttempts.get(req.ip);
  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + LOGIN_WINDOW_MS };
    loginAttempts.set(req.ip, entry);
  }
  entry.count++;
  if (entry.count > LOGIN_MAX_ATTEMPTS)
    return res.status(429).json({ error: 'Trop de tentatives de connexion. Réessayez plus tard.' });
  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of loginAttempts) {
    if (entry.resetAt < now) loginAttempts.delete(ip);
  }
}, 60 * 60 * 1000).unref();

// Session bénévole : même principe que adminSessions ci-dessus, mais portée
// par un token Bearer plutôt qu'un cookie (le panneau bénévole est utilisé
// depuis la même page que le chat public, pas besoin d'un cookie dédié).
// Nécessaire pour que /api/chat-requests sache quel bénévole authentifié
// fait l'appel (liste d'attente, acceptation, envoi de message, statut...).
const volSessions = new Map(); // token -> { volunteerId, expiresAt }

function requireVolunteer(req, res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const entry = token && volSessions.get(token);
  if (!entry || entry.expiresAt < Date.now()) {
    if (token) volSessions.delete(token);
    return res.status(401).json({ error: 'Authentification bénévole requise.' });
  }
  req.volunteerId = entry.volunteerId;
  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [token, entry] of volSessions) {
    if (entry.expiresAt < now) volSessions.delete(token);
  }
}, 60 * 60 * 1000).unref();

// POST /api/auth/volunteer  — { login, password }
router.post('/volunteer', rateLimitLogin, ah(async (req, res) => {
  const { login, password } = req.body;
  if (!login?.trim() || !password)
    return res.status(400).json({ error: 'Identifiants requis.' });

  const vol = await db.get('SELECT * FROM volunteers WHERE login = ?', [login.trim()]);
  if (!vol?.password_hash || !bcrypt.compareSync(password, vol.password_hash))
    return res.status(401).json({ error: 'Identifiants incorrects.' });

  const token = crypto.randomBytes(32).toString('hex');
  volSessions.set(token, { volunteerId: vol.id, expiresAt: Date.now() + SESSION_MAX_AGE });

  const { password_hash, setup_token, setup_token_expires, ...safe } = vol;
  res.json({ ...safe, tags: JSON.parse(safe.tags), token });
}));

// POST /api/auth/volunteer/setup — { token, password }
// Consomme le lien à usage unique envoyé par email lors de l'acceptation
// d'une candidature (backend/routes/applications.js) pour que le/la
// bénévole choisisse lui/elle-même son mot de passe, au lieu de le recevoir
// en clair par email.
router.post('/volunteer/setup', rateLimitLogin, ah(async (req, res) => {
  const { token, password } = req.body;
  if (!token) return res.status(400).json({ error: 'Lien invalide.' });
  if (!password || password.length < 6)
    return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères.' });

  const vol = await db.get('SELECT * FROM volunteers WHERE setup_token = ?', [token]);
  if (!vol || !vol.setup_token_expires || new Date(vol.setup_token_expires).getTime() < Date.now())
    return res.status(400).json({ error: 'Ce lien est invalide ou a expiré. Contactez l\'équipe pour en recevoir un nouveau.' });

  await db.run(
    'UPDATE volunteers SET password_hash = ?, setup_token = NULL, setup_token_expires = NULL WHERE id = ?',
    [bcrypt.hashSync(password, 10), vol.id]
  );

  res.json({ ok: true, login: vol.login });
}));

// PATCH /api/auth/volunteer — { id, current_password, new_login?, new_password? }
router.patch('/volunteer', ah(async (req, res) => {
  const { id, current_password, new_login, new_password } = req.body;
  if (!id || !current_password)
    return res.status(400).json({ error: 'Mot de passe actuel requis.' });

  const vol = await db.get('SELECT * FROM volunteers WHERE id = ?', [id]);
  if (!vol?.password_hash || !bcrypt.compareSync(current_password, vol.password_hash))
    return res.status(401).json({ error: 'Mot de passe actuel incorrect.' });

  if (new_password && new_password.length < 6)
    return res.status(400).json({ error: 'Le nouveau mot de passe doit faire au moins 6 caractères.' });
  if (!new_login?.trim() && !new_password)
    return res.status(400).json({ error: 'Aucune modification à enregistrer.' });

  try {
    if (new_login?.trim())
      await db.run('UPDATE volunteers SET login = ? WHERE id = ?', [new_login.trim(), id]);
    if (new_password)
      await db.run('UPDATE volunteers SET password_hash = ? WHERE id = ?', [bcrypt.hashSync(new_password, 10), id]);
  } catch (e) {
    if (e.message.includes('duplicate key'))
      return res.status(409).json({ error: 'Cet identifiant est déjà utilisé.' });
    throw e;
  }

  res.json({ ok: true });
}));

// POST /api/auth/admin  — { login, password }
router.post('/admin', rateLimitLogin, ah(async (req, res) => {
  const { login, password } = req.body;
  if (!login || !password)
    return res.status(400).json({ error: 'Identifiants requis.' });

  const storedLogin = await db.get("SELECT value FROM settings WHERE key = 'admin_login'");
  const storedHash  = await db.get("SELECT value FROM settings WHERE key = 'admin_password_hash'");

  if (!storedLogin || !storedHash)
    return res.status(500).json({ error: 'Configuration admin manquante.' });

  if (login.trim() !== storedLogin.value || !bcrypt.compareSync(password, storedHash.value))
    return res.status(401).json({ error: 'Identifiants incorrects.' });

  const token = crypto.randomBytes(32).toString('hex');
  adminSessions.set(token, Date.now() + SESSION_MAX_AGE);
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: req.secure,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
  res.json({ ok: true });
}));

// POST /api/auth/admin/logout
router.post('/admin/logout', (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) adminSessions.delete(token);
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  res.json({ ok: true });
});

// PATCH /api/auth/admin  — { current_password, new_login?, new_password? }
router.patch('/admin', requireAdmin, ah(async (req, res) => {
  const { current_password, new_login, new_password } = req.body;
  if (!current_password)
    return res.status(400).json({ error: 'Mot de passe actuel requis.' });

  const storedHash = await db.get("SELECT value FROM settings WHERE key = 'admin_password_hash'");
  if (!storedHash || !bcrypt.compareSync(current_password, storedHash.value))
    return res.status(401).json({ error: 'Mot de passe actuel incorrect.' });

  // Valider tout avant d'écrire quoi que ce soit
  if (new_password && new_password.length < 6)
    return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères.' });

  if (new_login?.trim())
    await db.run("UPDATE settings SET value = ? WHERE key = 'admin_login'", [new_login.trim()]);

  if (new_password)
    await db.run(
      "UPDATE settings SET value = ? WHERE key = 'admin_password_hash'",
      [bcrypt.hashSync(new_password, 10)]
    );

  res.json({ ok: true });
}));

// Utilisé par chat-requests.js pour accepter soit un cookie admin, soit un
// Bearer bénévole, sans dupliquer la logique de volSessions ici.
function resolveVolunteerToken(token) {
  const entry = token && volSessions.get(token);
  if (!entry || entry.expiresAt < Date.now()) return null;
  return entry.volunteerId;
}

router.requireAdmin = requireAdmin;
router.requireVolunteer = requireVolunteer;
router.resolveVolunteerToken = resolveVolunteerToken;
module.exports = router;

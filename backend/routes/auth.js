const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const crypto  = require('crypto');
const db      = require('../database');
const ah      = require('../asyncHandler');

const SESSION_COOKIE = 'ea_admin_session';
const SESSION_MAX_AGE = 12 * 60 * 60 * 1000; // 12h
const adminSessions = new Set();

function requireAdmin(req, res, next) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token || !adminSessions.has(token))
    return res.status(401).json({ error: 'Authentification admin requise.' });
  next();
}

// POST /api/auth/volunteer  — { login, password }
router.post('/volunteer', ah(async (req, res) => {
  const { login, password } = req.body;
  if (!login?.trim() || !password)
    return res.status(400).json({ error: 'Identifiants requis.' });

  const vol = await db.get('SELECT * FROM volunteers WHERE login = ?', [login.trim()]);
  if (!vol?.password_hash || !bcrypt.compareSync(password, vol.password_hash))
    return res.status(401).json({ error: 'Identifiants incorrects.' });

  const { password_hash, ...safe } = vol;
  res.json({ ...safe, tags: JSON.parse(safe.tags) });
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
router.post('/admin', ah(async (req, res) => {
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
  adminSessions.add(token);
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

router.requireAdmin = requireAdmin;
module.exports = router;

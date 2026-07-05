const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const db      = require('../database');

// POST /api/auth/volunteer  — { login, password }
router.post('/volunteer', (req, res) => {
  const { login, password } = req.body;
  if (!login?.trim() || !password)
    return res.status(400).json({ error: 'Identifiants requis.' });

  const vol = db.prepare('SELECT * FROM volunteers WHERE login = ?').get(login.trim());
  if (!vol?.password_hash || !bcrypt.compareSync(password, vol.password_hash))
    return res.status(401).json({ error: 'Identifiants incorrects.' });

  const { password_hash, ...safe } = vol;
  res.json({ ...safe, tags: JSON.parse(safe.tags) });
});

// POST /api/auth/admin  — { login, password }
router.post('/admin', (req, res) => {
  const { login, password } = req.body;
  if (!login || !password)
    return res.status(400).json({ error: 'Identifiants requis.' });

  const storedLogin = db.prepare("SELECT value FROM settings WHERE key = 'admin_login'").get();
  const storedHash  = db.prepare("SELECT value FROM settings WHERE key = 'admin_password_hash'").get();

  if (!storedLogin || !storedHash)
    return res.status(500).json({ error: 'Configuration admin manquante.' });

  if (login.trim() !== storedLogin.value || !bcrypt.compareSync(password, storedHash.value))
    return res.status(401).json({ error: 'Identifiants incorrects.' });

  res.json({ ok: true });
});

// PATCH /api/auth/admin  — { current_password, new_login?, new_password? }
router.patch('/admin', (req, res) => {
  const { current_password, new_login, new_password } = req.body;
  if (!current_password)
    return res.status(400).json({ error: 'Mot de passe actuel requis.' });

  const storedHash = db.prepare("SELECT value FROM settings WHERE key = 'admin_password_hash'").get();
  if (!storedHash || !bcrypt.compareSync(current_password, storedHash.value))
    return res.status(401).json({ error: 'Mot de passe actuel incorrect.' });

  if (new_login?.trim()) {
    db.prepare("UPDATE settings SET value = ? WHERE key = 'admin_login'").run(new_login.trim());
  }
  if (new_password) {
    if (new_password.length < 6)
      return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères.' });
    db.prepare("UPDATE settings SET value = ? WHERE key = 'admin_password_hash'").run(
      bcrypt.hashSync(new_password, 10)
    );
  }

  res.json({ ok: true });
});

module.exports = router;

const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const db      = require('../database');

const VALID_STATUSES = ['online', 'away', 'offline'];

function parseRow(row) {
  if (!row) return null;
  // Never expose password_hash to the client
  const { password_hash, ...safe } = row;
  return { ...safe, tags: JSON.parse(safe.tags) };
}

// GET /api/volunteers
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM volunteers ORDER BY created_at ASC').all();
  res.json(rows.map(parseRow));
});

// GET /api/volunteers/:id
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM volunteers WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Bénévole introuvable.' });
  res.json(parseRow(row));
});

// POST /api/volunteers
router.post('/', (req, res) => {
  const { name, email, tags, status, login, password } = req.body;
  if (!name?.trim())  return res.status(400).json({ error: 'Le champ "name" est requis.' });
  if (!login?.trim()) return res.status(400).json({ error: 'Un identifiant de connexion est requis.' });
  if (!password)      return res.status(400).json({ error: 'Un mot de passe est requis.' });
  if (password.length < 6) return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères.' });

  const tagsJson     = JSON.stringify(Array.isArray(tags) ? tags : []);
  const safeStatus   = VALID_STATUSES.includes(status) ? status : 'online';
  const safeEmail    = email?.trim() || null;
  const safeLogin    = login.trim();
  const passwordHash = bcrypt.hashSync(password, 10);

  try {
    const info = db.prepare(
      'INSERT INTO volunteers (name, email, tags, status, login, password_hash) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(name.trim(), safeEmail, tagsJson, safeStatus, safeLogin, passwordHash);

    res.status(201).json(parseRow(
      db.prepare('SELECT * FROM volunteers WHERE id = ?').get(info.lastInsertRowid)
    ));
  } catch (e) {
    if (e.message.includes('UNIQUE')) {
      if (e.message.includes('email')) return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
      if (e.message.includes('login')) return res.status(409).json({ error: 'Cet identifiant est déjà utilisé.' });
    }
    throw e;
  }
});

// PATCH /api/volunteers/:id
router.patch('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM volunteers WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Bénévole introuvable.' });

  const name   = req.body.name?.trim()  || existing.name;
  const email  = 'email'  in req.body   ? (req.body.email?.trim() || null) : existing.email;
  const tags   = 'tags'   in req.body   ? JSON.stringify(Array.isArray(req.body.tags) ? req.body.tags : []) : existing.tags;
  const status = VALID_STATUSES.includes(req.body.status) ? req.body.status : existing.status;

  if (!name) return res.status(400).json({ error: 'Le champ "name" est requis.' });

  try {
    db.prepare('UPDATE volunteers SET name=?, email=?, tags=?, status=? WHERE id=?')
      .run(name, email, tags, status, req.params.id);

    res.json(parseRow(
      db.prepare('SELECT * FROM volunteers WHERE id = ?').get(req.params.id)
    ));
  } catch (e) {
    if (e.message.includes('UNIQUE'))
      return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    throw e;
  }
});

// DELETE /api/volunteers/:id
router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM volunteers WHERE id = ?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Bénévole introuvable.' });
  res.status(204).end();
});

module.exports = router;

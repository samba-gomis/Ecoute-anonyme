const express = require('express');
const router  = express.Router();
const db      = require('../database');

const VALID_STATUSES = ['online', 'away', 'offline'];

function parseRow(row) {
  if (!row) return null;
  return { ...row, tags: JSON.parse(row.tags) };
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
  const { name, email, tags, status } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Le champ "name" est requis.' });

  const tagsJson    = JSON.stringify(Array.isArray(tags) ? tags : []);
  const safeStatus  = VALID_STATUSES.includes(status) ? status : 'online';
  const safeEmail   = email?.trim() || null;

  try {
    const info = db.prepare(
      'INSERT INTO volunteers (name, email, tags, status) VALUES (?, ?, ?, ?)'
    ).run(name.trim(), safeEmail, tagsJson, safeStatus);

    res.status(201).json(parseRow(
      db.prepare('SELECT * FROM volunteers WHERE id = ?').get(info.lastInsertRowid)
    ));
  } catch (e) {
    if (e.message.includes('UNIQUE'))
      return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
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

const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const db      = require('../database');

function parseRow(row) {
  if (!row) return null;
  return { ...row, messages: JSON.parse(row.messages) };
}

function generateShareId() {
  // 8 uppercase hex chars, e.g. "A3F9B2D1" — ~4 billion combinations
  let id;
  const check = db.prepare('SELECT 1 FROM conversations WHERE share_id = ?');
  do {
    id = crypto.randomBytes(4).toString('hex').toUpperCase();
  } while (check.get(id));
  return id;
}

// GET /api/conversations  — list without full messages body
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT share_id, user_pseudo, vol_display, domain,
           started_at, ended_at, created_at,
           json_array_length(messages) AS message_count
    FROM conversations ORDER BY created_at DESC
  `).all();
  res.json(rows);
});

// GET /api/conversations/:id
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM conversations WHERE share_id = ?')
    .get(req.params.id.toUpperCase());
  if (!row) return res.status(404).json({ error: 'Conversation introuvable. Vérifiez votre identifiant.' });
  res.json(parseRow(row));
});

// POST /api/conversations  — save a conversation, returns share_id
router.post('/', (req, res) => {
  const { user_pseudo, vol_display, domain, messages, started_at, ended_at } = req.body;

  if (!user_pseudo?.trim())
    return res.status(400).json({ error: 'Le champ "user_pseudo" est requis.' });
  if (!Array.isArray(messages))
    return res.status(400).json({ error: 'Le champ "messages" doit être un tableau.' });
  if (!messages.length)
    return res.status(400).json({ error: 'Impossible de sauvegarder une conversation vide.' });

  const share_id = generateShareId();

  db.prepare(`
    INSERT INTO conversations (share_id, user_pseudo, vol_display, domain, messages, started_at, ended_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    share_id,
    user_pseudo.trim(),
    vol_display?.trim() || 'Bénévole',
    domain?.trim()      || null,
    JSON.stringify(messages),
    started_at || null,
    ended_at   || null,
  );

  res.status(201).json(parseRow(
    db.prepare('SELECT * FROM conversations WHERE share_id = ?').get(share_id)
  ));
});

// DELETE /api/conversations/:id
router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM conversations WHERE share_id = ?')
    .run(req.params.id.toUpperCase());
  if (!info.changes) return res.status(404).json({ error: 'Conversation introuvable.' });
  res.status(204).end();
});

module.exports = router;

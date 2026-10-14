const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const db      = require('../database');
const ah      = require('../asyncHandler');
const { requireAdmin } = require('./auth');

function parseRow(row) {
  if (!row) return null;
  return { ...row, messages: JSON.parse(row.messages) };
}

async function generateShareId() {
  // 8 uppercase hex chars, e.g. "A3F9B2D1" — ~4 billion combinations
  let id;
  do {
    id = crypto.randomBytes(4).toString('hex').toUpperCase();
  } while (await db.get('SELECT 1 FROM conversations WHERE share_id = ?', [id]));
  return id;
}

// GET /api/conversations  — list without full messages body
router.get('/', requireAdmin, ah(async (req, res) => {
  const rows = await db.all(`
    SELECT share_id, user_pseudo, vol_display, domain,
           started_at, ended_at, created_at,
           jsonb_array_length(messages::jsonb) AS message_count
    FROM conversations ORDER BY created_at DESC
  `);
  res.json(rows);
}));

// GET /api/conversations/:id — transcript complet, réservé à l'admin : un
// code à 8 caractères ne suffit pas à protéger un échange confidentiel, et
// aucune page publique ne l'utilise. (Les transcripts sont écrits par
// POST /api/chat-requests/:id/end ; il n'y a plus de route publique de
// création, qui permettait à n'importe qui d'en fabriquer.)
router.get('/:id', requireAdmin, ah(async (req, res) => {
  const row = await db.get(
    'SELECT * FROM conversations WHERE share_id = ?',
    [req.params.id.toUpperCase()]
  );
  if (!row) return res.status(404).json({ error: 'Conversation introuvable. Vérifiez votre identifiant.' });
  res.json(parseRow(row));
}));

// DELETE /api/conversations/:id
router.delete('/:id', requireAdmin, ah(async (req, res) => {
  const info = await db.run(
    'DELETE FROM conversations WHERE share_id = ?',
    [req.params.id.toUpperCase()]
  );
  if (!info.changes) return res.status(404).json({ error: 'Conversation introuvable.' });
  res.status(204).end();
}));

router.generateShareId = generateShareId;
module.exports = router;

const express = require('express');
const router  = express.Router();
const db      = require('../database');
const ah      = require('../asyncHandler');
const numericId = require('../numericId');
const { requireAdmin } = require('./auth');

router.param('id', numericId);

// GET /api/reports — signalements créés via POST /api/chat-requests/:id/report
router.get('/', requireAdmin, ah(async (req, res) => {
  res.json(await db.all('SELECT * FROM reports ORDER BY created_at DESC'));
}));

// DELETE /api/reports/:id
router.delete('/:id', requireAdmin, ah(async (req, res) => {
  const info = await db.run('DELETE FROM reports WHERE id = ?', [req.params.id]);
  if (!info.changes) return res.status(404).json({ error: 'Signalement introuvable.' });
  res.status(204).end();
}));

module.exports = router;

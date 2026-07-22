const express = require('express');
const router  = express.Router();
const db      = require('../database');
const ah      = require('../asyncHandler');
const { requireAdmin } = require('./auth');

// GET /api/reviews
router.get('/', ah(async (req, res) => {
  res.json(await db.all('SELECT * FROM reviews ORDER BY created_at DESC'));
}));

// POST /api/reviews
router.post('/', ah(async (req, res) => {
  const { stars, text, pseudo, vol_name, domain } = req.body;
  if (!Number.isInteger(stars) || stars < 1 || stars > 5)
    return res.status(400).json({ error: 'La note doit être un entier entre 1 et 5.' });
  if (!text?.trim())
    return res.status(400).json({ error: 'Le texte de l\'avis est requis.' });

  const info = await db.run(
    'INSERT INTO reviews (stars, text, pseudo, vol_name, domain) VALUES (?, ?, ?, ?, ?)',
    [
      stars,
      text.trim(),
      pseudo?.trim()   || 'Anonyme',
      vol_name?.trim() || null,
      domain?.trim()   || null,
    ],
    'id'
  );

  res.status(201).json(
    await db.get('SELECT * FROM reviews WHERE id = ?', [info.lastInsertRowid])
  );
}));

// DELETE /api/reviews/:id
router.delete('/:id', requireAdmin, ah(async (req, res) => {
  const info = await db.run('DELETE FROM reviews WHERE id = ?', [req.params.id]);
  if (!info.changes) return res.status(404).json({ error: 'Avis introuvable.' });
  res.status(204).end();
}));

module.exports = router;

const express = require('express');
const router  = express.Router();
const db      = require('../database');

// GET /api/reviews
router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all());
});

// POST /api/reviews
router.post('/', (req, res) => {
  const { stars, text, pseudo, vol_name, domain } = req.body;
  if (!Number.isInteger(stars) || stars < 1 || stars > 5)
    return res.status(400).json({ error: 'La note doit être un entier entre 1 et 5.' });
  if (!text?.trim())
    return res.status(400).json({ error: 'Le texte de l\'avis est requis.' });

  const info = db.prepare(
    'INSERT INTO reviews (stars, text, pseudo, vol_name, domain) VALUES (?, ?, ?, ?, ?)'
  ).run(
    stars,
    text.trim(),
    pseudo?.trim()   || 'Anonyme',
    vol_name?.trim() || null,
    domain?.trim()   || null,
  );

  res.status(201).json(
    db.prepare('SELECT * FROM reviews WHERE id = ?').get(info.lastInsertRowid)
  );
});

// DELETE /api/reviews/:id
router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: 'Avis introuvable.' });
  res.status(204).end();
});

module.exports = router;

const express = require('express');
const router  = express.Router();
const db      = require('../database');
const ah      = require('../asyncHandler');
const numericId = require('../numericId');
const { requireAdmin } = require('./auth');

router.param('id', numericId);

// Colonnes publiques : chat_request_id et volunteer_id restent internes.
const PUBLIC_COLUMNS = 'id, stars, text, pseudo, vol_name, domain, created_at';

// GET /api/reviews
router.get('/', ah(async (req, res) => {
  res.json(await db.all(`SELECT ${PUBLIC_COLUMNS} FROM reviews ORDER BY created_at DESC`));
}));

// POST /api/reviews — { stars, text, request_id, token }
// L'avis doit venir d'un échange réellement accepté : `token` est le
// session_token de la demande, connu seulement de l'utilisateur·rice. Sans
// ça, n'importe qui pourrait publier de faux avis sur l'accueil ou fausser
// la note moyenne d'un·e bénévole. Pseudo, bénévole et domaine sont repris
// de l'échange plutôt que du client.
router.post('/', ah(async (req, res) => {
  const { stars, text, request_id, token } = req.body;
  if (!Number.isInteger(stars) || stars < 1 || stars > 5)
    return res.status(400).json({ error: 'La note doit être un entier entre 1 et 5.' });
  if (typeof text !== 'string' || !text.trim())
    return res.status(400).json({ error: 'Le texte de l\'avis est requis.' });
  if (text.length > 1000)
    return res.status(400).json({ error: 'Avis trop long (1000 caractères maximum).' });
  if (!Number.isInteger(request_id) || !token)
    return res.status(403).json({ error: 'Seule une personne ayant eu un échange peut laisser un avis.' });

  const chat = await db.get(`
    SELECT cr.*, v.name AS vol_name FROM chat_requests cr
    JOIN volunteers v ON v.id = cr.volunteer_id
    WHERE cr.id = ?
  `, [request_id]);
  if (!chat || token !== chat.session_token || !chat.accepted_at)
    return res.status(403).json({ error: 'Seule une personne ayant eu un échange peut laisser un avis.' });

  try {
    const info = await db.run(`
      INSERT INTO reviews (stars, text, pseudo, vol_name, domain, volunteer_id, chat_request_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [stars, text.trim(), chat.user_pseudo, chat.vol_name, chat.domain, chat.volunteer_id, chat.id], 'id');

    res.status(201).json(
      await db.get(`SELECT ${PUBLIC_COLUMNS} FROM reviews WHERE id = ?`, [info.lastInsertRowid])
    );
  } catch (e) {
    if (e.message.includes('duplicate key'))
      return res.status(409).json({ error: 'Un avis a déjà été laissé pour cet échange.' });
    throw e;
  }
}));

// DELETE /api/reviews/:id
router.delete('/:id', requireAdmin, ah(async (req, res) => {
  const info = await db.run('DELETE FROM reviews WHERE id = ?', [req.params.id]);
  if (!info.changes) return res.status(404).json({ error: 'Avis introuvable.' });
  res.status(204).end();
}));

module.exports = router;

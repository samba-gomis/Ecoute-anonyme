const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const db      = require('../database');
const ah      = require('../asyncHandler');
const numericId = require('../numericId');
const { requireAdmin, requireVolunteer } = require('./auth');

router.param('id', numericId);

const VALID_STATUSES = ['online', 'away', 'offline'];

function parseRow(row) {
  if (!row) return null;
  // Never expose password_hash or the one-time setup token to the client
  const { password_hash, setup_token, setup_token_expires, ...safe } = row;
  return { ...safe, tags: JSON.parse(safe.tags) };
}

// GET /api/volunteers
router.get('/', ah(async (req, res) => {
  const rows = await db.all('SELECT * FROM volunteers ORDER BY created_at ASC');
  res.json(rows.map(parseRow));
}));

// GET /api/volunteers/me/stats — chiffres du salon de l'espace bénévole,
// pour le/la bénévole connecté·e : échanges acceptés aujourd'hui (heure de
// Paris), note moyenne de ses avis, durée moyenne de ses échanges terminés.
router.get('/me/stats', requireVolunteer, ah(async (req, res) => {
  const id = req.volunteerId;
  res.json(await db.get(`
    SELECT
      (SELECT count(*)::int FROM chat_requests
        WHERE volunteer_id = ?
          AND accepted_at >= date_trunc('day', now() AT TIME ZONE 'Europe/Paris') AT TIME ZONE 'Europe/Paris'
      ) AS exchanges_today,
      (SELECT round(avg(stars), 1)::float FROM reviews WHERE volunteer_id = ?) AS avg_rating,
      (SELECT count(*)::int FROM reviews WHERE volunteer_id = ?) AS review_count,
      (SELECT round(avg(extract(epoch FROM ended_at - accepted_at)) / 60)::int FROM chat_requests
        WHERE volunteer_id = ? AND accepted_at IS NOT NULL AND ended_at IS NOT NULL
      ) AS avg_duration_min
  `, [id, id, id, id]));
}));

// GET /api/volunteers/:id
router.get('/:id', ah(async (req, res) => {
  const row = await db.get('SELECT * FROM volunteers WHERE id = ?', [req.params.id]);
  if (!row) return res.status(404).json({ error: 'Bénévole introuvable.' });
  res.json(parseRow(row));
}));

// POST /api/volunteers
router.post('/', requireAdmin, ah(async (req, res) => {
  const { name, email, tags, status, login, password, description } = req.body;
  if (!name?.trim())  return res.status(400).json({ error: 'Le champ "name" est requis.' });
  if (!login?.trim()) return res.status(400).json({ error: 'Un identifiant de connexion est requis.' });
  if (!password)      return res.status(400).json({ error: 'Un mot de passe est requis.' });
  if (password.length < 6) return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères.' });

  const tagsJson       = JSON.stringify(Array.isArray(tags) ? tags : []);
  const safeStatus     = VALID_STATUSES.includes(status) ? status : 'online';
  const safeEmail      = email?.trim() || null;
  const safeLogin      = login.trim();
  const safeDescription = description?.trim() || null;
  const passwordHash   = bcrypt.hashSync(password, 10);

  try {
    const info = await db.run(
      'INSERT INTO volunteers (name, email, tags, status, login, password_hash, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name.trim(), safeEmail, tagsJson, safeStatus, safeLogin, passwordHash, safeDescription],
      'id'
    );

    res.status(201).json(parseRow(
      await db.get('SELECT * FROM volunteers WHERE id = ?', [info.lastInsertRowid])
    ));
  } catch (e) {
    if (e.message.includes('duplicate key')) {
      if (e.message.includes('email')) return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
      if (e.message.includes('login')) return res.status(409).json({ error: 'Cet identifiant est déjà utilisé.' });
    }
    throw e;
  }
}));

// PATCH /api/volunteers/status — { status } — self-service, le bénévole
// change son propre statut (En ligne / Absent·e / Hors ligne). Enregistrée
// avant PATCH /:id pour que "status" ne soit pas capturé par :id.
router.patch('/status', requireVolunteer, ah(async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status))
    return res.status(400).json({ error: 'Statut invalide.' });

  await db.run('UPDATE volunteers SET status = ? WHERE id = ?', [status, req.volunteerId]);
  res.json({ ok: true, status });
}));

// PATCH /api/volunteers/:id
router.patch('/:id', requireAdmin, ah(async (req, res) => {
  const existing = await db.get('SELECT * FROM volunteers WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Bénévole introuvable.' });

  const name        = req.body.name?.trim()  || existing.name;
  const email       = 'email'  in req.body   ? (req.body.email?.trim() || null) : existing.email;
  const tags        = 'tags'   in req.body   ? JSON.stringify(Array.isArray(req.body.tags) ? req.body.tags : []) : existing.tags;
  const status      = VALID_STATUSES.includes(req.body.status) ? req.body.status : existing.status;
  const description = 'description' in req.body ? (req.body.description?.trim() || null) : existing.description;

  if (!name) return res.status(400).json({ error: 'Le champ "name" est requis.' });

  try {
    await db.run(
      'UPDATE volunteers SET name=?, email=?, tags=?, status=?, description=? WHERE id=?',
      [name, email, tags, status, description, req.params.id]
    );

    res.json(parseRow(
      await db.get('SELECT * FROM volunteers WHERE id = ?', [req.params.id])
    ));
  } catch (e) {
    if (e.message.includes('duplicate key'))
      return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
    throw e;
  }
}));

// DELETE /api/volunteers/:id
router.delete('/:id', requireAdmin, ah(async (req, res) => {
  const info = await db.run('DELETE FROM volunteers WHERE id = ?', [req.params.id]);
  if (!info.changes) return res.status(404).json({ error: 'Bénévole introuvable.' });
  res.status(204).end();
}));

module.exports = router;

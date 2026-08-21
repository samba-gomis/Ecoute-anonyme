const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const db      = require('../database');
const ah      = require('../asyncHandler');
const { requireVolunteer, resolveVolunteerToken } = require('./auth');
const { generateShareId } = require('./conversations');

function parseRow(row) {
  if (!row) return null;
  // session_token est une capacité (équivalent d'un mot de passe pour cette
  // demande) : jamais renvoyée telle quelle dans une réponse JSON.
  const { session_token, ...safe } = row;
  return { ...safe, messages: JSON.parse(safe.messages) };
}

// Autorise soit le/la bénévole propriétaire de la demande (Authorization:
// Bearer <token bénévole>), soit l'utilisateur·rice anonyme propriétaire
// (?token=<session_token> reçu à la création). Envoie la réponse d'erreur
// et renvoie null si aucun des deux ne correspond.
async function resolveAccess(req, res) {
  const row = await db.get(`
    SELECT cr.*, v.name AS vol_name FROM chat_requests cr
    JOIN volunteers v ON v.id = cr.volunteer_id
    WHERE cr.id = ?
  `, [req.params.id]);
  if (!row) { res.status(404).json({ error: 'Demande introuvable.' }); return null; }

  const header = req.get('authorization') || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : null;
  const volunteerId = bearer ? resolveVolunteerToken(bearer) : null;

  if (volunteerId != null) {
    if (volunteerId !== row.volunteer_id) { res.status(403).json({ error: 'Accès refusé.' }); return null; }
    return { row, role: 'vol' };
  }

  const token = req.query.token || req.body?.token;
  if (token && token === row.session_token) return { row, role: 'user' };

  res.status(401).json({ error: 'Accès refusé.' });
  return null;
}

// POST /api/chat-requests — { volunteer_id, user_pseudo, domain? }
router.post('/', ah(async (req, res) => {
  const { volunteer_id, user_pseudo, domain } = req.body;
  if (!volunteer_id) return res.status(400).json({ error: 'Bénévole requis.' });
  if (!user_pseudo?.trim()) return res.status(400).json({ error: 'Pseudo requis.' });

  const vol = await db.get('SELECT * FROM volunteers WHERE id = ?', [volunteer_id]);
  if (!vol) return res.status(404).json({ error: 'Bénévole introuvable.' });
  if (vol.status === 'offline') return res.status(409).json({ error: 'Ce bénévole n\'est plus disponible.' });

  const session_token = crypto.randomBytes(24).toString('hex');
  const info = await db.run(
    'INSERT INTO chat_requests (session_token, volunteer_id, user_pseudo, domain) VALUES (?, ?, ?, ?)',
    [session_token, volunteer_id, user_pseudo.trim(), domain?.trim() || null],
    'id'
  );

  res.status(201).json({ id: info.lastInsertRowid, session_token });
}));

// GET /api/chat-requests/pending — demandes en attente pour le bénévole connecté
router.get('/pending', requireVolunteer, ah(async (req, res) => {
  await db.run(`
    UPDATE chat_requests SET status = 'expired'
    WHERE volunteer_id = ? AND status = 'pending' AND created_at < now() - interval '2 minutes'
  `, [req.volunteerId]);

  const rows = await db.all(`
    SELECT id, user_pseudo, domain, created_at FROM chat_requests
    WHERE volunteer_id = ? AND status = 'pending'
    ORDER BY created_at ASC
  `, [req.volunteerId]);
  res.json(rows);
}));

// POST /api/chat-requests/:id/accept — le bénévole prend en charge la demande
router.post('/:id/accept', requireVolunteer, ah(async (req, res) => {
  const info = await db.run(`
    UPDATE chat_requests SET status = 'accepted', accepted_at = now()
    WHERE id = ? AND volunteer_id = ? AND status = 'pending'
  `, [req.params.id, req.volunteerId]);
  if (!info.changes) return res.status(409).json({ error: 'Cette demande n\'est plus disponible.' });
  res.json({ ok: true });
}));

// POST /api/chat-requests/:id/decline
router.post('/:id/decline', requireVolunteer, ah(async (req, res) => {
  const info = await db.run(`
    UPDATE chat_requests SET status = 'declined'
    WHERE id = ? AND volunteer_id = ? AND status = 'pending'
  `, [req.params.id, req.volunteerId]);
  if (!info.changes) return res.status(409).json({ error: 'Cette demande n\'est plus disponible.' });
  res.status(204).end();
}));

// GET /api/chat-requests/:id  — état courant (poll des deux côtés)
router.get('/:id', ah(async (req, res) => {
  await db.run(`
    UPDATE chat_requests SET status = 'expired'
    WHERE id = ? AND status = 'pending' AND created_at < now() - interval '2 minutes'
  `, [req.params.id]);

  const access = await resolveAccess(req, res);
  if (!access) return;
  res.json(parseRow(access.row));
}));

// POST /api/chat-requests/:id/messages — { text } (+ ?token= côté utilisateur)
router.post('/:id/messages', ah(async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'Message vide.' });

  const access = await resolveAccess(req, res);
  if (!access) return;
  if (access.row.status !== 'accepted')
    return res.status(409).json({ error: 'Cette conversation n\'est pas active.' });

  const messages = JSON.parse(access.row.messages);
  messages.push({ from: access.role, text: text.trim(), at: new Date().toISOString() });

  await db.run('UPDATE chat_requests SET messages = ? WHERE id = ?', [JSON.stringify(messages), req.params.id]);
  res.status(201).json({ ok: true });
}));

// POST /api/chat-requests/:id/end — termine la session, sauvegarde le
// transcript dans `conversations` si la discussion avait bien démarré.
router.post('/:id/end', ah(async (req, res) => {
  const access = await resolveAccess(req, res);
  if (!access) return;
  const { row } = access;

  if (row.status === 'ended') return res.json({ ok: true, share_id: null }); // idempotent

  await db.run(`UPDATE chat_requests SET status = 'ended', ended_at = now() WHERE id = ?`, [row.id]);

  let share_id = null;
  if (row.accepted_at) {
    share_id = await generateShareId();
    await db.run(`
      INSERT INTO conversations (share_id, user_pseudo, vol_display, domain, messages, started_at, ended_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      share_id, row.user_pseudo, row.vol_name, row.domain,
      row.messages, new Date(row.accepted_at).toISOString(), new Date().toISOString(),
    ]);
  }

  res.json({ ok: true, share_id });
}));

module.exports = router;

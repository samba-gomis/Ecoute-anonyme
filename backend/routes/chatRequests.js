const express = require('express');
const router  = express.Router();
const crypto  = require('crypto');
const db      = require('../database');
const ah      = require('../asyncHandler');
const numericId = require('../numericId');
const { requireAdmin, requireVolunteer, resolveVolunteerToken } = require('./auth');

router.param('id', numericId);

const MAX_MESSAGE_LENGTH = 2000;
// Codes des motifs proposés dans chat.html et espace-benevole.html (admin.html
// les traduit en libellés).
const REPORT_REASONS = ['argent', 'info', 'hors', 'comportement', 'menace', 'harcel', 'inapp', 'autre'];

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
  if (!Number.isInteger(volunteer_id)) return res.status(400).json({ error: 'Bénévole requis.' });
  if (typeof user_pseudo !== 'string' || !user_pseudo.trim()) return res.status(400).json({ error: 'Pseudo requis.' });
  // Même limite que le champ du formulaire (maxlength 30).
  if (user_pseudo.trim().length > 30) return res.status(400).json({ error: 'Pseudo trop long (30 caractères maximum).' });
  // Le domaine vient du premier tag du/de la bénévole : tronqué plutôt que
  // refusé, pour qu'un tag trop long saisi dans l'admin ne bloque pas le chat.
  const safeDomain = typeof domain === 'string' ? domain.trim().slice(0, 50) || null : null;

  const vol = await db.get('SELECT * FROM volunteers WHERE id = ?', [volunteer_id]);
  if (!vol) return res.status(404).json({ error: 'Bénévole introuvable.' });
  if (vol.status === 'offline') return res.status(409).json({ error: 'Ce bénévole n\'est plus disponible.' });

  const session_token = crypto.randomBytes(24).toString('hex');
  const info = await db.run(
    'INSERT INTO chat_requests (session_token, volunteer_id, user_pseudo, domain) VALUES (?, ?, ?, ?)',
    [session_token, volunteer_id, user_pseudo.trim(), safeDomain],
    'id'
  );

  res.status(201).json({ id: info.lastInsertRowid, session_token });
}));

// GET /api/chat-requests/stats — nombre d'échanges ayant eu lieu (acceptés),
// pour le tableau de bord admin. Aucun contenu.
router.get('/stats', requireAdmin, ah(async (req, res) => {
  res.json(await db.get(
    'SELECT count(*)::int AS exchanges FROM chat_requests WHERE accepted_at IS NOT NULL'
  ));
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
  if (typeof text !== 'string' || !text.trim()) return res.status(400).json({ error: 'Message vide.' });
  if (text.length > MAX_MESSAGE_LENGTH)
    return res.status(400).json({ error: `Message trop long (${MAX_MESSAGE_LENGTH} caractères maximum).` });

  const access = await resolveAccess(req, res);
  if (!access) return;

  const entry = JSON.stringify([{ from: access.role, text: text.trim(), at: new Date().toISOString() }]);
  // Ajout atomique côté SQL plutôt qu'un lire-modifier-écrire en JS : si
  // l'utilisateur·rice et le/la bénévole envoient un message au même instant,
  // un read-modify-write ferait perdre l'un des deux (le second UPDATE
  // écraserait le tableau "messages" lu avant l'écriture du premier).
  const info = await db.run(`
    UPDATE chat_requests SET messages = (messages::jsonb || ?::jsonb)::text
    WHERE id = ? AND status = 'accepted'
  `, [entry, req.params.id]);

  if (!info.changes) return res.status(409).json({ error: 'Cette conversation n\'est pas active.' });
  res.status(201).json({ ok: true });
}));

// POST /api/chat-requests/:id/report — { reason } (+ ?token= côté utilisateur)
// Signalement par l'une ou l'autre partie d'une conversation (abus,
// comportement inapproprié...). resolveAccess garantit que seul·e un·e
// participant·e réel·le de cette conversation peut signaler.
router.post('/:id/report', ah(async (req, res) => {
  const { reason } = req.body;
  if (!REPORT_REASONS.includes(reason)) return res.status(400).json({ error: 'Motif requis.' });

  const access = await resolveAccess(req, res);
  if (!access) return;

  const reportedName = access.role === 'user' ? access.row.vol_name : access.row.user_pseudo;
  await db.run(
    'INSERT INTO reports (chat_request_id, reporter_role, reported_name, reason) VALUES (?, ?, ?, ?)',
    [access.row.id, access.role, reportedName, reason.trim()]
  );
  res.status(201).json({ ok: true });
}));

// POST /api/chat-requests/:id/end — termine la session (idempotent). Le
// contenu n'est pas conservé : purgeChats() l'efface peu après.
router.post('/:id/end', ah(async (req, res) => {
  const access = await resolveAccess(req, res);
  if (!access) return;

  await db.run(`
    UPDATE chat_requests SET status = 'ended', ended_at = now()
    WHERE id = ? AND status IN ('pending', 'accepted')
  `, [access.row.id]);
  res.json({ ok: true });
}));

// Rien n'est gardé d'un échange terminé (cf. charte de confidentialité) :
// messages et pseudo sont effacés 2 min après la fin, le temps que l'autre
// partie récupère les derniers messages par son poll. On ne garde que les
// horaires et le/la bénévole, pour les statistiques. Les demandes jamais
// reprises expirent, et les échanges abandonnés sans fin explicite (onglet
// planté, réseau coupé) sont clos au bout de 12 h.
async function purgeChats() {
  await db.run(`
    UPDATE chat_requests SET status = 'expired'
    WHERE status = 'pending' AND created_at < now() - interval '2 minutes'
  `);
  await db.run(`
    UPDATE chat_requests SET status = 'ended', ended_at = now()
    WHERE status = 'accepted' AND accepted_at < now() - interval '12 hours'
  `);
  await db.run(`
    UPDATE chat_requests SET messages = '[]', user_pseudo = 'Anonyme'
    WHERE status IN ('ended', 'declined', 'expired')
      AND coalesce(ended_at, created_at) < now() - interval '2 minutes'
      AND (messages <> '[]' OR user_pseudo <> 'Anonyme')
  `);
}

router.purgeChats = purgeChats;
module.exports = router;

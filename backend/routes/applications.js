const express    = require('express');
const bcrypt     = require('bcryptjs');
const router     = express.Router();
const db         = require('../database');
const ah         = require('../asyncHandler');
const { requireAdmin } = require('./auth');

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'ecoute.anonyme26@gmail.com';
const SITE_URL       = process.env.SITE_URL || 'http://localhost:3000';
const VALID_STATUSES = ['online', 'away', 'offline'];

const EMAIL_CONFIGURED = Boolean(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL);

// Render blocks outbound SMTP (ports 465 and 587 both timed out), so emails
// go through Brevo's HTTPS API instead — port 443 is never blocked.
async function sendMail({ to, replyTo, subject, text }) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'Écoute Anonyme', email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email: to }],
      ...(replyTo ? { replyTo: { email: replyTo } } : {}),
      subject,
      textContent: text,
    }),
  });
  if (!res.ok) throw new Error(`Brevo API ${res.status}: ${await res.text()}`);
}

// GET /api/applications
router.get('/', requireAdmin, ah(async (req, res) => {
  const rows = await db.all('SELECT * FROM applications ORDER BY created_at DESC');
  res.json(rows.map(r => ({ ...r, dispos: JSON.parse(r.dispos) })));
}));

// POST /api/applications/:id/accept — { login, password, tags?, status?, name?, email? }
router.post('/:id/accept', requireAdmin, ah(async (req, res) => {
  const app = await db.get('SELECT * FROM applications WHERE id = ?', [req.params.id]);
  if (!app) return res.status(404).json({ error: 'Candidature introuvable.' });

  const { login, password, tags, status } = req.body;
  if (!login?.trim()) return res.status(400).json({ error: 'Un identifiant de connexion est requis.' });
  if (!password || password.length < 6) return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères.' });

  const finalName  = req.body.name?.trim()  || `${app.prenom} ${app.nom}`;
  const finalEmail = req.body.email?.trim() || app.email;
  const finalDescription = req.body.description?.trim() || app.description || null;
  const safeStatus = VALID_STATUSES.includes(status) ? status : 'offline';
  const tagsJson   = JSON.stringify(Array.isArray(tags) ? tags : (app.domaine ? [app.domaine] : []));
  const passwordHash = bcrypt.hashSync(password, 10);

  let volunteer;
  try {
    const info = await db.run(`
      INSERT INTO volunteers (name, email, tags, status, login, password_hash, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [finalName, finalEmail, tagsJson, safeStatus, login.trim(), passwordHash, finalDescription], 'id');
    volunteer = await db.get('SELECT * FROM volunteers WHERE id = ?', [info.lastInsertRowid]);
  } catch (e) {
    if (e.message.includes('duplicate key')) {
      if (e.message.includes('email')) return res.status(409).json({ error: 'Cet email est déjà utilisé par un autre bénévole.' });
      if (e.message.includes('login')) return res.status(409).json({ error: 'Cet identifiant est déjà utilisé.' });
    }
    throw e;
  }

  await db.run('DELETE FROM applications WHERE id = ?', [app.id]);

  // Envoi asynchrone : ne bloque jamais la réponse au client (évite un
  // "Envoi en cours…" bloqué si le SMTP est lent ou le service vient de se réveiller).
  if (EMAIL_CONFIGURED) {
    sendMail({
      to: app.email,
      subject: 'Votre candidature bénévole a été acceptée — Écoute Anonyme',
      text: [
        `Bonjour ${app.prenom},`,
        '',
        'Bonne nouvelle : votre candidature pour devenir bénévole sur Écoute Anonyme a été acceptée !',
        '',
        'Voici vos identifiants pour accéder à l\'espace bénévole :',
        `Identifiant : ${login.trim()}`,
        `Mot de passe : ${password}`,
        '',
        `Connectez-vous ici : ${SITE_URL}/espace-benevole`,
        '',
        'Une fois connecté·e, vous pourrez modifier votre identifiant et votre mot de passe depuis "Mon compte".',
        '',
        'Merci pour votre engagement,',
        'L\'équipe Écoute Anonyme',
      ].join('\n'),
    }).catch(e => console.error('Échec de l\'envoi de l\'email d\'acceptation :', e.message));
  } else {
    console.warn('BREVO_API_KEY / BREVO_SENDER_EMAIL absents du .env — bénévole créé mais aucun email de confirmation envoyé.');
  }

  const { password_hash, ...safeVolunteer } = volunteer;
  res.status(201).json({ ok: true, volunteer: { ...safeVolunteer, tags: JSON.parse(safeVolunteer.tags) } });
}));

// POST /api/applications/:id/reject
router.post('/:id/reject', requireAdmin, ah(async (req, res) => {
  const app = await db.get('SELECT * FROM applications WHERE id = ?', [req.params.id]);
  if (!app) return res.status(404).json({ error: 'Candidature introuvable.' });

  await db.run('DELETE FROM applications WHERE id = ?', [app.id]);

  if (EMAIL_CONFIGURED) {
    sendMail({
      to: app.email,
      subject: 'Votre candidature bénévole — Écoute Anonyme',
      text: [
        `Bonjour ${app.prenom},`,
        '',
        'Nous vous remercions sincèrement pour l\'intérêt que vous portez à Écoute Anonyme et pour le temps consacré à votre candidature.',
        '',
        'Après examen, nous ne sommes malheureusement pas en mesure d\'y donner suite pour le moment.',
        '',
        'N\'hésitez pas à retenter votre chance dans le futur.',
        '',
        'Bien cordialement,',
        'L\'équipe Écoute Anonyme',
      ].join('\n'),
    }).catch(e => console.error('Échec de l\'envoi de l\'email de refus :', e.message));
  } else {
    console.warn('BREVO_API_KEY / BREVO_SENDER_EMAIL absents du .env — candidature refusée mais aucun email envoyé.');
  }

  res.status(204).end();
}));

// POST /api/applications
router.post('/', ah(async (req, res) => {
  const { prenom, nom, email, pseudo, motivation, description, domaine, dispos } = req.body;

  if (!prenom?.trim() || !nom?.trim() || !email?.trim() || !pseudo?.trim()
    || !motivation?.trim() || !description?.trim()) {
    return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis.' });
  }
  if (!Array.isArray(dispos) || dispos.length === 0) {
    return res.status(400).json({ error: 'Veuillez sélectionner au moins une disponibilité.' });
  }

  const info = await db.run(`
    INSERT INTO applications (prenom, nom, email, pseudo, motivation, description, domaine, dispos)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    prenom.trim(), nom.trim(), email.trim(), pseudo.trim(),
    motivation.trim(), description.trim(), domaine?.trim() || null,
    JSON.stringify(dispos)
  ], 'id');

  if (EMAIL_CONFIGURED) {
    sendMail({
      to: CONTACT_EMAIL,
      replyTo: email.trim(),
      subject: `Nouvelle candidature bénévole — ${prenom} ${nom}`,
      text: [
        `Prénom : ${prenom}`,
        `Nom : ${nom}`,
        `Email : ${email}`,
        `Pseudo souhaité : ${pseudo}`,
        `Domaine : ${domaine || '—'}`,
        `Disponibilités : ${dispos.join(', ')}`,
        '',
        'Motivations :',
        motivation,
        '',
        'Description courte :',
        description,
      ].join('\n'),
    }).catch(e => console.error('Échec de l\'envoi de l\'email de candidature :', e.message));
  } else {
    console.warn('BREVO_API_KEY / BREVO_SENDER_EMAIL absents du .env — candidature enregistrée en base mais aucun email envoyé.');
  }

  res.status(201).json({
    ok: true,
    row: await db.get('SELECT * FROM applications WHERE id = ?', [info.lastInsertRowid]),
  });
}));

module.exports = router;

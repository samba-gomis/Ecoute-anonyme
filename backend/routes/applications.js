const express    = require('express');
const nodemailer = require('nodemailer');
const bcrypt     = require('bcryptjs');
const router     = express.Router();
const db         = require('../database');
const { requireAdmin } = require('./auth');

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'ecoute.anonyme26@gmail.com';
const SITE_URL       = process.env.SITE_URL || 'http://localhost:3000';
const VALID_STATUSES = ['online', 'away', 'offline'];

const transporter = (process.env.EMAIL_USER && process.env.EMAIL_PASS)
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    })
  : null;

// GET /api/applications
router.get('/', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM applications ORDER BY created_at DESC').all();
  res.json(rows.map(r => ({ ...r, dispos: JSON.parse(r.dispos) })));
});

// POST /api/applications/:id/accept — { login, password, tags?, status?, name?, email? }
router.post('/:id/accept', requireAdmin, async (req, res) => {
  const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
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
    const info = db.prepare(`
      INSERT INTO volunteers (name, email, tags, status, login, password_hash, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(finalName, finalEmail, tagsJson, safeStatus, login.trim(), passwordHash, finalDescription);
    volunteer = db.prepare('SELECT * FROM volunteers WHERE id = ?').get(info.lastInsertRowid);
  } catch (e) {
    if (e.message.includes('UNIQUE')) {
      if (e.message.includes('email')) return res.status(409).json({ error: 'Cet email est déjà utilisé par un autre bénévole.' });
      if (e.message.includes('login')) return res.status(409).json({ error: 'Cet identifiant est déjà utilisé.' });
    }
    throw e;
  }

  db.prepare('DELETE FROM applications WHERE id = ?').run(app.id);

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Écoute Anonyme" <${process.env.EMAIL_USER}>`,
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
          `Connectez-vous ici : ${SITE_URL}/html/espace-benevole.html`,
          '',
          'Une fois connecté·e, vous pourrez modifier votre identifiant et votre mot de passe depuis "Mon compte".',
          '',
          'Merci pour votre engagement,',
          'L\'équipe Écoute Anonyme',
        ].join('\n'),
      });
    } catch (e) {
      console.error('Échec de l\'envoi de l\'email d\'acceptation :', e.message);
    }
  } else {
    console.warn('EMAIL_USER / EMAIL_PASS absents du .env — bénévole créé mais aucun email de confirmation envoyé.');
  }

  const { password_hash, ...safeVolunteer } = volunteer;
  res.status(201).json({ ok: true, volunteer: { ...safeVolunteer, tags: JSON.parse(safeVolunteer.tags) } });
});

// POST /api/applications/:id/reject
router.post('/:id/reject', requireAdmin, async (req, res) => {
  const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
  if (!app) return res.status(404).json({ error: 'Candidature introuvable.' });

  db.prepare('DELETE FROM applications WHERE id = ?').run(app.id);

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Écoute Anonyme" <${process.env.EMAIL_USER}>`,
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
      });
    } catch (e) {
      console.error('Échec de l\'envoi de l\'email de refus :', e.message);
    }
  } else {
    console.warn('EMAIL_USER / EMAIL_PASS absents du .env — candidature refusée mais aucun email envoyé.');
  }

  res.status(204).end();
});

// POST /api/applications
router.post('/', async (req, res) => {
  const { prenom, nom, email, pseudo, motivation, description, domaine, dispos } = req.body;

  if (!prenom?.trim() || !nom?.trim() || !email?.trim() || !pseudo?.trim()
    || !motivation?.trim() || !description?.trim()) {
    return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis.' });
  }
  if (!Array.isArray(dispos) || dispos.length === 0) {
    return res.status(400).json({ error: 'Veuillez sélectionner au moins une disponibilité.' });
  }

  const info = db.prepare(`
    INSERT INTO applications (prenom, nom, email, pseudo, motivation, description, domaine, dispos)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    prenom.trim(), nom.trim(), email.trim(), pseudo.trim(),
    motivation.trim(), description.trim(), domaine?.trim() || null,
    JSON.stringify(dispos)
  );

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Écoute Anonyme" <${process.env.EMAIL_USER}>`,
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
      });
    } catch (e) {
      console.error('Échec de l\'envoi de l\'email de candidature :', e.message);
    }
  } else {
    console.warn('EMAIL_USER / EMAIL_PASS absents du .env — candidature enregistrée en base mais aucun email envoyé.');
  }

  res.status(201).json({
    ok: true,
    row: db.prepare('SELECT * FROM applications WHERE id = ?').get(info.lastInsertRowid),
  });
});

module.exports = router;

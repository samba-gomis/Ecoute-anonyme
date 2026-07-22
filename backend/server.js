require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const path         = require('path');
const bcrypt       = require('bcryptjs');
const cookieParser = require('cookie-parser');

const db                  = require('./database');
const volunteersRouter    = require('./routes/volunteers');
const conversationsRouter = require('./routes/conversations');
const reviewsRouter       = require('./routes/reviews');
const authRouter          = require('./routes/auth');
const applicationsRouter  = require('./routes/applications');

const app  = express();
const PORT = process.env.PORT || 3000;

// Nécessaire pour que req.secure reflète le protocole d'origine derrière le proxy de Render
app.set('trust proxy', 1);

// Allow requests from file://, Live Server, and same origin
app.use(cors({
  origin: (origin, cb) => cb(null, true),
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());
app.use(cookieParser());

// Serve the frontend
// URLs propres : /benevoles, /chat, /presentation... résolvent vers html/*.html
// sans exposer le préfixe /html/ ni l'extension .html
app.use(express.static(path.join(__dirname, '..', 'html'), { extensions: ['html'] }));
app.use(express.static(path.join(__dirname, '..'), { extensions: ['html'] }));

// API
app.use('/api/auth',          authRouter);
app.use('/api/volunteers',    volunteersRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/reviews',       reviewsRouter);
app.use('/api/applications',  applicationsRouter);

// 404 for unknown /api routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Route API introuvable.' });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne.' });
});

async function start() {
  await db.init();

  // Seed des identifiants admin par défaut si absents
  await db.run(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO NOTHING',
    ['admin_login', 'admin']
  );
  await db.run(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO NOTHING',
    ['admin_password_hash', bcrypt.hashSync('admin123', 10)]
  );

  app.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════╗
  ║   Écoute Anonyme  ·  Backend actif    ║
  ║   http://localhost:${PORT}               ║
  ╚═══════════════════════════════════════╝
  `);
  });
}

start().catch(err => {
  console.error('Échec du démarrage du serveur :', err);
  process.exit(1);
});

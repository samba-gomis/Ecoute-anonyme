require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const path         = require('path');
const bcrypt       = require('bcryptjs');
const cookieParser = require('cookie-parser');

const db                  = require('./database');
const volunteersRouter    = require('./routes/volunteers');
const reviewsRouter       = require('./routes/reviews');
const authRouter          = require('./routes/auth');
const applicationsRouter  = require('./routes/applications');
const chatRequestsRouter  = require('./routes/chatRequests');
const reportsRouter       = require('./routes/reports');

const app  = express();
const PORT = process.env.PORT || 3000;

// Nécessaire pour que req.secure reflète le protocole d'origine derrière le proxy de Render
app.set('trust proxy', 1);

// Allow requests from file://, Live Server, localhost, and our own deployed
// origins (Netlify front + this Render backend). Tout le reste est refusé —
// en pratique le site n'appelle jamais l'API en cross-origin (tous les
// fetch() du front utilisent des chemins relatifs "/api/..."), donc cette
// liste ne sert que de garde-fou, pas de mécanisme dont l'app dépend.
const ALLOWED_ORIGIN_PATTERNS = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /\.onrender\.com$/,
  /\.netlify\.app$/,
  ...(process.env.SITE_URL ? [new RegExp(`^${process.env.SITE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)] : []),
];
app.use(cors({
  origin: (origin, cb) => {
    // Pas d'en-tête Origin (file://, curl, requêtes serveur-à-serveur) : autorisé.
    if (!origin) return cb(null, true);
    cb(null, ALLOWED_ORIGIN_PATTERNS.some(re => re.test(origin)));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());
app.use(cookieParser());

// Serve the frontend
// URLs propres : /benevoles, /chat, /presentation... résolvent vers html/*.html
// sans exposer le préfixe /html/ ni l'extension .html
app.use(express.static(path.join(__dirname, '..', 'html'), { extensions: ['html'] }));

// Le second mount statique sert la racine du repo (pour index.html, admin.html,
// logo.png, css/, shared-ui.js...) : on bloque explicitement tout ce qui ne
// doit jamais être téléchargeable (code source backend, config, dépendances).
const BLOCKED_ROOT_PATHS = /^\/(backend|node_modules|scss|\.git)(\/|$)|^\/(package(-lock)?\.json|render\.yaml|\.env(\..*)?|README\.md|LICENSE)$/i;
app.use((req, res, next) => {
  if (BLOCKED_ROOT_PATHS.test(req.path)) return res.status(404).end();
  next();
});
app.use(express.static(path.join(__dirname, '..'), { extensions: ['html'] }));

// API
app.use('/api/auth',          authRouter);
app.use('/api/volunteers',    volunteersRouter);
app.use('/api/reviews',       reviewsRouter);
app.use('/api/applications',  applicationsRouter);
app.use('/api/chat-requests', chatRequestsRouter);
app.use('/api/reports',       reportsRouter);

// TEMPORAIRE — diagnostic du proxy Netlify → Render, pour corriger le
// limiteur de connexion (quelle IP voit-on vraiment ?). Renvoie à l'appelant
// uniquement ses propres en-têtes, rien n'est journalisé. À retirer.
app.get('/api/_diag/ip', (req, res) => {
  const h = name => req.get(name) || null;
  res.set('Cache-Control', 'no-store').json({
    ip: req.ip,
    ips: req.ips,
    socket: req.socket.remoteAddress,
    xForwardedFor: h('x-forwarded-for'),
    xNfClientConnectionIp: h('x-nf-client-connection-ip'),
    xRealIp: h('x-real-ip'),
    trueClientIp: h('true-client-ip'),
    cfConnectingIp: h('cf-connecting-ip'),
    headerNames: Object.keys(req.headers).sort(),
  });
});

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

  // Seed des identifiants admin par défaut si absents. En production,
  // ADMIN_PASSWORD évite qu'une base neuve démarre avec "admin123", connu de
  // tous ceux qui lisent ce dépôt public.
  await db.run(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO NOTHING',
    ['admin_login', 'admin']
  );
  await db.run(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO NOTHING',
    ['admin_password_hash', bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10)]
  );

  // Effacement régulier du contenu des échanges terminés (voir purgeChats
  // dans routes/chatRequests.js). Lancé aussi au démarrage, car l'instance
  // gratuite Render s'endort et les intervalles ne tournent pas pendant ce temps.
  const purge = () => chatRequestsRouter.purgeChats()
    .catch(err => console.error('Purge des échanges terminés :', err.message));
  await purge();
  setInterval(purge, 60 * 1000).unref();

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

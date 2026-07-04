const express = require('express');
const cors    = require('cors');
const path    = require('path');

const volunteersRouter    = require('./routes/volunteers');
const conversationsRouter = require('./routes/conversations');

const app  = express();
const PORT = process.env.PORT || 3000;

// Allow requests from file://, Live Server, and same origin
app.use(cors({
  origin: (origin, cb) => cb(null, true),
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
}));

app.use(express.json());

// Serve the frontend
app.use(express.static(path.join(__dirname, '..')));

// API
app.use('/api/volunteers',    volunteersRouter);
app.use('/api/conversations', conversationsRouter);

// 404 for unknown /api routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Route API introuvable.' });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne.' });
});

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════╗
  ║   Écoute Anonyme  ·  Backend actif    ║
  ║   http://localhost:${PORT}               ║
  ╚═══════════════════════════════════════╝
  `);
});

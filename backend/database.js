const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL manquant. Définissez-le dans .env (voir .env.example).');
}

// Render (et la plupart des hébergeurs Postgres managés) exigent SSL avec un
// certificat auto-signé ; on désactive juste la vérification stricte.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'off' ? false : { rejectUnauthorized: false },
});

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS volunteers (
      id            SERIAL PRIMARY KEY,
      name          TEXT        NOT NULL,
      email         TEXT        UNIQUE,
      tags          TEXT        NOT NULL DEFAULT '[]',
      status        TEXT        NOT NULL DEFAULT 'online'
                                 CHECK (status IN ('online','away','offline')),
      login         TEXT        UNIQUE,
      password_hash TEXT,
      description   TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS conversations (
      share_id    TEXT        PRIMARY KEY,
      user_pseudo TEXT        NOT NULL,
      vol_display TEXT        NOT NULL DEFAULT 'Bénévole',
      domain      TEXT,
      messages    TEXT        NOT NULL DEFAULT '[]',
      started_at  TEXT,
      ended_at    TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id         SERIAL      PRIMARY KEY,
      stars      INTEGER     NOT NULL CHECK (stars BETWEEN 1 AND 5),
      text       TEXT        NOT NULL,
      pseudo     TEXT        NOT NULL DEFAULT 'Anonyme',
      vol_name   TEXT,
      domain     TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS applications (
      id          SERIAL      PRIMARY KEY,
      prenom      TEXT        NOT NULL,
      nom         TEXT        NOT NULL,
      email       TEXT        NOT NULL,
      pseudo      TEXT        NOT NULL,
      motivation  TEXT        NOT NULL,
      description TEXT        NOT NULL,
      domaine     TEXT,
      dispos      TEXT        NOT NULL DEFAULT '[]',
      status      TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending','accepted','rejected')),
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

// Petit helper : convertit les `?` façon SQLite utilisés partout dans les
// routes en `$1, $2, ...` façon Postgres, pour garder les routes lisibles.
function toPgParams(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

const db = {
  pool,
  init,
  // SELECT ... -> une seule ligne (ou undefined)
  async get(sql, params = []) {
    const { rows } = await pool.query(toPgParams(sql), params);
    return rows[0];
  },
  // SELECT ... -> toutes les lignes
  async all(sql, params = []) {
    const { rows } = await pool.query(toPgParams(sql), params);
    return rows;
  },
  // INSERT / UPDATE / DELETE. `idColumn` optionnel : si fourni, ajoute
  // `RETURNING <idColumn>` pour récupérer l'identifiant inséré.
  async run(sql, params = [], idColumn = null) {
    let text = toPgParams(sql);
    if (idColumn && /^\s*insert/i.test(text) && !/returning/i.test(text)) {
      text += ` RETURNING ${idColumn}`;
    }
    const result = await pool.query(text, params);
    return {
      changes: result.rowCount,
      lastInsertRowid: idColumn ? result.rows[0]?.[idColumn] : undefined,
    };
  },
};

module.exports = db;

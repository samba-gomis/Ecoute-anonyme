const db = require('./database');

const volunteers = [
  { name: 'Marie',  email: 'marie@benevole.ea',  tags: ['Anxiété', 'Solitude'],  status: 'online'  },
  { name: 'Thomas', email: 'thomas@benevole.ea', tags: ['Relations', 'Travail'], status: 'away'    },
  { name: 'Léa',   email: 'lea@benevole.ea',    tags: ['Deuil', 'Général'],     status: 'online'  },
  { name: 'Samuel', email: 'samuel@benevole.ea', tags: ['Général'],              status: 'offline' },
];

const insert = db.prepare(
  'INSERT OR IGNORE INTO volunteers (name, email, tags, status) VALUES (?, ?, ?, ?)'
);

const seed = db.transaction((rows) => {
  for (const v of rows) {
    const result = insert.run(v.name, v.email, JSON.stringify(v.tags), v.status);
    if (result.changes) console.log(`  + ${v.name} ajouté·e`);
    else                console.log(`  · ${v.name} déjà présent·e, ignoré·e`);
  }
});

console.log('\nSeed bénévoles :');
seed(volunteers);
console.log('\nTerminé.\n');

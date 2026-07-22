// Les routes sont maintenant asynchrones (Postgres). Express 4 ne rattrape pas
// automatiquement le rejet d'une promesse dans un handler : sans ça, une
// erreur async ne remonterait jamais au error handler global et la requête
// resterait bloquée sans réponse.
module.exports = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

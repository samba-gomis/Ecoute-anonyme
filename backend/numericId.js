// router.param('id', numericId) : les routes /:id attendent un entier
// Postgres. Sans ce garde-fou, "/abc" (ou un nombre hors limites) faisait
// échouer la requête SQL et la route répondait 500 au lieu de 404.
module.exports = (req, res, next, id) =>
  /^\d{1,9}$/.test(id) ? next() : res.status(404).json({ error: 'Ressource introuvable.' });

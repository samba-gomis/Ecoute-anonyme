// Adresse IP réelle de l'appelant, pour le limiteur de connexion.
//
// req.ip ne convient pas : derrière Render, c'est l'adresse interne (10.x)
// du proxy de Render, partagée par tout le monde et qui change d'une requête
// à l'autre. La chaîne réelle est :
//   visiteur → [Netlify, proxy /api/*] → Cloudflare → proxy Render → Node
//
// - Cloudflare écrit l'IP qui s'est connectée à lui dans CF-Connecting-IP
//   (une valeur falsifiée par le client est refusée par Cloudflare). En
//   accès direct à Render, c'est le visiteur ; via Netlify, c'est une IP de
//   sortie de Netlify, différente presque à chaque requête.
// - Via Netlify, l'IP du visiteur est dans X-Nf-Client-Connection-IP, mais
//   n'importe qui peut envoyer cet en-tête en appelant Render directement.
//   On ne le croit donc que si la requête porte une signature Netlify valide
//   (redirection `signed` dans netlify.toml : JWS HS256 dans X-Nf-Sign,
//   signé avec le secret NETLIFY_PROXY_SECRET partagé avec Netlify).
const crypto = require('crypto');

const b64url = buf => buf.toString('base64url');

function hasValidNetlifySignature(req) {
  const secret = process.env.NETLIFY_PROXY_SECRET;
  const token = req.get('x-nf-sign');
  if (!secret || !token) return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [header, payload, signature] = parts;

  const expected = b64url(crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest());
  const given = Buffer.from(signature);
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, Buffer.from(expected))) return false;

  try {
    const { alg } = JSON.parse(Buffer.from(header, 'base64url').toString());
    const { iss, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return alg === 'HS256' && iss === 'netlify' && typeof exp === 'number' && exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

module.exports = function clientIp(req) {
  if (hasValidNetlifySignature(req) && req.get('x-nf-client-connection-ip'))
    return req.get('x-nf-client-connection-ip');
  // En local il n'y a ni Cloudflare ni Netlify : req.ip suffit.
  return req.get('cf-connecting-ip') || req.ip;
};

const jwt = require('jsonwebtoken');
function auth(req, res, next) {
  const header = req.get('authorization') || '';
  if (!header.startsWith('Bearer ')) return res.status(401).json({message:'Autenticação necessária.'});
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET, {
      algorithms:['HS256'], issuer:'dw3-saude', audience:'dw3-frontend'
    });
    next();
  } catch {
    res.status(401).json({message:'Sessão inválida ou expirada. Faça login novamente.'});
  }
}
module.exports = auth;

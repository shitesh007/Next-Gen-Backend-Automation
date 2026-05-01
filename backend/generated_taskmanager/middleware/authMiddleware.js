import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      req.user = jwt.verify(token, process.env.JWT_SECRET || 'automind_secret_123');
      next();
    } catch { res.status(401).json({ message: 'Token failed' }); }
  } else { res.status(401).json({ message: 'No token' }); }
};

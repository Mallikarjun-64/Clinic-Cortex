import { verifyToken } from '../utils/jwt.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // Formats: "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Missing authentication token'
    });
  }

  try {
    const decoded = verifyToken(token);
    // Bind decoded doctor payload (id, email) to request
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Invalid token authentication check:', err.message);
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Invalid or expired token'
    });
  }
};

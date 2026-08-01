import { verifyPatientToken } from '../utils/jwt.js';

export const authenticatePatientToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Missing patient authentication token'
    });
  }

  try {
    const decoded = verifyPatientToken(token);
    req.patient = decoded;
    req.user = decoded; // Bind to req.user as well for compatibility
    next();
  } catch (err) {
    console.error('Invalid patient token authentication check:', err.message);
    return res.status(403).json({
      success: false,
      message: 'Access Denied: Invalid or expired patient token'
    });
  }
};

export default authenticatePatientToken;

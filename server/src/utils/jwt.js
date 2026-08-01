import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET = process.env.JWT_SECRET || 'dev-jwt-cortex-secret-key-1234';
const PATIENT_SECRET = process.env.PATIENT_JWT_SECRET || 'dev-patient-jwt-cortex-secret-key-5678';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const generateToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
};

export const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};

export const generatePatientToken = (payload) => {
  return jwt.sign({ ...payload, role: 'patient' }, PATIENT_SECRET, { expiresIn: EXPIRES_IN });
};

export const verifyPatientToken = (token) => {
  const decoded = jwt.verify(token, PATIENT_SECRET);
  if (decoded.role !== 'patient') {
    throw new Error('Invalid token role for patient authentication');
  }
  return decoded;
};

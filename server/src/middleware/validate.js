import { body, validationResult } from 'express-validator';

// Standard validator runner utility
export const runValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

export const signupValidationRules = [
  body('email').isEmail().withMessage('Please provide a valid professional email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('firstName').notEmpty().withMessage('First Name is required'),
  body('lastName').notEmpty().withMessage('Last Name is required'),
  runValidation
];

export const loginValidationRules = [
  body('email').isEmail().withMessage('Please enter a valid email address'),
  body('password').notEmpty().withMessage('Password cannot be empty'),
  runValidation
];

export const appointmentValidationRules = [
  body('patientName').notEmpty().withMessage('Patient Name is required'),
  body('visitType').isIn(['Clinic', 'Video', 'Home']).withMessage('Invalid visit type'),
  body('date').isDate().withMessage('Appointment Date must be a valid YYYY-MM-DD date'),
  body('time').matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/).withMessage('Appointment Time must be in valid HH:MM or HH:MM:SS format'),
  runValidation
];

// Parameter validation middleware for PG UUID safety
export const validateUuidParam = (req, res, next) => {
  const { id } = req.params;
  if (id) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found. Invalid ID format.'
      });
    }
  }
  next();
};

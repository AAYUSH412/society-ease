import { body, validationResult } from 'express-validator';

// Validation middleware for bill generation
export const validateBillGeneration = [
  body('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  
  body('year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2050'),
  
  body('billType')
    .isIn(['maintenance', 'parking', 'amenities', 'security', 'other'])
    .withMessage('Invalid bill type'),
  
  body('baseAmount')
    .isFloat({ min: 0 })
    .withMessage('Base amount must be a positive number'),
  
  body('dueDate')
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  
  body('additionalCharges.lateFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Late fee must be a positive number'),
  
  body('additionalCharges.taxAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax amount must be a positive number'),
  
  body('additionalCharges.otherFees')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Other fees must be a positive number'),

  // Check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation middleware for payment verification
export const validatePaymentVerification = [
  body('razorpay_order_id')
    .notEmpty()
    .withMessage('Razorpay order ID is required'),
  
  body('razorpay_payment_id')
    .notEmpty()
    .withMessage('Razorpay payment ID is required'),
  
  body('razorpay_signature')
    .notEmpty()
    .withMessage('Razorpay signature is required'),
  
  body('billId')
    .isMongoId()
    .withMessage('Bill ID must be valid'),

  // Check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation middleware for bill updates
export const validateBillUpdate = [
  body('amount.baseAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base amount must be a positive number'),
  
  body('amount.lateFee')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Late fee must be a positive number'),
  
  body('amount.taxAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax amount must be a positive number'),
  
  body('amount.otherFees')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Other fees must be a positive number'),
  
  body('amount.discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount must be a positive number'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  
  body('status')
    .optional()
    .isIn(['pending', 'paid', 'overdue', 'cancelled'])
    .withMessage('Invalid status'),

  // Check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation middleware for payment reminders
export const validatePaymentReminders = [
  body('billIds')
    .isArray({ min: 1 })
    .withMessage('At least one bill ID is required'),
  
  body('billIds.*')
    .isMongoId()
    .withMessage('All bill IDs must be valid'),

  // Check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation middleware for manual payment recording
export const validateManualPayment = [
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  
  body('paymentMethod')
    .isIn(['bank_transfer', 'cash', 'cheque', 'other'])
    .withMessage('Invalid payment method'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('bankTransferDetails.transactionId')
    .if(body('paymentMethod').equals('bank_transfer'))
    .notEmpty()
    .withMessage('Transaction ID is required for bank transfers'),
  
  body('chequeDetails.chequeNumber')
    .if(body('paymentMethod').equals('cheque'))
    .notEmpty()
    .withMessage('Cheque number is required for cheque payments'),
  
  body('chequeDetails.bankName')
    .if(body('paymentMethod').equals('cheque'))
    .notEmpty()
    .withMessage('Bank name is required for cheque payments'),
  
  body('chequeDetails.chequeDate')
    .if(body('paymentMethod').equals('cheque'))
    .isISO8601()
    .withMessage('Valid cheque date is required'),

  // Check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation middleware for bulk bill generation
export const validateBulkBillGeneration = [
  body('societyName')
    .notEmpty()
    .withMessage('Society name is required'),
  
  body('billingPeriod.month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  
  body('billingPeriod.year')
    .isInt({ min: 2020, max: 2030 })
    .withMessage('Year must be between 2020 and 2030'),
  
  body('residents')
    .isArray({ min: 1 })
    .withMessage('At least one resident is required'),
  
  body('residents.*.residentId')
    .isMongoId()
    .withMessage('All resident IDs must be valid'),
  
  body('residents.*.flatNumber')
    .notEmpty()
    .withMessage('Flat number is required for all residents'),
  
  body('billTemplate.maintenanceCharges')
    .isFloat({ min: 0 })
    .withMessage('Maintenance charges must be a positive number'),

  // Check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation middleware for parking violation report
export const validateViolationReport = [
  body('violationType')
    .isIn([
      'unauthorized_parking',
      'blocking_fire_lane', 
      'visitor_parking_misuse',
      'parking_in_disabled_spot',
      'double_parking',
      'parking_outside_lines',
      'blocking_entrance',
      'overstaying_time_limit',
      'other'
    ])
    .withMessage('Invalid violation type'),

  body('description')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
    .trim(),

  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .trim(),

  body('violatedBy')
    .optional()
    .isMongoId()
    .withMessage('Invalid violator ID'),

  body('vehicleNumber')
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage('Vehicle number must be between 1 and 20 characters')
    .trim(),

  body('additionalNotes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Additional notes cannot exceed 500 characters')
    .trim(),

  // Check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation middleware for violation update
export const validateViolationUpdate = [
  body('description')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
    .trim(),

  body('location')
    .optional()
    .trim(),

  body('additionalNotes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Additional notes cannot exceed 500 characters')
    .trim(),

  // Check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation middleware for violation review by admin
export const validateViolationReview = [
  body('action')
    .isIn(['approve', 'reject'])
    .withMessage('Action must be either approve or reject'),

  body('reviewNotes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Review notes cannot exceed 500 characters')
    .trim(),

  body('severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity level'),

  // Check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation middleware for fine issuance
export const validateFineIssuance = [
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Fine amount must be a positive number'),

  body('dueDate')
    .isISO8601()
    .withMessage('Due date must be a valid date'),

  body('fineType')
    .optional()
    .isIn(['first_offense', 'repeat_offense', 'severe_violation', 'custom'])
    .withMessage('Invalid fine type'),

  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
    .trim(),

  body('paymentInstructions')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Payment instructions cannot exceed 1000 characters')
    .trim(),

  // Check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

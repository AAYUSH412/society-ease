import express from 'express';
import {
  // Admin Controllers
  generateBulkBills,
  getAllBills,
  updateBill,
  deleteBill,
  sendPaymentReminders,
  getBillingAnalytics,
  getAdminBillingAnalytics,
  recordManualPayment,
  getBillPayments,
  generateBillPdf,
  
  // Shared Controllers
  getBillDetails,
  
  // Resident Controllers
  getResidentBills,
  getBillingSummary,
  
  // Payment Controllers
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  getPaymentByBillId
} from '../controllers/billingController.js';

import { protect, restrictTo } from '../middleware/auth.js';
import { validateBillGeneration, validatePaymentVerification } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Admin Routes
router.post('/admin/generate-bulk', 
  restrictTo('admin'), 
  validateBillGeneration, 
  generateBulkBills
);

router.get('/admin/bills', 
  restrictTo('admin'), 
  getAllBills
);

router.put('/admin/bills/:billId', 
  restrictTo('admin'), 
  updateBill
);

router.delete('/admin/bills/:billId', 
  restrictTo('admin'), 
  deleteBill
);

router.post('/admin/send-reminders', 
  restrictTo('admin'), 
  sendPaymentReminders
);

router.get('/admin/analytics', 
  restrictTo('admin'), 
  getAdminBillingAnalytics
);

router.post('/admin/manual-payment/:billId', 
  restrictTo('admin'), 
  recordManualPayment
);

router.get('/admin/payments/:billId', 
  restrictTo('admin'), 
  getBillPayments
);

router.get('/admin/payments', 
  restrictTo('admin'), 
  getPaymentHistory
);

// Resident Routes
router.get('/resident/bills', 
  restrictTo('resident'), 
  getResidentBills
);

router.get('/resident/summary', 
  restrictTo('resident'), 
  getBillingSummary
);

router.get('/resident/payments', 
  restrictTo('resident'), 
  getPaymentHistory
);

// Shared Routes (Admin & Resident)
router.get('/bills/:billId', 
  restrictTo('admin', 'resident'), 
  getBillDetails
);

// Payment Routes
router.post('/payment/create-order', 
  restrictTo('resident'), 
  createPaymentOrder
);

router.post('/payment/verify', 
  restrictTo('resident'), 
  validatePaymentVerification, 
  verifyPayment
);

// Payment Details Routes
router.get('/bills/:billId/payment', 
  restrictTo('admin', 'resident'), 
  getPaymentByBillId
);

export default router;

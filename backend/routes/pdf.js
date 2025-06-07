import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  downloadPaymentReceipt,
  downloadBillPDF,
  generateAndStoreReceipt,
  emailPaymentReceipt
} from '../controllers/pdfController.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Download payment receipt PDF
router.get('/receipt/:paymentId/download', downloadPaymentReceipt);

// Download bill PDF
router.get('/bill/:billId/download', downloadBillPDF);

// Generate and store receipt in ImageKit (optional feature)
router.post('/receipt/:paymentId/store', generateAndStoreReceipt);

// Email payment receipt
router.post('/receipt/:paymentId/email', emailPaymentReceipt);

export default router;

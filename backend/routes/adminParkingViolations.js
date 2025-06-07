import express from 'express';
import { 
  getPendingViolations,
  reviewViolation,
  issueFine,
  getViolationAnalytics,
  getResidentViolationHistory,
  getAllViolations,
  getViolationDetails,
  bulkReviewViolations,
  exportViolationReport
} from '../controllers/parkingViolationController.js';
import { auth, adminAuth } from '../middleware/auth.js';
import { validateViolationReview, validateFineIssuance } from '../middleware/validation.js';

const router = express.Router();

// Admin Routes - All require admin authentication
router.get('/pending', auth, adminAuth, getPendingViolations);
router.get('/all', auth, adminAuth, getAllViolations);
router.get('/details/:id', auth, adminAuth, getViolationDetails);
router.put('/review/:id', auth, adminAuth, validateViolationReview, reviewViolation);
router.post('/issue-fine/:id', auth, adminAuth, validateFineIssuance, issueFine);
router.get('/analytics', auth, adminAuth, getViolationAnalytics);
router.get('/resident/:id/history', auth, adminAuth, getResidentViolationHistory);

// Bulk operations
router.put('/bulk-review', auth, adminAuth, bulkReviewViolations);

// Reports
router.get('/export', auth, adminAuth, exportViolationReport);

export default router;

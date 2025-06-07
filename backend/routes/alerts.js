import express from 'express';
import {
  createAlert,
  getAlerts,
  getAlert,
  updateAlert,
  addAlertUpdate,
  resolveAlert,
  escalateAlert,
  deleteAlert,
  getAlertStatistics,
  getActiveAlertsForResident
} from '../controllers/alertController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(protect);

// Public routes (for all authenticated users)
router.get('/', getAlerts); // Get alerts with filtering
router.get('/active', getActiveAlertsForResident); // Get active alerts for resident dashboard
router.get('/statistics', adminOnly, getAlertStatistics); // Admin only - get alert statistics
router.get('/:alertId', getAlert); // Get single alert details

// Alert management routes
router.post('/', createAlert); // Both admin and residents can create alerts
router.put('/:alertId', adminOnly, updateAlert); // Admin only - update alert
router.delete('/:alertId', adminOnly, deleteAlert); // Admin only - delete alert

// Alert interaction routes (available to both admin and residents with access)
router.post('/:alertId/updates', addAlertUpdate); // Add update to alert
router.post('/:alertId/escalate', escalateAlert); // Escalate alert
router.post('/:alertId/resolve', resolveAlert); // Admin or alert creator can resolve alert

export default router;

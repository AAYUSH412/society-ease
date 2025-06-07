import express from 'express';
import {
  getAllUsers,
  getPendingUsers,
  approveUser,
  rejectUser,
  suspendUser,
  reactivateUser,
  updateUserRole,
  getUserStats,
  createResident,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/adminController.js';
import { protect, adminOnly, superAdminOnly } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/pending', getPendingUsers);
router.get('/users/stats', getUserStats);
router.get('/users/:userId', getUserById);
router.post('/users/create', createResident);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

router.patch('/users/:userId/approve', approveUser);
router.patch('/users/:userId/reject', rejectUser);
router.patch('/users/:userId/suspend', suspendUser);
router.patch('/users/:userId/reactivate', reactivateUser);

// Super admin only routes
router.patch('/users/:userId/role', superAdminOnly, updateUserRole);

export default router;

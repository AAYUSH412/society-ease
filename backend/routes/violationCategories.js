import express from 'express';
import { 
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  searchCategories,
  toggleCategoryStatus,
  updateCategoryOrder  // Changed from updateCategoriesOrder to updateCategoryOrder
} from '../controllers/violationCategoryController.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes (for residents to view categories)
router.get('/', getCategories);
router.get('/search', searchCategories);
router.get('/:id', getCategoryById);

// Admin only routes
router.post('/', auth, adminAuth, createCategory);
router.put('/:id', auth, adminAuth, updateCategory);
router.delete('/:id', auth, adminAuth, deleteCategory);
router.put('/:id/toggle-status', auth, adminAuth, toggleCategoryStatus);
router.put('/bulk/update-order', auth, adminAuth, updateCategoryOrder); // Changed function name here too
router.get('/stats/overview', auth, adminAuth, getCategoryStats);

export default router;


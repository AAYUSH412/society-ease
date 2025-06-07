import ViolationCategory from '../models/ViolationCategory.js';
import ParkingViolation from '../models/ParkingViolation.js';
import mongoose from 'mongoose';

/**
 * Get all violation categories
 */
export const getCategories = async (req, res) => {
  try {
    const { includeInactive = false, sortBy = 'displayOrder' } = req.query;
    
    const filter = includeInactive === 'true' ? {} : { isActive: true };
    const sortOptions = {};
    
    if (sortBy === 'displayOrder') {
      sortOptions.displayOrder = 1;
      sortOptions.name = 1;
    } else if (sortBy === 'name') {
      sortOptions.name = 1;
    } else if (sortBy === 'severity') {
      sortOptions.severity = 1;
      sortOptions.name = 1;
    } else {
      sortOptions[sortBy] = 1;
    }

    const categories = await ViolationCategory.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort(sortOptions);

    res.json({
      success: true,
      data: categories.map(category => category.toSafeObject())
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch violation categories',
      error: error.message
    });
  }
};

/**
 * Get category by ID
 */
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const category = await ViolationCategory.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message
    });
  }
};

/**
 * Create new violation category (Admin only)
 */
export const createCategory = async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      baseFineAmount,
      escalationFine,
      maxFineAmount,
      severity,
      requiresPhotoEvidence,
      requiresWitnessStatement,
      autoApprovalEnabled,
      allowAppeals,
      reportingTimeLimit,
      resolutionTimeLimit,
      appealTimeLimit,
      notifyResident,
      notifyAdmin,
      escalationNotification,
      displayOrder
    } = req.body;

    const createdBy = req.user.id;

    // Validate required fields
    if (!name || !description || baseFineAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, and base fine amount are required'
      });
    }

    // Check for duplicate name or code
    const existingCategory = await ViolationCategory.findOne({
      $or: [
        { name: name.trim() },
        { code: code?.toUpperCase() }
      ]
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name or code already exists'
      });
    }

    const categoryData = {
      name: name.trim(),
      code: code?.toUpperCase(),
      description: description.trim(),
      baseFineAmount,
      escalationFine: escalationFine || 0,
      maxFineAmount,
      severity: severity || 'medium',
      requiresPhotoEvidence: requiresPhotoEvidence !== false,
      requiresWitnessStatement: requiresWitnessStatement === true,
      autoApprovalEnabled: autoApprovalEnabled === true,
      allowAppeals: allowAppeals !== false,
      reportingTimeLimit: reportingTimeLimit || 24,
      resolutionTimeLimit: resolutionTimeLimit || 72,
      appealTimeLimit: appealTimeLimit || 168,
      notifyResident: notifyResident !== false,
      notifyAdmin: notifyAdmin !== false,
      escalationNotification: escalationNotification !== false,
      displayOrder: displayOrder || 0,
      createdBy
    };

    const category = new ViolationCategory(categoryData);
    await category.save();

    await category.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Violation category created successfully',
      data: category.toSafeObject()
    });

  } catch (error) {
    console.error('Error creating category:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create violation category',
      error: error.message
    });
  }
};

/**
 * Update violation category (Admin only)
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBy = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const category = await ViolationCategory.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check for duplicate name or code (excluding current category)
    if (req.body.name || req.body.code) {
      const duplicateQuery = { _id: { $ne: id } };
      
      if (req.body.name) {
        duplicateQuery.name = req.body.name.trim();
      }
      
      if (req.body.code) {
        duplicateQuery.code = req.body.code.toUpperCase();
      }

      const existingCategory = await ViolationCategory.findOne(duplicateQuery);
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Another category with this name or code already exists'
        });
      }
    }

    // Update fields
    const updateFields = [
      'name', 'code', 'description', 'baseFineAmount', 'escalationFine', 'maxFineAmount',
      'severity', 'requiresPhotoEvidence', 'requiresWitnessStatement', 'autoApprovalEnabled',
      'allowAppeals', 'reportingTimeLimit', 'resolutionTimeLimit', 'appealTimeLimit',
      'notifyResident', 'notifyAdmin', 'escalationNotification', 'isActive', 'displayOrder'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'name' || field === 'description') {
          category[field] = req.body[field].trim();
        } else if (field === 'code') {
          category[field] = req.body[field].toUpperCase();
        } else {
          category[field] = req.body[field];
        }
      }
    });

    category.updatedBy = updatedBy;
    await category.save();

    await category.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'updatedBy', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: category.toSafeObject()
    });

  } catch (error) {
    console.error('Error updating category:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
};

/**
 * Delete violation category (Admin only)
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const category = await ViolationCategory.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category is being used in any violations
    const violationCount = await ParkingViolation.countDocuments({ categoryId: id });
    if (violationCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It is used in ${violationCount} violation(s). Consider deactivating it instead.`
      });
    }

    await ViolationCategory.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
};

/**
 * Get category statistics
 */
export const getCategoryStats = async (req, res) => {
  try {
    const stats = await ViolationCategory.getCategoryStats();
    
    // Get most used categories
    const mostUsedCategories = await ViolationCategory.getMostUsedCategories(5);
    
    // Get recent categories
    const recentCategories = await ViolationCategory.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name createdAt totalViolations')
      .populate('createdBy', 'name');

    res.json({
      success: true,
      data: {
        ...stats,
        mostUsedCategories: mostUsedCategories.map(cat => cat.toSafeObject()),
        recentCategories
      }
    });

  } catch (error) {
    console.error('Error fetching category stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category statistics',
      error: error.message
    });
  }
};

/**
 * Search categories
 */
export const searchCategories = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const categories = await ViolationCategory.searchCategories(q.trim());

    res.json({
      success: true,
      data: categories.map(category => category.toSafeObject())
    });

  } catch (error) {
    console.error('Error searching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search categories',
      error: error.message
    });
  }
};

/**
 * Toggle category status (activate/deactivate)
 */
export const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBy = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const category = await ViolationCategory.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    category.isActive = !category.isActive;
    category.updatedBy = updatedBy;
    await category.save();

    await category.populate('updatedBy', 'name email');

    res.json({
      success: true,
      message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
      data: category.toSafeObject()
    });

  } catch (error) {
    console.error('Error toggling category status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle category status',
      error: error.message
    });
  }
};

/**
 * Bulk update category display order
 */
export const updateCategoryOrder = async (req, res) => {
  try {
    const { categories } = req.body; // Array of { id, displayOrder }
    const updatedBy = req.user.id;

    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Categories array is required'
      });
    }

    // Validate all IDs
    const invalidIds = categories.filter(cat => !mongoose.Types.ObjectId.isValid(cat.id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category IDs found'
      });
    }

    // Update display order for each category
    const updatePromises = categories.map(({ id, displayOrder }) =>
      ViolationCategory.findByIdAndUpdate(
        id,
        { displayOrder, updatedBy },
        { new: true }
      )
    );

    const updatedCategories = await Promise.all(updatePromises);
    
    // Filter out null results (categories not found)
    const validCategories = updatedCategories.filter(cat => cat !== null);

    res.json({
      success: true,
      message: `Updated display order for ${validCategories.length} categories`,
      data: validCategories.map(cat => cat.toSafeObject())
    });

  } catch (error) {
    console.error('Error updating category order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category order',
      error: error.message
    });
  }
};

export default {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  searchCategories,
  toggleCategoryStatus,
  updateCategoryOrder
};

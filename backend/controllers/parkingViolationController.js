import ParkingViolation from '../models/ParkingViolation.js';
import ViolationFine from '../models/ViolationFine.js';
import ViolationCategory from '../models/ViolationCategory.js';
import { User } from '../models/index.js';
import { 
  uploadViolationPhoto, 
  deleteViolationImages, 
  validateViolationImage,
  validateViolationImages,
  getThumbnailUrl,
  getOptimizedImageUrl 
} from '../config/imagekit.js';
import mongoose from 'mongoose';

/**
 * Report a new parking violation
 */
export const reportViolation = async (req, res) => {
  try {
    const reporterId = req.user.id;
    const {
      violatorVehicleNumber,
      violatorFlatNumber,
      categoryId,
      location,
      description,
      incidentDateTime,
      witnessStatement,
      additionalNotes
    } = req.body;

    // Validate required fields
    if (!violatorVehicleNumber || !categoryId || !location || !incidentDateTime) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number, category, location, and incident date/time are required'
      });
    }

    // Validate category
    const category = await ViolationCategory.findById(categoryId);
    if (!category || !category.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or inactive violation category'
      });
    }

    // Check if incident is within reporting time limit
    const incidentDate = new Date(incidentDateTime);
    const timeRemaining = category.getTimeUntilReportingExpiry(incidentDate);
    
    if (timeRemaining === 0) {
      return res.status(400).json({
        success: false,
        message: `Reporting time limit of ${category.reportingTimeLimit} hours has expired for this incident`
      });
    }

    // Find violator if flat number is provided
    let violatorId = null;
    if (violatorFlatNumber) {
      const violator = await User.findOne({ flatNumber: violatorFlatNumber, role: 'resident' });
      if (violator) {
        violatorId = violator._id;
      }
    }

    // Create violation record
    const violationData = {
      reporterId,
      violatorId,
      violatorVehicleNumber: violatorVehicleNumber.toUpperCase(),
      violatorFlatNumber,
      categoryId,
      location,
      description,
      incidentDateTime: incidentDate,
      witnessStatement,
      additionalNotes,
      status: category.autoApprovalEnabled ? 'approved' : 'pending',
      reportedAt: new Date()
    };

    const violation = new ParkingViolation(violationData);
    await violation.save();

    // Handle photo uploads if provided
    if (req.files && req.files.length > 0) {
      const photoUploadPromises = req.files.map(async (file, index) => {
        const validation = validateViolationImage(file);
        if (!validation.isValid) {
          throw new Error(`Photo ${index + 1}: ${validation.errors.join(', ')}`);
        }

        const upload = await uploadViolationPhoto(
          file.buffer,
          violation._id.toString(),
          index,
          {
            originalName: file.originalname,
            uploadedBy: reporterId
          }
        );

        if (!upload.success) {
          throw new Error(`Failed to upload photo ${index + 1}: ${upload.error}`);
        }

        return {
          imageUrl: upload.url,
          imageId: upload.fileId,
          thumbnailUrl: upload.thumbnailUrl || getThumbnailUrl(upload.url),
          uploadedAt: new Date()
        };
      });

      try {
        const uploadedPhotos = await Promise.all(photoUploadPromises);
        violation.photoEvidence = uploadedPhotos;
        await violation.save();
      } catch (uploadError) {
        // If photo upload fails, delete the violation record
        await ParkingViolation.findByIdAndDelete(violation._id);
        return res.status(400).json({
          success: false,
          message: uploadError.message
        });
      }
    }

    // Check if photo evidence is required
    if (category.requiresPhotoEvidence && (!violation.photoEvidence || violation.photoEvidence.length === 0)) {
      await ParkingViolation.findByIdAndDelete(violation._id);
      return res.status(400).json({
        success: false,
        message: 'Photo evidence is required for this type of violation'
      });
    }

    // Update category usage stats
    await category.updateUsageStats();

    // Populate the response
    await violation.populate([
      { path: 'reporterId', select: 'name flatNumber email' },
      { path: 'violatorId', select: 'name flatNumber email' },
      { path: 'categoryId', select: 'name code description baseFineAmount severity' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Parking violation reported successfully',
      data: violation.toSafeObject()
    });

  } catch (error) {
    console.error('Error reporting violation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report violation',
      error: error.message
    });
  }
};

/**
 * Get all violations with filtering and pagination
 */
export const getViolations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      reporterId,
      violatorId,
      vehicleNumber,
      flatNumber,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter query
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (category) {
      filter.categoryId = category;
    }
    
    if (reporterId) {
      filter.reporterId = reporterId;
    }
    
    if (violatorId) {
      filter.violatorId = violatorId;
    }
    
    if (vehicleNumber) {
      filter.violatorVehicleNumber = new RegExp(vehicleNumber, 'i');
    }
    
    if (flatNumber) {
      filter.violatorFlatNumber = flatNumber;
    }
    
    if (startDate || endDate) {
      filter.incidentDateTime = {};
      if (startDate) {
        filter.incidentDateTime.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.incidentDateTime.$lte = new Date(endDate);
      }
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [violations, totalCount] = await Promise.all([
      ParkingViolation.find(filter)
        .populate('reporterId', 'name flatNumber email')
        .populate('violatorId', 'name flatNumber email')
        .populate('categoryId', 'name code description baseFineAmount severity')
        .populate('reviewedBy', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      ParkingViolation.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      data: {
        violations: violations.map(v => v.toSafeObject()),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching violations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch violations',
      error: error.message
    });
  }
};

/**
 * Get violation by ID
 */
export const getViolationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid violation ID'
      });
    }

    const violation = await ParkingViolation.findById(id)
      .populate('reporterId', 'name flatNumber email phone')
      .populate('violatorId', 'name flatNumber email phone')
      .populate('categoryId')
      .populate('reviewedBy', 'name email')
      .populate('fineId');

    if (!violation) {
      return res.status(404).json({
        success: false,
        message: 'Violation not found'
      });
    }

    res.json({
      success: true,
      data: violation.toSafeObject()
    });

  } catch (error) {
    console.error('Error fetching violation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch violation',
      error: error.message
    });
  }
};

/**
 * Review violation (Admin only)
 */
export const reviewViolation = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes, fineAmount } = req.body;
    const reviewerId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid violation ID'
      });
    }

    const violation = await ParkingViolation.findById(id).populate('categoryId');
    if (!violation) {
      return res.status(404).json({
        success: false,
        message: 'Violation not found'
      });
    }

    if (violation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending violations can be reviewed'
      });
    }

    // Update violation status
    violation.status = status;
    violation.reviewedBy = reviewerId;
    violation.reviewedAt = new Date();
    violation.reviewNotes = reviewNotes;

    // If approved, create fine record
    if (status === 'approved') {
      const finalFineAmount = fineAmount || violation.categoryId.baseFineAmount;
      
      const fine = new ViolationFine({
        violationId: violation._id,
        amount: finalFineAmount,
        status: 'pending',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        createdBy: reviewerId
      });

      await fine.save();
      violation.fineId = fine._id;
      
      // Update category stats
      await violation.categoryId.updateUsageStats(finalFineAmount);
    }

    await violation.save();

    // Populate the response
    await violation.populate([
      { path: 'reporterId', select: 'name flatNumber email' },
      { path: 'violatorId', select: 'name flatNumber email' },
      { path: 'categoryId', select: 'name code description baseFineAmount severity' },
      { path: 'reviewedBy', select: 'name email' },
      { path: 'fineId' }
    ]);

    res.json({
      success: true,
      message: `Violation ${status} successfully`,
      data: violation.toSafeObject()
    });

  } catch (error) {
    console.error('Error reviewing violation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review violation',
      error: error.message
    });
  }
};

/**
 * Submit appeal for violation
 */
export const submitAppeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { appealReason, appealDescription } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid violation ID'
      });
    }

    const violation = await ParkingViolation.findById(id).populate('categoryId');
    if (!violation) {
      return res.status(404).json({
        success: false,
        message: 'Violation not found'
      });
    }

    // Check if user is authorized to appeal
    if (violation.reporterId.toString() !== userId && violation.violatorId?.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to appeal this violation'
      });
    }

    // Check if appeals are allowed for this category
    if (!violation.categoryId.allowAppeals) {
      return res.status(400).json({
        success: false,
        message: 'Appeals are not allowed for this type of violation'
      });
    }

    // Check if violation can be appealed
    if (!['approved', 'rejected'].includes(violation.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only approved or rejected violations can be appealed'
      });
    }

    // Check if appeal is within time limit
    const reviewDate = violation.reviewedAt || violation.createdAt;
    const appealDeadline = new Date(reviewDate);
    appealDeadline.setHours(appealDeadline.getHours() + violation.categoryId.appealTimeLimit);
    
    if (new Date() > appealDeadline) {
      return res.status(400).json({
        success: false,
        message: `Appeal time limit of ${violation.categoryId.appealTimeLimit} hours has expired`
      });
    }

    // Check if already appealed
    if (violation.appealStatus && violation.appealStatus !== 'none') {
      return res.status(400).json({
        success: false,
        message: 'This violation has already been appealed'
      });
    }

    // Submit appeal
    violation.appealStatus = 'submitted';
    violation.appealReason = appealReason;
    violation.appealDescription = appealDescription;
    violation.appealSubmittedAt = new Date();
    violation.appealSubmittedBy = userId;

    await violation.save();

    res.json({
      success: true,
      message: 'Appeal submitted successfully',
      data: violation.toSafeObject()
    });

  } catch (error) {
    console.error('Error submitting appeal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit appeal',
      error: error.message
    });
  }
};

/**
 * Review appeal (Admin only)
 */
export const reviewAppeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { appealStatus, appealResponse } = req.body;
    const reviewerId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid violation ID'
      });
    }

    const violation = await ParkingViolation.findById(id).populate('fineId');
    if (!violation) {
      return res.status(404).json({
        success: false,
        message: 'Violation not found'
      });
    }

    if (violation.appealStatus !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'No pending appeal found for this violation'
      });
    }

    // Update appeal status
    violation.appealStatus = appealStatus;
    violation.appealResponse = appealResponse;
    violation.appealReviewedAt = new Date();
    violation.appealReviewedBy = reviewerId;

    // If appeal is approved, update violation and fine status
    if (appealStatus === 'approved') {
      violation.status = 'dismissed';
      
      // Cancel associated fine if exists
      if (violation.fineId) {
        const fine = await ViolationFine.findById(violation.fineId);
        if (fine && fine.status === 'pending') {
          fine.status = 'cancelled';
          fine.cancellationReason = 'Appeal approved';
          fine.cancelledAt = new Date();
          fine.cancelledBy = reviewerId;
          await fine.save();
        }
      }
    }

    await violation.save();

    res.json({
      success: true,
      message: `Appeal ${appealStatus} successfully`,
      data: violation.toSafeObject()
    });

  } catch (error) {
    console.error('Error reviewing appeal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review appeal',
      error: error.message
    });
  }
};

/**
 * Delete violation (Admin only)
 */
export const deleteViolation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid violation ID'
      });
    }

    const violation = await ParkingViolation.findById(id);
    if (!violation) {
      return res.status(404).json({
        success: false,
        message: 'Violation not found'
      });
    }

    // Delete associated fine if exists
    if (violation.fineId) {
      await ViolationFine.findByIdAndDelete(violation.fineId);
    }

    // Delete associated images
    if (violation.photoEvidence && violation.photoEvidence.length > 0) {
      await deleteViolationImages(violation._id.toString());
    }

    // Delete violation
    await ParkingViolation.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Violation deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting violation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete violation',
      error: error.message
    });
  }
};

/**
 * Get violation statistics
 */
export const getViolationStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'week':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        };
        break;
      case 'month':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), 1)
          }
        };
        break;
      case 'year':
        dateFilter = {
          createdAt: {
            $gte: new Date(now.getFullYear(), 0, 1)
          }
        };
        break;
    }

    const [statusStats, categoryStats, monthlyTrends, topViolators] = await Promise.all([
      // Status distribution
      ParkingViolation.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      
      // Category distribution
      ParkingViolation.aggregate([
        { $match: dateFilter },
        {
          $lookup: {
            from: 'violationcategories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'category'
          }
        },
        { $unwind: '$category' },
        { $group: { _id: '$category.name', count: { $sum: 1 } } }
      ]),
      
      // Monthly trends
      ParkingViolation.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1)
            }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      
      // Top violators
      ParkingViolation.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$violatorVehicleNumber', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    const totalViolations = await ParkingViolation.countDocuments(dateFilter);
    const totalFines = await ViolationFine.aggregate([
      {
        $lookup: {
          from: 'parkingviolations',
          localField: 'violationId',
          foreignField: '_id',
          as: 'violation'
        }
      },
      { $unwind: '$violation' },
      { $match: { 'violation.createdAt': dateFilter.createdAt } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalViolations,
          totalFineAmount: totalFines[0]?.total || 0,
          period
        },
        statusDistribution: statusStats,
        categoryDistribution: categoryStats,
        monthlyTrends,
        topViolators
      }
    });

  } catch (error) {
    console.error('Error fetching violation stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch violation statistics',
      error: error.message
    });
  }
};

/**
 * Get user's violations (for residents)
 */
export const getMyViolations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, type = 'all' } = req.query;

    let filter = {};
    
    switch (type) {
      case 'reported':
        filter.reporterId = userId;
        break;
      case 'received':
        filter.violatorId = userId;
        break;
      case 'all':
      default:
        filter = {
          $or: [
            { reporterId: userId },
            { violatorId: userId }
          ]
        };
        break;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [violations, totalCount] = await Promise.all([
      ParkingViolation.find(filter)
        .populate('reporterId', 'name flatNumber')
        .populate('violatorId', 'name flatNumber')
        .populate('categoryId', 'name code description baseFineAmount severity')
        .populate('fineId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      ParkingViolation.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      data: {
        violations: violations.map(v => v.toSafeObject()),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user violations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your violations',
      error: error.message
    });
  }
};

/**
 * Get my submitted violation reports (for residents)
 */
export const getMyReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filter = { reportedBy: userId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [violations, totalCount] = await Promise.all([
      ParkingViolation.find(filter)
        .populate('violatedBy', 'firstName lastName flatNumber building')
        .populate('categoryId', 'name severity defaultFineAmount')
        .populate('reviewedBy', 'firstName lastName')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      ParkingViolation.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        violations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          hasNext: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching my reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your violation reports',
      error: error.message
    });
  }
};

/**
 * Get violations reported against me (for residents)
 */
export const getViolationsAgainstMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filter = { violatedBy: userId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [violations, totalCount] = await Promise.all([
      ParkingViolation.find(filter)
        .populate('reportedBy', 'firstName lastName flatNumber building')
        .populate('categoryId', 'name severity defaultFineAmount')
        .populate('reviewedBy', 'firstName lastName')
        .populate('fineId')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      ParkingViolation.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        violations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          hasNext: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching violations against me:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch violations against you',
      error: error.message
    });
  }
};

/**
 * Update violation report (for pending reports)
 */
export const updateViolationReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { description, location, additionalNotes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid violation ID'
      });
    }

    const violation = await ParkingViolation.findById(id);
    if (!violation) {
      return res.status(404).json({
        success: false,
        message: 'Violation not found'
      });
    }

    // Check if user is the reporter
    if (violation.reportedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own violation reports'
      });
    }

    // Check if violation is still pending
    if (violation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending violations can be updated'
      });
    }

    // Update allowed fields
    if (description) violation.description = description;
    if (location) violation.location = location;
    if (additionalNotes) violation.additionalNotes = additionalNotes;
    violation.updatedAt = new Date();

    await violation.save();

    await violation.populate([
      { path: 'reportedBy', select: 'firstName lastName flatNumber building' },
      { path: 'violatedBy', select: 'firstName lastName flatNumber building' },
      { path: 'categoryId', select: 'name severity defaultFineAmount' }
    ]);

    res.json({
      success: true,
      message: 'Violation report updated successfully',
      data: violation
    });

  } catch (error) {
    console.error('Error updating violation report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update violation report',
      error: error.message
    });
  }
};

/**
 * Upload additional photos to existing violation
 */
export const uploadViolationPhotos = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid violation ID'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No photos provided'
      });
    }

    const violation = await ParkingViolation.findById(id);
    if (!violation) {
      return res.status(404).json({
        success: false,
        message: 'Violation not found'
      });
    }

    // Check if user is the reporter
    if (violation.reportedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only upload photos to your own violation reports'
      });
    }

    // Check if violation is still pending
    if (violation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Photos can only be added to pending violations'
      });
    }

    // Validate that total photos won't exceed limit
    const currentPhotoCount = violation.photoEvidence ? violation.photoEvidence.length : 0;
    const newPhotoCount = req.files.length;
    
    if (currentPhotoCount + newPhotoCount > 5) {
      return res.status(400).json({
        success: false,
        message: `Maximum 5 photos allowed per violation. Current: ${currentPhotoCount}, Attempting to add: ${newPhotoCount}`
      });
    }

    // Upload new photos
    const photoUploadPromises = req.files.map(async (file, index) => {
      const validation = validateViolationImage(file);
      if (!validation.isValid) {
        throw new Error(`Photo ${index + 1}: ${validation.errors.join(', ')}`);
      }

      const upload = await uploadViolationPhoto(
        file.buffer,
        violation.violationId,
        file.originalname,
        {
          uploadedBy: userId,
          violationType: violation.violationType,
          location: violation.location?.area || 'unknown'
        }
      );

      if (!upload.success) {
        throw new Error(`Failed to upload photo ${index + 1}: ${upload.error}`);
      }

      return {
        imageUrl: upload.url,
        imageId: upload.fileId,
        thumbnailUrl: upload.thumbnailUrl || getThumbnailUrl(upload.url),
        uploadedAt: new Date()
      };
    });

    const uploadedPhotos = await Promise.all(photoUploadPromises);
    
    // Add new photos to existing ones
    violation.photoEvidence = [...(violation.photoEvidence || []), ...uploadedPhotos];
    await violation.save();

    res.json({
      success: true,
      message: 'Photos uploaded successfully',
      data: {
        uploadedCount: uploadedPhotos.length,
        totalPhotos: violation.photoEvidence.length,
        newPhotos: uploadedPhotos
      }
    });

  } catch (error) {
    console.error('Error uploading violation photos:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload photos',
      error: error.message
    });
  }
};

/**
 * Delete a specific photo from violation
 */
export const deleteViolationPhoto = async (req, res) => {
  try {
    const { violationId, photoId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(violationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid violation ID'
      });
    }

    const violation = await ParkingViolation.findById(violationId);
    if (!violation) {
      return res.status(404).json({
        success: false,
        message: 'Violation not found'
      });
    }

    // Check if user is the reporter
    if (violation.reportedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete photos from your own violation reports'
      });
    }

    // Check if violation is still pending
    if (violation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Photos can only be deleted from pending violations'
      });
    }

    // Find and remove the photo
    const photoIndex = violation.photoEvidence.findIndex(photo => photo.imageId === photoId);
    if (photoIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    const photoToDelete = violation.photoEvidence[photoIndex];
    
    // Delete from ImageKit
    const deleteResult = await deleteViolationImages([photoId]);
    if (!deleteResult.success) {
      console.warn('Failed to delete photo from ImageKit:', deleteResult.error);
    }

    // Remove from database
    violation.photoEvidence.splice(photoIndex, 1);
    await violation.save();

    res.json({
      success: true,
      message: 'Photo deleted successfully',
      data: {
        deletedPhotoId: photoId,
        remainingPhotos: violation.photoEvidence.length
      }
    });

  } catch (error) {
    console.error('Error deleting violation photo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete photo',
      error: error.message
    });
  }
};

/**
 * Get pending violations for admin review
 */
export const getPendingViolations = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      violationType, 
      severity, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      startDate,
      endDate 
    } = req.query;

    const filter = { status: 'pending' };
    
    if (violationType && violationType !== 'all') {
      filter.violationType = violationType;
    }
    
    if (severity && severity !== 'all') {
      filter.severity = severity;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [violations, totalCount] = await Promise.all([
      ParkingViolation.find(filter)
        .populate('reportedBy', 'firstName lastName flatNumber building email phone')
        .populate('violatedBy', 'firstName lastName flatNumber building email phone')
        .populate('categoryId', 'name severity defaultFineAmount')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      ParkingViolation.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        violations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          hasNext: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching pending violations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending violations',
      error: error.message
    });
  }
};

/**
 * Get all violations for admin
 */
export const getAllViolations = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      violationType, 
      severity, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      startDate,
      endDate,
      search
    } = req.query;

    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (violationType && violationType !== 'all') {
      filter.violationType = violationType;
    }
    
    if (severity && severity !== 'all') {
      filter.severity = severity;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { violationId: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { 'location.specificLocation': new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [violations, totalCount] = await Promise.all([
      ParkingViolation.find(filter)
        .populate('reportedBy', 'firstName lastName flatNumber building email phone')
        .populate('violatedBy', 'firstName lastName flatNumber building email phone')
        .populate('categoryId', 'name severity defaultFineAmount')
        .populate('reviewedBy', 'firstName lastName')
        .populate('fineId')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      ParkingViolation.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        violations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          hasNext: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching all violations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch violations',
      error: error.message
    });
  }
};

/**
 * Get violation details by ID for admin
 */
export const getViolationDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid violation ID'
      });
    }

    const violation = await ParkingViolation.findById(id)
      .populate('reportedBy', 'firstName lastName flatNumber building email phone')
      .populate('violatedBy', 'firstName lastName flatNumber building email phone')
      .populate('categoryId')
      .populate('reviewedBy', 'firstName lastName email')
      .populate('fineId');

    if (!violation) {
      return res.status(404).json({
        success: false,
        message: 'Violation not found'
      });
    }

    res.json({
      success: true,
      data: violation
    });

  } catch (error) {
    console.error('Error fetching violation details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch violation details',
      error: error.message
    });
  }
};

/**
 * Issue fine for approved violation
 */
export const issueFine = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    const { 
      amount, 
      dueDate, 
      fineType = 'first_offense',
      notes,
      paymentInstructions 
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid violation ID'
      });
    }

    const violation = await ParkingViolation.findById(id)
      .populate('violatedBy')
      .populate('categoryId');

    if (!violation) {
      return res.status(404).json({
        success: false,
        message: 'Violation not found'
      });
    }

    if (violation.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Only approved violations can have fines issued'
      });
    }

    if (violation.fineId) {
      return res.status(400).json({
        success: false,
        message: 'Fine already issued for this violation'
      });
    }

    if (!violation.violatedBy) {
      return res.status(400).json({
        success: false,
        message: 'Cannot issue fine - violator not identified'
      });
    }

    // Create fine record
    const fine = new ViolationFine({
      violationId: violation._id,
      violatorId: violation.violatedBy._id,
      violatorDetails: {
        name: `${violation.violatedBy.firstName} ${violation.violatedBy.lastName}`,
        flatNumber: violation.violatedBy.flatNumber,
        building: violation.violatedBy.building,
        email: violation.violatedBy.email,
        phone: violation.violatedBy.phone
      },
      amount: amount || violation.categoryId.defaultFineAmount,
      violationType: violation.violationType,
      fineType,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
      issuedBy: adminId,
      notes,
      paymentInstructions,
      societyName: violation.societyName
    });

    await fine.save();

    // Update violation with fine reference
    violation.fineId = fine._id;
    violation.status = 'fine_issued';
    await violation.save();

    await fine.populate([
      { path: 'violationId', select: 'violationId violationType location' },
      { path: 'violatorId', select: 'firstName lastName flatNumber building email' },
      { path: 'issuedBy', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      message: 'Fine issued successfully',
      data: fine
    });

  } catch (error) {
    console.error('Error issuing fine:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to issue fine',
      error: error.message
    });
  }
};

/**
 * Get violation analytics for admin dashboard
 */
export const getViolationAnalytics = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;

    // Calculate date range
    let dateFilter = {};
    const now = new Date();
    
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      switch (period) {
        case 'week':
          dateFilter = {
            createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
          };
          break;
        case 'month':
          dateFilter = {
            createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) }
          };
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          dateFilter = {
            createdAt: { $gte: new Date(now.getFullYear(), quarter * 3, 1) }
          };
          break;
        case 'year':
          dateFilter = {
            createdAt: { $gte: new Date(now.getFullYear(), 0, 1) }
          };
          break;
      }
    }

    // Aggregate violation statistics
    const [
      totalViolations,
      violationsByStatus,
      violationsByType,
      violationsBySeverity,
      recentTrends,
      topViolators,
      fineCollection
    ] = await Promise.all([
      // Total violations
      ParkingViolation.countDocuments(dateFilter),
      
      // Violations by status
      ParkingViolation.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      
      // Violations by type
      ParkingViolation.aggregate([
        { $match: dateFilter },
        { $group: { _id: '$violationType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      // Violations by severity
      ParkingViolation.aggregate([
        { $match: dateFilter },
        { $lookup: { from: 'violationcategories', localField: 'categoryId', foreignField: '_id', as: 'category' } },
        { $unwind: '$category' },
        { $group: { _id: '$category.severity', count: { $sum: 1 } } }
      ]),
      
      // Recent trends (daily counts for the period)
      ParkingViolation.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),
      
      // Top violators
      ParkingViolation.aggregate([
        { $match: { ...dateFilter, violatedBy: { $exists: true } } },
        { $group: { _id: '$violatedBy', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'violator' } },
        { $unwind: '$violator' },
        {
          $project: {
            count: 1,
            name: { $concat: ['$violator.firstName', ' ', '$violator.lastName'] },
            flatNumber: '$violator.flatNumber',
            building: '$violator.building'
          }
        }
      ]),
      
      // Fine collection statistics
      ViolationFine.aggregate([
        { $match: { ...dateFilter.createdAt ? { issuedDate: dateFilter.createdAt } : {} } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ])
    ]);

    // Calculate collection rate
    const totalFines = fineCollection.reduce((sum, item) => sum + item.count, 0);
    const paidFines = fineCollection.find(item => item._id === 'paid')?.count || 0;
    const collectionRate = totalFines > 0 ? Math.round((paidFines / totalFines) * 100) : 0;

    // Calculate total revenue
    const totalRevenue = fineCollection.reduce((sum, item) => sum + item.totalAmount, 0);
    const collectedRevenue = fineCollection.find(item => item._id === 'paid')?.totalAmount || 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalViolations,
          totalFines,
          collectionRate,
          totalRevenue,
          collectedRevenue
        },
        charts: {
          violationsByStatus,
          violationsByType,
          violationsBySeverity,
          recentTrends,
          fineCollection
        },
        topViolators
      }
    });

  } catch (error) {
    console.error('Error fetching violation analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch violation analytics',
      error: error.message
    });
  }
};

/**
 * Get resident violation history for admin
 */
export const getResidentViolationHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resident ID'
      });
    }

    // Verify resident exists
    const resident = await User.findById(id).select('firstName lastName flatNumber building email');
    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'Resident not found'
      });
    }

    const filter = { violatedBy: id };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [violations, totalCount] = await Promise.all([
      ParkingViolation.find(filter)
        .populate('reportedBy', 'firstName lastName flatNumber building')
        .populate('categoryId', 'name severity defaultFineAmount')
        .populate('reviewedBy', 'firstName lastName')
        .populate('fineId')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      ParkingViolation.countDocuments(filter)
    ]);

    // Calculate statistics
    const stats = await ParkingViolation.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const fineStats = await ViolationFine.aggregate([
      { $match: { violatorId: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        resident: {
          id: resident._id,
          name: `${resident.firstName} ${resident.lastName}`,
          flatNumber: resident.flatNumber,
          building: resident.building,
          email: resident.email
        },
        violations,
        statistics: {
          violationStats: stats,
          fineStats
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          hasNext: parseInt(page) < Math.ceil(totalCount / parseInt(limit)),
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching resident violation history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resident violation history',
      error: error.message
    });
  }
};

/**
 * Bulk review violations (approve/reject multiple)
 */
export const bulkReviewViolations = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { violationIds, action, reviewNotes } = req.body;

    if (!violationIds || !Array.isArray(violationIds) || violationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Violation IDs are required'
      });
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either "approve" or "reject"'
      });
    }

    // Validate all IDs
    const invalidIds = violationIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid violation IDs: ${invalidIds.join(', ')}`
      });
    }

    // Find all violations and check they're pending
    const violations = await ParkingViolation.find({
      _id: { $in: violationIds },
      status: 'pending'
    });

    if (violations.length !== violationIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some violations are not found or not in pending status'
      });
    }

    // Update all violations
    const updateData = {
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewedBy: adminId,
      reviewedAt: new Date(),
      reviewNotes: reviewNotes || `Bulk ${action}ed by admin`
    };

    await ParkingViolation.updateMany(
      { _id: { $in: violationIds } },
      updateData
    );

    res.json({
      success: true,
      message: `Successfully ${action}ed ${violations.length} violations`,
      data: {
        processedCount: violations.length,
        action: action
      }
    });

  } catch (error) {
    console.error('Error in bulk review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk review violations',
      error: error.message
    });
  }
};

/**
 * Export violation report
 */
export const exportViolationReport = async (req, res) => {
  try {
    const { 
      format = 'json', 
      startDate, 
      endDate, 
      status, 
      violationType 
    } = req.query;

    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (violationType && violationType !== 'all') {
      filter.violationType = violationType;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const violations = await ParkingViolation.find(filter)
      .populate('reportedBy', 'firstName lastName flatNumber building email phone')
      .populate('violatedBy', 'firstName lastName flatNumber building email phone')
      .populate('categoryId', 'name severity defaultFineAmount')
      .populate('reviewedBy', 'firstName lastName')
      .populate('fineId')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = violations.map(v => ({
        ViolationID: v.violationId,
        ReportedBy: v.reportedBy ? `${v.reportedBy.firstName} ${v.reportedBy.lastName}` : 'N/A',
        ViolatedBy: v.violatedBy ? `${v.violatedBy.firstName} ${v.violatedBy.lastName}` : 'N/A',
        ViolationType: v.violationType,
        Status: v.status,
        Description: v.description,
        Location: v.location?.specificLocation || 'N/A',
        ReportedDate: v.createdAt?.toISOString().split('T')[0],
        ReviewedBy: v.reviewedBy ? `${v.reviewedBy.firstName} ${v.reviewedBy.lastName}` : 'N/A',
        FineAmount: v.fineId?.amount || 'N/A'
      }));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=violations-${Date.now()}.csv`);
      
      // Simple CSV conversion
      const csvHeaders = Object.keys(csvData[0] || {}).join(',');
      const csvRows = csvData.map(row => Object.values(row).join(','));
      const csvContent = [csvHeaders, ...csvRows].join('\n');
      
      return res.send(csvContent);
    }

    // Default JSON format
    res.json({
      success: true,
      data: {
        violations,
        exportInfo: {
          totalRecords: violations.length,
          exportedAt: new Date().toISOString(),
          filters: filter
        }
      }
    });

  } catch (error) {
    console.error('Error exporting violation report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export violation report',
      error: error.message
    });
  }
};

export default {
  reportViolation,
  getViolations,
  getViolationById,
  reviewViolation,
  submitAppeal,
  reviewAppeal,
  deleteViolation,
  getViolationStats,
  getMyViolations,
  getMyReports,
  getViolationsAgainstMe,
  updateViolationReport,
  uploadViolationPhotos,
  deleteViolationPhoto,
  getPendingViolations,
  getAllViolations,
  getViolationDetails,
  issueFine,
  getViolationAnalytics,
  getResidentViolationHistory,
  bulkReviewViolations,
  exportViolationReport
};

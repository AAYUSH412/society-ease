import User from '../models/User.js';
import { sendEmail } from '../config/nodemailer.js';
import { 
  welcomeEmailTemplate, 
  accountApprovalTemplate, 
  accountRejectionTemplate 
} from '../utils/emailTemplates.js';
import validator from 'validator';

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      role,
      search,
      societyName,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    if (status) {
      query.status = status;
    }

    if (role) {
      query.role = role;
    }

    if (societyName) {
      query.societyName = { $regex: societyName, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { flatNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get users with pagination
    const users = await User.find(query)
      .select('-password -emailVerificationToken -phoneVerificationToken -passwordResetToken')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email');

    // Get total count
    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalUsers: total,
          hasNext: skip + parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get pending users (Admin only)
export const getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' })
      .select('-password -emailVerificationToken -phoneVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        users: pendingUsers,
        count: pendingUsers.length
      }
    });

  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Approve user (Admin only)
export const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'User is not in pending status'
      });
    }

    // Update user status
    user.status = 'approved';
    user.approvedBy = req.user._id;
    user.approvedAt = new Date();
    await user.save();

    // Send approval email
    try {
      const emailTemplate = accountApprovalTemplate(
        user.fullName,
        user.societyName,
        message
      );
      
      await sendEmail({
        to: user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      });
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'User approved successfully',
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          status: user.status,
          approvedAt: user.approvedAt
        }
      }
    });

  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Reject user (Admin only)
export const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'User is not in pending status'
      });
    }

    // Update user status
    user.status = 'rejected';
    await user.save();

    // Send rejection email
    try {
      const emailTemplate = accountRejectionTemplate(
        user.fullName,
        reason
      );
      
      await sendEmail({
        to: user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      });
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'User rejected successfully',
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          status: user.status
        }
      }
    });

  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Suspend user (Admin only)
export const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot suspend super admin'
      });
    }

    if (user.status === 'suspended') {
      return res.status(400).json({
        success: false,
        message: 'User is already suspended'
      });
    }

    // Update user status
    user.status = 'suspended';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User suspended successfully',
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          status: user.status
        }
      }
    });

  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Reactivate user (Admin only)
export const reactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.status !== 'suspended') {
      return res.status(400).json({
        success: false,
        message: 'User is not suspended'
      });
    }

    // Update user status
    user.status = 'approved';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User reactivated successfully',
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          status: user.status
        }
      }
    });

  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update user role (Super Admin only)
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['resident', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Allowed roles: resident, admin'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot change super admin role'
      });
    }

    // Update user role
    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user statistics (Admin only)
export const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const roleStats = await User.aggregate([
      {
        $match: { status: 'approved' }
      },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const societyStats = await User.aggregate([
      {
        $match: { status: 'approved' }
      },
      {
        $group: {
          _id: '$societyName',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        statusStats: stats,
        roleStats,
        societyStats,
        recentRegistrations,
        totalUsers: await User.countDocuments()
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create new resident (Admin only)
export const createResident = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      flatNumber,
      building,
      societyName,
      address
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !phone || !password || !flatNumber || !societyName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Validate phone format
    if (!validator.isMobilePhone(phone, 'en-IN')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid phone number'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { phone: phone }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone number'
      });
    }

    // Check if flat is already taken
    const isFlatTaken = await User.isFlatTaken(flatNumber, societyName);
    if (isFlatTaken) {
      return res.status(400).json({
        success: false,
        message: 'This flat is already registered in the society'
      });
    }

    // Create user with auto-approval
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      password,
      flatNumber,
      building,
      societyName,
      address,
      status: 'approved',
      isEmailVerified: true,
      createdBy: req.user._id,
      approvedBy: req.user._id,
      approvedAt: new Date()
    });

    // Send response (don't include sensitive data)
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      flatNumber: user.flatNumber,
      building: user.building,
      societyName: user.societyName,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Resident created successfully',
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Create resident error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    // Handle mongoose duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone number'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user by ID (Admin only)
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password -emailVerificationToken -phoneVerificationToken -passwordResetToken')
      .populate('createdBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update user (Admin only)
export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      flatNumber,
      building,
      societyName,
      address
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: userId } 
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Check if phone is being changed and if it already exists
    if (phone && phone !== user.phone) {
      const existingUser = await User.findOne({ 
        phone: phone, 
        _id: { $ne: userId } 
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already exists'
        });
      }
    }

    // Update user fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email.toLowerCase();
    if (phone) user.phone = phone;
    if (flatNumber) user.flatNumber = flatNumber;
    if (building) user.building = building;
    if (societyName) user.societyName = societyName;
    if (address) user.address = address;

    await user.save();

    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      flatNumber: user.flatNumber,
      building: user.building,
      societyName: user.societyName,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user: userResponse }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete super admin'
      });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export default {
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
};

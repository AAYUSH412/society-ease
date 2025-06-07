import User from '../models/User.js';
import { verifyToken, verifyRefreshToken } from '../utils/jwt.js';

// Protect routes - require authentication
export const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Get token from Authorization header
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.accessToken) {
      // Get token from cookie
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = verifyToken(token);
      
      // Get user from database
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is invalid. User not found.'
        });
      }

      // Check if user account is approved
      if (user.status !== 'approved') {
        return res.status(401).json({
          success: false,
          message: 'Account is not approved. Please contact admin.'
        });
      }

      // Check if user account is suspended
      if (user.status === 'suspended') {
        return res.status(401).json({
          success: false,
          message: 'Account is suspended. Please contact admin.'
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired.'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// Restrict to specific roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};

// Admin only access
export const adminOnly = restrictTo('admin', 'super_admin');

// Super admin only access
export const superAdminOnly = restrictTo('super_admin');

// Optional authentication (user may or may not be logged in)
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Get token from header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      try {
        // Verify token
        const decoded = verifyToken(token);
        
        // Get user from database
        const user = await User.findById(decoded.userId).select('-password');
        
        if (user && user.status === 'approved') {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but continue without user
        req.user = null;
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next();
  }
};

// Check if user owns the resource or is admin
export const ownerOrAdmin = (resourceUserField = 'user') => {
  return (req, res, next) => {
    // If user is admin, allow access
    if (req.user.role === 'admin' || req.user.role === 'super_admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.body[resourceUserField] || req.params.userId || req.user._id;
    
    if (req.user._id.toString() !== resourceUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }

    next();
  };
};

// Rate limiting for login attempts
export const loginRateLimit = async (req, res, next) => {
  const { email, phone } = req.body;
  const identifier = email || phone;

  if (!identifier) {
    return next();
  }

  try {
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { phone: identifier }
      ]
    });

    if (user && user.isLocked) {
      const lockTime = user.lockUntil;
      const remainingTime = Math.ceil((lockTime - Date.now()) / 1000 / 60); // minutes
      
      return res.status(423).json({
        success: false,
        message: `Account is temporarily locked due to too many failed login attempts. Try again in ${remainingTime} minutes.`,
        lockUntil: lockTime
      });
    }

    next();
  } catch (error) {
    console.error('Login rate limit error:', error);
    next();
  }
};

// Alias for protect function
export const auth = protect;

// Admin authentication middleware
export const adminAuth = restrictTo('admin', 'super_admin');

export default {
  protect,
  restrictTo,
  adminOnly,
  superAdminOnly,
  optionalAuth,
  ownerOrAdmin,
  loginRateLimit,
  auth,
  adminAuth
};

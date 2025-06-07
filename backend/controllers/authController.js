import User from '../models/User.js';
import { 
  generateToken, 
  generateRefreshToken, 
  generateVerificationToken, 
  generatePasswordResetToken,
  hashToken,
  setTokenCookies,
  clearTokenCookies,
  verifyRefreshToken
} from '../utils/jwt.js';
import { sendEmail } from '../config/nodemailer.js';
import { 
  welcomeEmailTemplate, 
  emailVerificationTemplate,
  passwordResetTemplate 
} from '../utils/emailTemplates.js';
import validator from 'validator';

// Register new user
export const register = async (req, res) => {
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

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
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

    // Generate email verification token
    const emailVerificationToken = generateVerificationToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

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
      emailVerificationToken: hashToken(emailVerificationToken),
      emailVerificationExpires,
      status: 'approved' // Auto-approve users
    });

    // Send verification email
    try {
      const emailTemplate = emailVerificationTemplate(
        user.fullName,
        `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`
      );
      
      await sendEmail({
        to: user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      });
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

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
      message: 'Registration successful! Please verify your email. You can now login.',
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { identifier, password, rememberMe = false } = req.body;

    // Validation
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/phone and password'
      });
    }

    // Find user by credentials
    const user = await User.findByCredentials(identifier, password);

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    // Generate tokens
    const accessToken = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Set cookies
    setTokenCookies(res, accessToken, refreshToken);

    // Prepare user response
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      flatNumber: user.flatNumber,
      building: user.building,
      societyName: user.societyName,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      profileImage: user.profileImage,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/phone or password'
      });
    }

    if (error.message.includes('Account is temporarily locked')) {
      return res.status(423).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    // Clear cookies
    clearTokenCookies(res);

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// Refresh access token
export const refreshToken = async (req, res) => {
  try {
    let refreshToken;

    // Get refresh token from cookie or body
    if (req.cookies.refreshToken) {
      refreshToken = req.cookies.refreshToken;
    } else if (req.body.refreshToken) {
      refreshToken = req.body.refreshToken;
    }

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided'
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Get user from database
    const user = await User.findById(decoded.userId);
    if (!user || user.status !== 'approved') {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const accessToken = generateToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    // Set new cookies
    setTokenCookies(res, accessToken, newRefreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    });
  }
};

// Get current user
export const getMe = async (req, res) => {
  try {
    const user = req.user;

    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      flatNumber: user.flatNumber,
      building: user.building,
      societyName: user.societyName,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      profileImage: user.profileImage,
      address: user.address,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      success: true,
      data: {
        user: userResponse
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Hash the token to compare with database
    const hashedToken = hashToken(token);

    // Find user with valid token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Update user
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification'
    });
  }
};

// Resend verification email
export const resendEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const emailVerificationToken = generateVerificationToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailVerificationToken = hashToken(emailVerificationToken);
    user.emailVerificationExpires = emailVerificationExpires;
    await user.save();

    // Send verification email
    const emailTemplate = emailVerificationTemplate(
      user.fullName,
      `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`
    );
    
    await sendEmail({
      to: user.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text
    });

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });

  } catch (error) {
    console.error('Resend email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export default {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  verifyEmail,
  resendEmailVerification
};

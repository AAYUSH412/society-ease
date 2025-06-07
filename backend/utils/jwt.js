import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Generate JWT token
export const generateToken = (userId, role = 'resident') => {
  return jwt.sign(
    { 
      userId: userId,
      role: role,
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'society-ease',
      audience: 'society-ease-users'
    }
  );
};

// Generate refresh token
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { 
      userId: userId,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
      issuer: 'society-ease',
      audience: 'society-ease-users'
    }
  );
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'society-ease',
      audience: 'society-ease-users'
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

// Verify refresh token
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: 'society-ease',
      audience: 'society-ease-users'
    });
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

// Generate verification token (for email/phone verification)
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Generate password reset token
export const generatePasswordResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  return { resetToken, hashedToken };
};

// Hash token (for storing in database)
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Generate OTP for phone verification
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Set token cookies
export const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Access token cookie (7 days)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
  });

  // Refresh token cookie (30 days)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/'
  });
};

// Clear token cookies
export const clearTokenCookies = (res) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/'
  });
  
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/'
  });
};

export default {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  generateVerificationToken,
  generatePasswordResetToken,
  hashToken,
  generateOTP,
  setTokenCookies,
  clearTokenCookies
};

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    validate: {
      validator: function(v) {
        return validator.isMobilePhone(v, 'en-IN');
      },
      message: 'Please provide a valid phone number'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },

  // Society Information
  flatNumber: {
    type: String,
    required: [true, 'Flat number is required'],
    trim: true,
    maxlength: [10, 'Flat number cannot exceed 10 characters']
  },
  building: {
    type: String,
    trim: true,
    maxlength: [50, 'Building name cannot exceed 50 characters']
  },
  societyName: {
    type: String,
    required: [true, 'Society name is required'],
    trim: true,
    maxlength: [100, 'Society name cannot exceed 100 characters']
  },

  // User Role & Status
  role: {
    type: String,
    enum: ['resident', 'admin', 'super_admin'],
    default: 'resident'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },

  // Verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,

  // Password Reset
  passwordResetToken: String,
  passwordResetExpires: Date,

  // Additional Information
  profileImage: String,
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },

  // Tracking
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,

  // Meta
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ flatNumber: 1, societyName: 1 });
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified or new
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to handle failed login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

// Instance method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static method to find by credentials
userSchema.statics.findByCredentials = async function(identifier, password) {
  // Find user by email or phone
  const user = await this.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { phone: identifier }
    ],
    status: 'approved'
  }).select('+password');

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check if account is locked
  if (user.isLocked) {
    throw new Error('Account is temporarily locked due to too many failed login attempts');
  }

  // Compare password
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    // Increment login attempts
    await user.incLoginAttempts();
    throw new Error('Invalid credentials');
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  return user;
};

// Static method to check if flat is already taken
userSchema.statics.isFlatTaken = async function(flatNumber, societyName, excludeUserId) {
  const query = {
    flatNumber: flatNumber,
    societyName: societyName,
    status: { $in: ['approved', 'pending'] }
  };

  if (excludeUserId) {
    query._id = { $ne: excludeUserId };
  }

  const existingUser = await this.findOne(query);
  return !!existingUser;
};

const User = mongoose.model('User', userSchema);

export default User;

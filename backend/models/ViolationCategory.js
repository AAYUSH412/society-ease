import mongoose from 'mongoose';

const ViolationCategorySchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxLength: [100, 'Category name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Category code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxLength: [10, 'Category code cannot exceed 10 characters'],
    match: [/^[A-Z0-9_]+$/, 'Category code can only contain uppercase letters, numbers, and underscores']
  },
  description: {
    type: String,
    required: [true, 'Category description is required'],
    trim: true,
    maxLength: [500, 'Description cannot exceed 500 characters']
  },

  // Fine Configuration
  baseFineAmount: {
    type: Number,
    required: [true, 'Base fine amount is required'],
    min: [0, 'Fine amount cannot be negative']
  },
  escalationFine: {
    type: Number,
    default: 0,
    min: [0, 'Escalation fine cannot be negative']
  },
  maxFineAmount: {
    type: Number,
    validate: {
      validator: function(value) {
        return !value || value >= this.baseFineAmount;
      },
      message: 'Maximum fine amount must be greater than or equal to base fine amount'
    }
  },

  // Category Settings
  severity: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'Severity must be one of: low, medium, high, critical'
    },
    default: 'medium'
  },
  requiresPhotoEvidence: {
    type: Boolean,
    default: true
  },
  requiresWitnessStatement: {
    type: Boolean,
    default: false
  },
  autoApprovalEnabled: {
    type: Boolean,
    default: false
  },
  allowAppeals: {
    type: Boolean,
    default: true
  },

  // Time Limits
  reportingTimeLimit: {
    type: Number, // Hours
    default: 24,
    min: [1, 'Reporting time limit must be at least 1 hour']
  },
  resolutionTimeLimit: {
    type: Number, // Hours
    default: 72,
    min: [1, 'Resolution time limit must be at least 1 hour']
  },
  appealTimeLimit: {
    type: Number, // Hours
    default: 168, // 7 days
    min: [1, 'Appeal time limit must be at least 1 hour']
  },

  // Notification Settings
  notifyResident: {
    type: Boolean,
    default: true
  },
  notifyAdmin: {
    type: Boolean,
    default: true
  },
  escalationNotification: {
    type: Boolean,
    default: true
  },

  // Status and Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  
  // Usage Statistics
  totalViolations: {
    type: Number,
    default: 0
  },
  totalFinesCollected: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date
  },

  // Administrative
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
ViolationCategorySchema.index({ severity: 1 });
ViolationCategorySchema.index({ isActive: 1 });
ViolationCategorySchema.index({ displayOrder: 1 });

// Virtual Fields
ViolationCategorySchema.virtual('fineRange').get(function() {
  if (this.maxFineAmount && this.maxFineAmount > this.baseFineAmount) {
    return `₹${this.baseFineAmount} - ₹${this.maxFineAmount}`;
  }
  return `₹${this.baseFineAmount}`;
});

ViolationCategorySchema.virtual('averageFinePerViolation').get(function() {
  if (this.totalViolations === 0) return 0;
  return Math.round(this.totalFinesCollected / this.totalViolations);
});

ViolationCategorySchema.virtual('isRecentlyUsed').get(function() {
  if (!this.lastUsed) return false;
  const daysSinceLastUse = (new Date() - this.lastUsed) / (1000 * 60 * 60 * 24);
  return daysSinceLastUse <= 30; // Used within last 30 days
});

// Pre-save middleware
ViolationCategorySchema.pre('save', function(next) {
  // Auto-generate code if not provided
  if (!this.code && this.name) {
    this.code = this.name.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 10);
  }
  
  next();
});

// Static Methods
ViolationCategorySchema.statics.getActiveCategories = function() {
  return this.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
};

ViolationCategorySchema.statics.getCategoriesBySeverity = function(severity) {
  return this.find({ isActive: true, severity }).sort({ displayOrder: 1, name: 1 });
};

ViolationCategorySchema.statics.searchCategories = function(searchTerm) {
  const regex = new RegExp(searchTerm, 'i');
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { name: regex },
          { description: regex },
          { code: regex }
        ]
      }
    ]
  }).sort({ displayOrder: 1, name: 1 });
};

ViolationCategorySchema.statics.getMostUsedCategories = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ totalViolations: -1 })
    .limit(limit);
};

ViolationCategorySchema.statics.getCategoryStats = async function() {
  const stats = await this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalCategories: { $sum: 1 },
        totalViolations: { $sum: '$totalViolations' },
        totalFinesCollected: { $sum: '$totalFinesCollected' },
        averageFineAmount: { $avg: '$baseFineAmount' },
        severityDistribution: {
          $push: {
            severity: '$severity',
            count: 1
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalCategories: 0,
    totalViolations: 0,
    totalFinesCollected: 0,
    averageFineAmount: 0,
    severityDistribution: []
  };
};

// Instance Methods
ViolationCategorySchema.methods.updateUsageStats = function(fineAmount = 0) {
  this.totalViolations += 1;
  this.totalFinesCollected += fineAmount;
  this.lastUsed = new Date();
  return this.save();
};

ViolationCategorySchema.methods.canBeReported = function() {
  return this.isActive;
};

ViolationCategorySchema.methods.getTimeUntilReportingExpiry = function(incidentDate) {
  if (!incidentDate) return null;
  
  const reportingDeadline = new Date(incidentDate);
  reportingDeadline.setHours(reportingDeadline.getHours() + this.reportingTimeLimit);
  
  const now = new Date();
  const timeRemaining = reportingDeadline - now;
  
  return timeRemaining > 0 ? timeRemaining : 0;
};

ViolationCategorySchema.methods.calculateFineAmount = function(escalationLevel = 0) {
  let fineAmount = this.baseFineAmount;
  
  if (escalationLevel > 0 && this.escalationFine > 0) {
    fineAmount += (this.escalationFine * escalationLevel);
  }
  
  if (this.maxFineAmount && fineAmount > this.maxFineAmount) {
    fineAmount = this.maxFineAmount;
  }
  
  return fineAmount;
};

ViolationCategorySchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  return {
    _id: obj._id,
    name: obj.name,
    code: obj.code,
    description: obj.description,
    baseFineAmount: obj.baseFineAmount,
    severity: obj.severity,
    requiresPhotoEvidence: obj.requiresPhotoEvidence,
    requiresWitnessStatement: obj.requiresWitnessStatement,
    allowAppeals: obj.allowAppeals,
    reportingTimeLimit: obj.reportingTimeLimit,
    resolutionTimeLimit: obj.resolutionTimeLimit,
    appealTimeLimit: obj.appealTimeLimit,
    fineRange: obj.fineRange,
    isActive: obj.isActive,
    displayOrder: obj.displayOrder,
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt
  };
};

export default mongoose.model('ViolationCategory', ViolationCategorySchema);

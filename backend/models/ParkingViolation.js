import mongoose from 'mongoose';

const parkingViolationSchema = new mongoose.Schema({
  // Basic Identification
  violationId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return `PV${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    }
  },

  // Reporter Information
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter ID is required'],
    index: true
  },
  reporterDetails: {
    name: {
      type: String,
      required: true
    },
    flatNumber: {
      type: String,
      required: true
    },
    building: String,
    email: String,
    phone: String
  },

  // Violator Information
  violatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  violatorDetails: {
    name: String,
    flatNumber: String,
    building: String,
    email: String,
    phone: String,
    vehicleNumber: String,
    vehicleType: {
      type: String,
      enum: ['car', 'motorcycle', 'bicycle', 'other']
    }
  },

  // Violation Details
  violationType: {
    type: String,
    required: [true, 'Violation type is required'],
    enum: [
      'unauthorized_parking',
      'blocking_fire_lane',
      'visitor_parking_misuse',
      'parking_in_disabled_spot',
      'double_parking',
      'parking_outside_lines',
      'blocking_entrance',
      'overstaying_time_limit',
      'other'
    ],
    index: true
  },
  customViolationType: {
    type: String,
    trim: true,
    maxlength: [100, 'Custom violation type cannot exceed 100 characters']
  },

  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },

  // Location Information
  location: {
    area: {
      type: String,
      required: [true, 'Area is required'],
      enum: ['basement_parking', 'ground_parking', 'visitor_parking', 'disabled_parking', 'fire_lane', 'entrance_gate', 'other']
    },
    specificLocation: {
      type: String,
      trim: true,
      maxlength: [200, 'Specific location cannot exceed 200 characters']
    },
    parkingSlotNumber: String,
    building: String,
    floor: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },

  // Photo Evidence (ImageKit URLs)
  photoEvidence: [{
    imageId: String, // ImageKit file ID
    imageUrl: {
      type: String,
      required: true
    },
    thumbnailUrl: String,
    fileName: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    metadata: {
      width: Number,
      height: Number,
      format: String
    }
  }],

  // Timestamps
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  violationDate: {
    type: Date,
    required: [true, 'Violation date is required']
  },
  violationTime: {
    type: String,
    required: [true, 'Violation time is required']
  },

  // Status Management
  status: {
    type: String,
    required: true,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'resolved', 'dismissed'],
    default: 'pending',
    index: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },

  // Review Information
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  reviewedAt: Date,
  reviewNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Review notes cannot exceed 500 characters']
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },

  // Fine Information
  fineIssued: {
    type: Boolean,
    default: false
  },
  fineAmount: {
    type: Number,
    min: 0
  },
  warningIssued: {
    type: Boolean,
    default: false
  },

  // Resolution Information
  resolvedAt: Date,
  resolutionNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Resolution notes cannot exceed 500 characters']
  },
  resolutionAction: {
    type: String,
    enum: ['fine_paid', 'warning_acknowledged', 'corrective_action_taken', 'dismissed', 'other']
  },

  // Appeal Information
  appealSubmitted: {
    type: Boolean,
    default: false
  },
  appealDetails: {
    submittedAt: Date,
    reason: String,
    evidence: [{
      imageUrl: String,
      fileName: String,
      uploadedAt: Date
    }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    reviewNotes: String
  },

  // Society Information
  societyName: {
    type: String,
    required: [true, 'Society name is required'],
    index: true
  },

  // Metadata
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  escalated: {
    type: Boolean,
    default: false
  },
  escalationReason: String,
  escalatedAt: Date,
  escalatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
parkingViolationSchema.index({ societyName: 1, status: 1 });
parkingViolationSchema.index({ reportedBy: 1, timestamp: -1 });
parkingViolationSchema.index({ violatedBy: 1, timestamp: -1 });
parkingViolationSchema.index({ violationType: 1, severity: 1 });
parkingViolationSchema.index({ location: 1, timestamp: -1 });
parkingViolationSchema.index({ status: 1, timestamp: -1 });
parkingViolationSchema.index({ reviewedBy: 1, reviewedAt: -1 });
parkingViolationSchema.index({ 'violatorDetails.vehicleNumber': 1 });

// Virtual for formatted violation ID
parkingViolationSchema.virtual('formattedViolationId').get(function() {
  return `#${this.violationId}`;
});

// Virtual for time since violation
parkingViolationSchema.virtual('timeSinceViolation').get(function() {
  const now = new Date();
  const violationTime = this.timestamp;
  const diffInHours = Math.floor((now - violationTime) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Less than 1 hour ago';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
  return `${Math.floor(diffInHours / 168)} weeks ago`;
});

// Virtual for status badge color
parkingViolationSchema.virtual('statusColor').get(function() {
  const colors = {
    pending: 'orange',
    under_review: 'blue',
    approved: 'green',
    rejected: 'red',
    resolved: 'purple',
    dismissed: 'gray'
  };
  return colors[this.status] || 'gray';
});

// Virtual for severity badge color
parkingViolationSchema.virtual('severityColor').get(function() {
  const colors = {
    low: 'green',
    medium: 'yellow',
    high: 'orange',
    critical: 'red'
  };
  return colors[this.severity] || 'gray';
});

// Instance method to approve violation
parkingViolationSchema.methods.approve = async function(reviewerId, notes) {
  this.status = 'approved';
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  if (notes) this.reviewNotes = notes;
  await this.save();
  return this;
};

// Instance method to reject violation
parkingViolationSchema.methods.reject = async function(reviewerId, reason) {
  this.status = 'rejected';
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  this.rejectionReason = reason;
  await this.save();
  return this;
};

// Instance method to resolve violation
parkingViolationSchema.methods.resolve = async function(action, notes) {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  this.resolutionAction = action;
  if (notes) this.resolutionNotes = notes;
  await this.save();
  return this;
};

// Static method to get violation statistics
parkingViolationSchema.statics.getViolationStats = function(societyName, dateRange = null) {
  const matchQuery = { societyName };
  
  if (dateRange) {
    matchQuery.timestamp = {
      $gte: dateRange.startDate,
      $lte: dateRange.endDate
    };
  }

  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalViolations: { $sum: 1 },
        pendingViolations: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        approvedViolations: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
        },
        resolvedViolations: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        totalFines: {
          $sum: { $cond: ['$fineIssued', '$fineAmount', 0] }
        },
        averageSeverity: { $avg: '$priority' }
      }
    }
  ]);
};

// Static method to get violations by type
parkingViolationSchema.statics.getViolationsByType = function(societyName, dateRange = null) {
  const matchQuery = { societyName };
  
  if (dateRange) {
    matchQuery.timestamp = {
      $gte: dateRange.startDate,
      $lte: dateRange.endDate
    };
  }

  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$violationType',
        count: { $sum: 1 },
        finesIssued: { $sum: { $cond: ['$fineIssued', 1, 0] } },
        totalFineAmount: { $sum: { $cond: ['$fineIssued', '$fineAmount', 0] } }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Static method to get repeat violators
parkingViolationSchema.statics.getRepeatViolators = function(societyName, minViolations = 3) {
  return this.aggregate([
    { 
      $match: { 
        societyName,
        status: { $in: ['approved', 'resolved'] },
        violatedBy: { $ne: null }
      }
    },
    {
      $group: {
        _id: '$violatedBy',
        violationCount: { $sum: 1 },
        totalFines: { $sum: { $cond: ['$fineIssued', '$fineAmount', 0] } },
        lastViolation: { $max: '$timestamp' },
        violatorDetails: { $first: '$violatorDetails' }
      }
    },
    { $match: { violationCount: { $gte: minViolations } } },
    { $sort: { violationCount: -1, lastViolation: -1 } }
  ]);
};

const ParkingViolation = mongoose.model('ParkingViolation', parkingViolationSchema);

export default ParkingViolation;

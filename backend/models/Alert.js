import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  // Basic Information
  alertId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'ALT' + Date.now() + Math.floor(Math.random() * 1000);
    }
  },
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Alert description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Alert type is required'],
    enum: ['water', 'electricity', 'gas', 'general', 'maintenance', 'security', 'internet'],
    index: true
  },

  // Status Management
  status: {
    type: String,
    required: [true, 'Alert status is required'],
    enum: ['active', 'resolved', 'scheduled', 'cancelled'],
    default: 'active',
    index: true
  },

  // Priority System
  priority: {
    type: String,
    required: [true, 'Alert priority is required'],
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },

  // Timing Information
  createdDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
    default: Date.now
  },
  estimatedResolutionTime: {
    type: Date,
    required: [true, 'Estimated resolution time is required']
  },
  actualResolutionTime: {
    type: Date,
    default: null
  },
  scheduledTime: {
    type: Date,
    default: null // For scheduled maintenance alerts
  },

  // Creator Information
  createdBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user ID is required'],
      index: true
    },
    userRole: {
      type: String,
      required: [true, 'Creator role is required'],
      enum: ['admin', 'resident', 'super_admin']
    },
    userName: {
      type: String,
      required: [true, 'Creator name is required'],
      trim: true
    },
    userContact: {
      email: String,
      phone: String
    }
  },

  // Visibility & Affected Areas
  visibility: {
    scope: {
      type: String,
      required: [true, 'Visibility scope is required'],
      enum: ['all', 'specific_buildings', 'specific_flats', 'specific_areas'],
      default: 'all'
    },
    affectedAreas: {
      buildings: [{
        type: String,
        trim: true
      }],
      flats: [{
        flatNumber: String,
        building: String
      }],
      areas: [{
        type: String,
        enum: ['parking', 'garden', 'clubhouse', 'gym', 'pool', 'lobby', 'elevator', 'common_area']
      }]
    },
    societyName: {
      type: String,
      required: [true, 'Society name is required'],
      trim: true,
      index: true
    }
  },

  // Status Updates & Communication
  updates: [{
    updateId: {
      type: String,
      default: function() {
        return 'UPD' + Date.now() + Math.floor(Math.random() * 100);
      }
    },
    message: {
      type: String,
      required: [true, 'Update message is required'],
      trim: true,
      maxlength: [500, 'Update message cannot exceed 500 characters']
    },
    updatedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      userName: {
        type: String,
        required: true
      },
      userRole: {
        type: String,
        required: true,
        enum: ['admin', 'resident', 'super_admin']
      }
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updateType: {
      type: String,
      enum: ['progress', 'delay', 'resolution', 'escalation', 'general'],
      default: 'general'
    },
    attachments: [{
      fileName: String,
      fileUrl: String,
      fileType: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],

  // Additional Metadata
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Escalation Management
  escalation: {
    isEscalated: {
      type: Boolean,
      default: false
    },
    escalatedAt: Date,
    escalatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    escalationReason: String,
    escalationLevel: {
      type: Number,
      min: 1,
      max: 5,
      default: 1
    }
  },

  // Resolution Information
  resolution: {
    resolvedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      userName: String,
      userRole: String
    },
    resolutionNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Resolution notes cannot exceed 1000 characters']
    },
    resolutionProof: [{
      fileName: String,
      fileUrl: String,
      fileType: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    residentFeedback: [{
      residentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      submittedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },

  // System Metadata
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // Auto-close settings
  autoClose: {
    enabled: {
      type: Boolean,
      default: false
    },
    afterHours: {
      type: Number,
      min: 1,
      max: 168 // Max 1 week
    }
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
alertSchema.index({ type: 1, status: 1 });
alertSchema.index({ priority: 1, status: 1 });
alertSchema.index({ 'visibility.societyName': 1, status: 1 });
alertSchema.index({ 'createdBy.userId': 1, createdDate: -1 });
alertSchema.index({ startTime: 1, estimatedResolutionTime: 1 });
alertSchema.index({ 'escalation.isEscalated': 1, 'escalation.escalationLevel': 1 });

// Virtual for alert duration
alertSchema.virtual('duration').get(function() {
  if (this.actualResolutionTime) {
    return Math.floor((this.actualResolutionTime - this.startTime) / (1000 * 60)); // Duration in minutes
  }
  return Math.floor((Date.now() - this.startTime) / (1000 * 60)); // Current duration
});

// Virtual for is overdue
alertSchema.virtual('isOverdue').get(function() {
  return this.status === 'active' && new Date() > this.estimatedResolutionTime;
});

// Virtual for time until resolution
alertSchema.virtual('timeUntilResolution').get(function() {
  if (this.status === 'resolved') return 0;
  const timeDiff = this.estimatedResolutionTime - Date.now();
  return Math.max(0, Math.floor(timeDiff / (1000 * 60))); // Minutes until resolution
});

// Virtual for affected residents count (will be calculated based on visibility)
alertSchema.virtual('affectedResidentsCount').get(function() {
  // This will be populated by a separate method that counts based on visibility settings
  return this._affectedResidentsCount || 0;
});

// Static method to get active alerts for a resident
alertSchema.statics.getActiveAlertsForResident = async function(residentData) {
  const { flatNumber, building, societyName } = residentData;
  
  return await this.find({
    status: 'active',
    'visibility.societyName': societyName,
    $or: [
      { 'visibility.scope': 'all' },
      { 
        'visibility.scope': 'specific_buildings',
        'visibility.affectedAreas.buildings': building
      },
      {
        'visibility.scope': 'specific_flats',
        'visibility.affectedAreas.flats': {
          $elemMatch: {
            flatNumber: flatNumber,
            building: building
          }
        }
      }
    ]
  }).sort({ priority: -1, createdDate: -1 });
};

// Static method to get alerts statistics
alertSchema.statics.getAlertStatistics = async function(societyName, dateRange) {
  const matchQuery = {
    'visibility.societyName': societyName
  };
  
  if (dateRange) {
    matchQuery.createdDate = {
      $gte: dateRange.startDate,
      $lte: dateRange.endDate
    };
  }

  return await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalAlerts: { $sum: 1 },
        activeAlerts: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        resolvedAlerts: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        criticalAlerts: {
          $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] }
        },
        overdueAlerts: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', 'active'] },
                  { $lt: ['$estimatedResolutionTime', new Date()] }
                ]
              },
              1,
              0
            ]
          }
        },
        avgResolutionTime: {
          $avg: {
            $cond: [
              { $ne: ['$actualResolutionTime', null] },
              { $subtract: ['$actualResolutionTime', '$startTime'] },
              null
            ]
          }
        }
      }
    }
  ]);
};

// Instance method to add update
alertSchema.methods.addUpdate = async function(updateData) {
  this.updates.push({
    message: updateData.message,
    updatedBy: updateData.updatedBy,
    updateType: updateData.updateType || 'general',
    attachments: updateData.attachments || []
  });
  
  await this.save();
  return this.updates[this.updates.length - 1];
};

// Instance method to resolve alert
alertSchema.methods.resolveAlert = async function(resolutionData) {
  this.status = 'resolved';
  this.actualResolutionTime = new Date();
  this.resolution = {
    resolvedBy: resolutionData.resolvedBy,
    resolutionNotes: resolutionData.resolutionNotes,
    resolutionProof: resolutionData.resolutionProof || []
  };
  
  await this.save();
  return this;
};

// Instance method to escalate alert
alertSchema.methods.escalateAlert = async function(escalationData) {
  this.escalation = {
    isEscalated: true,
    escalatedAt: new Date(),
    escalatedBy: escalationData.escalatedBy,
    escalationReason: escalationData.reason,
    escalationLevel: (this.escalation.escalationLevel || 0) + 1
  };
  
  // Auto-update priority if escalated
  if (this.escalation.escalationLevel >= 3 && this.priority !== 'critical') {
    this.priority = 'critical';
  }
  
  await this.save();
  return this;
};

// Pre-save middleware to handle auto-close
alertSchema.pre('save', function(next) {
  // Auto-close logic for scheduled alerts
  if (this.autoClose.enabled && this.status === 'active') {
    const hoursElapsed = (Date.now() - this.startTime) / (1000 * 60 * 60);
    if (hoursElapsed >= this.autoClose.afterHours) {
      this.status = 'resolved';
      this.actualResolutionTime = new Date();
      this.resolution.resolutionNotes = 'Auto-closed after specified duration';
    }
  }
  
  next();
});

const Alert = mongoose.model('Alert', alertSchema);

export default Alert;

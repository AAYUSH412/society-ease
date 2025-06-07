import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  // Basic Identification
  notificationId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'NOT' + Date.now() + Math.floor(Math.random() * 1000);
    }
  },

  // Alert Reference
  alertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert',
    required: [true, 'Alert ID is required'],
    index: true
  },

  // Notification Type
  notificationType: {
    type: String,
    required: [true, 'Notification type is required'],
    enum: ['alert_created', 'alert_updated', 'alert_resolved', 'reminder'],
    index: true
  },

  // Recipient Information
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient ID is required'],
    index: true
  },
  recipientDetails: {
    email: {
      type: String,
      required: [true, 'Recipient email is required']
    },
    flatNumber: {
      type: String,
      required: [true, 'Recipient flat number is required']
    },
    building: String,
    societyName: {
      type: String,
      required: [true, 'Society name is required'],
      index: true
    }
  },

  // Email Delivery Status
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'pending',
    index: true
  },
  
  sentAt: {
    type: Date
  },
  
  deliveredAt: {
    type: Date
  },
  
  failedAt: {
    type: Date
  },
  
  errorMessage: {
    type: String
  },
  
  messageId: {
    type: String // From email service provider
  },

  // Message Content
  content: {
    subject: {
      type: String,
      required: [true, 'Notification subject is required'],
      maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    body: {
      type: String,
      required: [true, 'Notification body is required'],
      maxlength: [2000, 'Body cannot exceed 2000 characters']
    },
    htmlBody: String // For email notifications
  },

  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },

  // System Metadata
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
notificationSchema.index({ alertId: 1, recipientId: 1 });
notificationSchema.index({ 'recipientDetails.societyName': 1, createdAt: -1 });
notificationSchema.index({ notificationType: 1, status: 1 });
notificationSchema.index({ status: 1, createdAt: -1 });
notificationSchema.index({ priority: 1, createdAt: -1 });

// Instance method to mark as sent
notificationSchema.methods.markAsSent = function(messageId) {
  this.status = 'sent';
  this.sentAt = new Date();
  this.messageId = messageId;
  return this.save();
};

// Instance method to mark as delivered
notificationSchema.methods.markAsDelivered = function() {
  this.status = 'delivered';
  this.deliveredAt = new Date();
  return this.save();
};

// Instance method to mark as failed
notificationSchema.methods.markAsFailed = function(errorMessage) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.errorMessage = errorMessage;
  return this.save();
};

// Static method to get pending notifications
notificationSchema.statics.getPendingNotifications = function(limit = 50) {
  return this.find({
    status: 'pending',
    isActive: true
  })
  .populate('alertId', 'title type priority status')
  .populate('recipientId', 'firstName lastName email')
  .sort({ priority: -1, createdAt: 1 })
  .limit(limit);
};

// Static method to get notification statistics
notificationSchema.statics.getNotificationStats = function(societyName, dateRange = null) {
  const matchQuery = {
    'recipientDetails.societyName': societyName
  };
  
  if (dateRange) {
    matchQuery.createdAt = {
      $gte: dateRange.startDate,
      $lte: dateRange.endDate
    };
  }

  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
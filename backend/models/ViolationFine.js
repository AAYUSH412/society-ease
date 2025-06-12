import mongoose from 'mongoose';

const violationFineSchema = new mongoose.Schema({
  // Basic Identification
  fineId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return `VF${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    }
  },

  // Violation Reference
  violationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Violation',
    required: [true, 'Violation ID is required'],
    index: true
  },

  // Violator Information
  violatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Violator ID is required'],
    index: true
  },
  violatorDetails: {
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
    phone: String,
    vehicleNumber: String
  },

  // Fine Details
  amount: {
    type: Number,
    required: [true, 'Fine amount is required'],
    min: [0, 'Fine amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR']
  },
  
  // Fine Type and Category
  fineType: {
    type: String,
    required: true,
    enum: ['first_offense', 'repeat_offense', 'severe_violation', 'custom'],
    default: 'first_offense'
  },
  violationType: {
    type: String,
    required: true,
    enum: [
      'noise_complaint',
      'property_damage',
      'unauthorized_access',
      'littering',
      'smoking_violation',
      'pet_violation',
      'other'
    ]
  },

  // Due Date and Payment Information
  issuedDate: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    index: true
  },
  gracePeriod: {
    type: Number,
    default: 7, // days
    min: 0
  },

  // Payment Status
  status: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'overdue', 'waived', 'disputed', 'cancelled'],
    default: 'pending',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['not_paid', 'partially_paid', 'fully_paid', 'refunded'],
    default: 'not_paid',
    index: true
  },

  // Payment Details
  paymentMethod: {
    type: String,
    enum: ['cash', 'cheque', 'bank_transfer', 'upi', 'credit_card', 'debit_card', 'razorpay', 'other']
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  paidDate: Date,
  paymentReference: String,
  paymentNotes: String,

  // Late Fee Calculation
  lateFee: {
    amount: {
      type: Number,
      default: 0,
      min: 0
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    calculatedOn: Date
  },

  // Discount Information
  discount: {
    amount: {
      type: Number,
      default: 0,
      min: 0
    },
    reason: String,
    appliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedAt: Date
  },

  // Total Amount Calculation
  totalAmount: {
    type: Number,
    default: function() {
      return this.amount + (this.lateFee?.amount || 0) - (this.discount?.amount || 0);
    }
  },
  outstandingAmount: {
    type: Number,
    default: function() {
      return this.totalAmount - this.paidAmount;
    }
  },

  // Administrative Information
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Issued by is required'],
    index: true
  },
  issuedByDetails: {
    name: String,
    role: String,
    email: String
  },

  // Waiver Information
  waiverDetails: {
    reason: String,
    waivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    waivedAt: Date,
    waiverAmount: Number,
    adminNotes: String
  },

  // Dispute Information
  disputeDetails: {
    reason: String,
    submittedAt: Date,
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    evidence: [{
      fileName: String,
      fileUrl: String,
      uploadedAt: Date
    }],
    status: {
      type: String,
      enum: ['pending', 'under_review', 'accepted', 'rejected'],
      default: 'pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    reviewNotes: String,
    resolution: String
  },

  // Billing Integration
  billId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill'
  },
  addedToBill: {
    type: Boolean,
    default: false
  },
  billingPeriod: {
    month: Number,
    year: Number
  },

  // Notifications and Reminders
  remindersSent: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'whatsapp', 'in_app']
    },
    sentAt: Date,
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed']
    }
  }],
  lastReminderSent: Date,
  
  // Escalation
  escalated: {
    type: Boolean,
    default: false
  },
  escalationLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  escalatedAt: Date,
  escalationReason: String,

  // Society Information
  societyName: {
    type: String,
    required: [true, 'Society name is required'],
    index: true
  },

  // Additional Notes
  adminNotes: String,
  publicNotes: String,
  internalNotes: String,

  // System Metadata
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  version: {
    type: Number,
    default: 1
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
violationFineSchema.index({ societyName: 1, status: 1 });
violationFineSchema.index({ violatorId: 1, issuedDate: -1 });
violationFineSchema.index({ dueDate: 1, status: 1 });
violationFineSchema.index({ issuedBy: 1, issuedDate: -1 });
violationFineSchema.index({ paymentStatus: 1, dueDate: 1 });
violationFineSchema.index({ violationType: 1, amount: -1 });

// Virtual for formatted fine ID
violationFineSchema.virtual('formattedFineId').get(function() {
  return `#${this.fineId}`;
});

// Virtual for overdue status
violationFineSchema.virtual('isOverdue').get(function() {
  return this.status === 'pending' && new Date() > this.dueDate;
});

// Virtual for days overdue
violationFineSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0;
  const today = new Date();
  const diffTime = today - this.dueDate;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for payment status badge color
violationFineSchema.virtual('statusColor').get(function() {
  const colors = {
    pending: this.isOverdue ? 'red' : 'orange',
    paid: 'green',
    overdue: 'red',
    waived: 'blue',
    disputed: 'purple',
    cancelled: 'gray'
  };
  return colors[this.status] || 'gray';
});

// Pre-save middleware to calculate totals
violationFineSchema.pre('save', function(next) {
  // Calculate total amount
  this.totalAmount = this.amount + (this.lateFee?.amount || 0) - (this.discount?.amount || 0);
  
  // Calculate outstanding amount
  this.outstandingAmount = this.totalAmount - this.paidAmount;
  
  // Update status based on payment
  if (this.paidAmount >= this.totalAmount && this.status === 'pending') {
    this.status = 'paid';
    this.paymentStatus = 'fully_paid';
    if (!this.paidDate) this.paidDate = new Date();
  } else if (this.paidAmount > 0 && this.paidAmount < this.totalAmount) {
    this.paymentStatus = 'partially_paid';
  }
  
  // Check if overdue
  if (this.status === 'pending' && new Date() > this.dueDate) {
    this.status = 'overdue';
  }
  
  next();
});

// Instance method to mark as paid
violationFineSchema.methods.markAsPaid = async function(amount, paymentMethod, reference, notes) {
  this.paidAmount += amount;
  this.paymentMethod = paymentMethod;
  this.paymentReference = reference;
  this.paymentNotes = notes;
  
  if (this.paidAmount >= this.totalAmount) {
    this.status = 'paid';
    this.paymentStatus = 'fully_paid';
    this.paidDate = new Date();
  } else {
    this.paymentStatus = 'partially_paid';
  }
  
  await this.save();
  return this;
};

// Instance method to apply waiver
violationFineSchema.methods.applyWaiver = async function(waiverAmount, reason, adminId, adminNotes) {
  this.waiverDetails = {
    reason,
    waivedBy: adminId,
    waivedAt: new Date(),
    waiverAmount,
    adminNotes
  };
  
  if (waiverAmount >= this.outstandingAmount) {
    this.status = 'waived';
    this.paymentStatus = 'fully_paid';
  }
  
  await this.save();
  return this;
};

// Instance method to add to billing
violationFineSchema.methods.addToBilling = async function(billId, month, year) {
  this.billId = billId;
  this.addedToBill = true;
  this.billingPeriod = { month, year };
  await this.save();
  return this;
};

// Static method to get fine statistics
violationFineSchema.statics.getFineStats = function(societyName, dateRange = null) {
  const matchQuery = { societyName };
  
  if (dateRange) {
    matchQuery.issuedDate = {
      $gte: dateRange.startDate,
      $lte: dateRange.endDate
    };
  }

  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalFines: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalCollected: { $sum: '$paidAmount' },
        pendingFines: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        overdueFines: {
          $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] }
        },
        paidFines: {
          $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
        },
        averageFineAmount: { $avg: '$amount' },
        totalOutstanding: { $sum: '$outstandingAmount' }
      }
    }
  ]);
};

// Static method to get overdue fines
violationFineSchema.statics.getOverdueFines = function(societyName) {
  return this.find({
    societyName,
    status: { $in: ['pending', 'overdue'] },
    dueDate: { $lt: new Date() },
    isActive: true
  }).populate('violatorId', 'firstName lastName email phone flatNumber building')
    .populate('violationId', 'violationType location timestamp')
    .sort({ dueDate: 1 });
};

// Static method to get payment summary
violationFineSchema.statics.getPaymentSummary = function(societyName, period = 'month') {
  const now = new Date();
  let startDate;
  
  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return this.aggregate([
    { 
      $match: { 
        societyName,
        paidDate: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$paidDate' }
        },
        dailyCollection: { $sum: '$paidAmount' },
        finesPaid: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

const ViolationFine = mongoose.model('ViolationFine', violationFineSchema);

export default ViolationFine;

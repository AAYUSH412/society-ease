import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  // Payment Identification
  paymentId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return `PAY${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    }
  },
  
  // Bill Reference
  billId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bill',
    required: true,
    index: true
  },
  
  // Resident Information
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  flatNumber: {
    type: String,
    required: true,
    index: true
  },
  societyName: {
    type: String,
    required: true,
    index: true
  },
  
  // Payment Details
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR']
  },
  
  // Payment Method
  paymentMethod: {
    type: String,
    required: true,
    enum: ['razorpay_upi', 'razorpay_card', 'razorpay_netbanking', 'bank_transfer', 'cash', 'cheque', 'other']
  },
  
  // Razorpay Integration
  razorpayPaymentId: {
    type: String,
    sparse: true,
    index: true
  },
  razorpayOrderId: {
    type: String,
    sparse: true
  },
  razorpaySignature: {
    type: String,
    sparse: true
  },
  
  // Bank Transfer Details
  bankTransferDetails: {
    transactionId: String,
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    transferDate: Date
  },
  
  // Cheque Details
  chequeDetails: {
    chequeNumber: String,
    bankName: String,
    chequeDate: Date,
    clearanceDate: Date,
    status: {
      type: String,
      enum: ['pending', 'cleared', 'bounced'],
      default: 'pending'
    }
  },
  
  // Payment Status
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  // Timestamps
  paymentDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  processedAt: Date,
  failedAt: Date,
  refundedAt: Date,
  
  // Additional Information
  description: String,
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  
  // Fee Breakdown (for partial payments)
  feeBreakdown: {
    maintenanceAmount: Number,
    lateFee: Number,
    taxAmount: Number,
    otherFees: Number,
    discount: Number
  },
  
  // Failure Information
  failureReason: String,
  failureCode: String,
  
  // Refund Information
  refundAmount: Number,
  refundReason: String,
  refundedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Administrative Fields
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  
  // Metadata
  paymentSource: {
    type: String,
    enum: ['web', 'mobile', 'admin_portal', 'bulk_upload'],
    default: 'web'
  },
  ipAddress: String,
  userAgent: String,
  
  // Loyalty Program
  loyaltyPointsEarned: {
    type: Number,
    default: 0
  },
  
  // Notes
  adminNotes: String,
  residentNotes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
paymentSchema.index({ societyName: 1, paymentDate: -1 });
paymentSchema.index({ residentId: 1, status: 1 });
paymentSchema.index({ billId: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ paymentMethod: 1, status: 1 });

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return `₹${this.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
});

// Virtual for payment age
paymentSchema.virtual('paymentAge').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.paymentDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for is recent payment
paymentSchema.virtual('isRecent').get(function() {
  return this.paymentAge <= 7; // Within last 7 days
});

// Static method to generate receipt number
paymentSchema.statics.generateReceiptNumber = function() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const timestamp = Date.now().toString().slice(-6);
  return `RCP${year}${month}${timestamp}`;
};

// Static method to get payment summary for a resident
paymentSchema.statics.getResidentPaymentSummary = async function(residentId, startDate, endDate) {
  const matchStage = {
    residentId: new mongoose.Types.ObjectId(residentId)
  };
  
  if (startDate && endDate) {
    matchStage.paymentDate = { $gte: startDate, $lte: endDate };
  }
  
  return await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    {
      $group: {
        _id: null,
        payments: {
          $push: {
            status: '$_id',
            count: '$count',
            totalAmount: '$totalAmount'
          }
        },
        totalPayments: { $sum: '$count' },
        totalAmountPaid: { $sum: { $cond: [{ $eq: ['$_id', 'completed'] }, '$totalAmount', 0] } }
      }
    }
  ]);
};

// Static method to get payment analytics
paymentSchema.statics.getPaymentAnalytics = async function(societyName, year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  return await this.aggregate([
    {
      $match: {
        societyName,
        paymentDate: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          method: '$paymentMethod',
          status: '$status'
        },
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    },
    {
      $group: {
        _id: '$_id.method',
        statuses: {
          $push: {
            status: '$_id.status',
            count: '$count',
            amount: '$totalAmount'
          }
        },
        totalTransactions: { $sum: '$count' },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);
};

// Pre-save middleware
paymentSchema.pre('save', function(next) {
  // Generate receipt number for completed payments
  if (this.status === 'completed' && !this.receiptNumber) {
    this.receiptNumber = this.constructor.generateReceiptNumber();
  }
  
  // Set processed timestamp
  if (this.status === 'completed' && !this.processedAt) {
    this.processedAt = new Date();
  }
  
  // Set failed timestamp
  if (this.status === 'failed' && !this.failedAt) {
    this.failedAt = new Date();
  }
  
  // Set refunded timestamp
  if (this.status === 'refunded' && !this.refundedAt) {
    this.refundedAt = new Date();
  }
  
  next();
});

// Post-save middleware to update bill status
paymentSchema.post('save', async function(doc, next) {
  try {
    if (doc.status === 'completed') {
      const Bill = mongoose.model('Bill');
      await Bill.findByIdAndUpdate(doc.billId, {
        $push: {
          payments: {
            paymentId: doc._id,
            amount: doc.amount,
            paymentDate: doc.paymentDate,
            paymentMethod: doc.paymentMethod,
            receiptNumber: doc.receiptNumber
          }
        }
      });
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;

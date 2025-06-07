import Bill from '../models/Bill.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { validationResult } from 'express-validator';
import { generatePDF } from '../services/pdfService.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Admin Controllers

// Generate bills for all residents
export const generateBulkBills = async (req, res) => {
  try {
    const { month, year, billType, baseAmount, dueDate, additionalCharges = {}, selectedResidents } = req.body;
    const adminId = req.user.id;

    // Validate input
    if (!month || !year || !billType || !baseAmount) {
      return res.status(400).json({
        success: false,
        message: 'Month, year, bill type, and base amount are required'
      });
    }

    // Get admin details
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Determine which residents to generate bills for
    let residents;
    if (selectedResidents && selectedResidents.length > 0) {
      // Generate bills only for selected residents
      residents = await User.find({
        _id: { $in: selectedResidents },
        societyName: admin.societyName,
        role: 'resident'
      });
      
      if (residents.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No valid selected residents found in your society'
        });
      }
    } else {
      // Generate bills for all residents (legacy behavior)
      residents = await User.find({
        societyName: admin.societyName,
        role: 'resident'
      });

      if (residents.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No residents found in your society'
        });
      }
    }

    // Check if bills already exist for this period
    const existingBills = await Bill.find({
      societyName: admin.societyName,
      'billingPeriod.month': month,
      'billingPeriod.year': year,
      billType
    });

    if (existingBills.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Bills already exist for this period and bill type'
      });
    }

    const bills = [];
    const errors = [];

    for (const resident of residents) {
      try {
        // Check loyalty eligibility for discount
        const loyaltyDiscount = await checkLoyaltyEligibility(resident._id);

        // Generate unique bill number
        const billNumber = await Bill.generateBillNumber(admin.societyName, year, month);

        // Calculate amount components
        const taxes = additionalCharges.taxes || 0;
        const lateFee = additionalCharges.lateFee || 0;
        const otherCharges = additionalCharges.otherCharges || 0;
        const discount = loyaltyDiscount.discount || 0;

        const billData = {
          billNumber,
          residentId: resident._id,
          flatNumber: resident.flatNumber,
          building: resident.building || '', // Handle cases where building might be undefined
          societyName: admin.societyName,
          billType,
          billingPeriod: { month, year },
          amount: {
            baseAmount,
            taxes,
            lateFee,
            otherCharges,
            discount
            // totalAmount will be calculated by pre-save middleware
          },
          dueDate: new Date(dueDate),
          generatedBy: adminId,
          status: 'pending',
          paymentStatus: 'unpaid'
        };

        const bill = new Bill(billData);
        await bill.save();
        bills.push(bill);

        // Send notification email
        try {
          await sendBillNotification(resident.email, bill);
        } catch (emailError) {
          console.error(`Failed to send email to ${resident.email}:`, emailError);
        }

      } catch (error) {
        errors.push({
          residentId: resident._id,
          flatNumber: resident.flatNumber,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Generated ${bills.length} bills successfully`,
      data: {
        generated: bills.length,
        errors: errors.length,
        bills: bills.map(bill => ({
          billNumber: bill.billNumber,
          flatNumber: bill.flatNumber,
          amount: bill.amount.totalAmount
        })),
        errors
      }
    });

  } catch (error) {
    console.error('Bulk bill generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during bulk bill generation'
    });
  }
};

// Get all bills for admin dashboard
export const getAllBills = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { 
      page = 1, 
      limit = 20, 
      status, 
      billType, 
      month, 
      year,
      flatNumber 
    } = req.query;

    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Build filter
    const filter = { societyName: admin.societyName };
    
    if (status) filter.status = status;
    if (billType) filter.billType = billType;
    if (flatNumber) filter.flatNumber = flatNumber;
    if (month && year) {
      filter['billingPeriod.month'] = parseInt(month);
      filter['billingPeriod.year'] = parseInt(year);
    }

    // Get bills with pagination
    const bills = await Bill.find(filter)
      .populate('residentId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Bill.countDocuments(filter);

    // Get summary statistics
    const summary = await Bill.aggregate([
      { $match: { societyName: admin.societyName } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        bills,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalBills: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        },
        summary: summary.reduce((acc, item) => {
          acc[item._id] = {
            count: item.count,
            totalAmount: item.totalAmount
          };
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Get all bills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bills'
    });
  }
};

// Update bill details
export const updateBill = async (req, res) => {
  try {
    const { billId } = req.params;
    const adminId = req.user.id;
    const updateData = req.body;

    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const bill = await Bill.findOne({
      _id: billId,
      societyName: admin.societyName
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Prevent updating paid bills
    if (bill.status === 'paid' && updateData.amount) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify amount of paid bills'
      });
    }

    // Update bill
    Object.assign(bill, updateData);
    bill.modifiedBy = adminId;
    await bill.save();

    await bill.populate('residentId', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Bill updated successfully',
      data: bill
    });

  } catch (error) {
    console.error('Update bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bill'
    });
  }
};

// Delete bill
export const deleteBill = async (req, res) => {
  try {
    const { billId } = req.params;
    const adminId = req.user.id;

    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const bill = await Bill.findOne({
      _id: billId,
      societyName: admin.societyName
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Prevent deleting paid bills
    if (bill.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete paid bills'
      });
    }

    await Bill.findByIdAndDelete(billId);

    res.status(200).json({
      success: true,
      message: 'Bill deleted successfully'
    });

  } catch (error) {
    console.error('Delete bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete bill'
    });
  }
};

// Resident Controllers

// Get resident's bills
export const getResidentBills = async (req, res) => {
  try {
    const residentId = req.user._id; // Use _id instead of id
    const { 
      page = 1, 
      limit = 10, 
      status, 
      year,
      billType 
    } = req.query;

    const filter = { residentId };
    
    if (status) filter.status = status;
    if (billType) filter.billType = billType;
    if (year) filter['billingPeriod.year'] = parseInt(year);

    const bills = await Bill.find(filter)
      .sort({ 'billingPeriod.year': -1, 'billingPeriod.month': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Bill.countDocuments(filter);

    // Get payment summary
    const paymentSummary = await Payment.getResidentPaymentSummary(residentId);

    res.status(200).json({
      success: true,
      data: {
        bills,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalBills: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        },
        paymentSummary: paymentSummary[0] || {}
      }
    });

  } catch (error) {
    console.error('Get resident bills error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bills'
    });
  }
};

// Get single bill details
export const getBillDetails = async (req, res) => {
  try {
    const { billId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    let filter = { _id: billId };
    
    // Residents can only view their own bills
    if (userRole === 'resident') {
      filter.residentId = userId;
    } else if (userRole === 'admin') {
      const admin = await User.findById(userId);
      filter.societyName = admin.societyName;
    }

    const bill = await Bill.findOne(filter)
      .populate('residentId', 'name email phone flatNumber')
      .populate('generatedBy', 'name email')
      .populate('modifiedBy', 'name email');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Get related payments
    const payments = await Payment.find({ billId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        bill,
        payments
      }
    });

  } catch (error) {
    console.error('Get bill details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bill details'
    });
  }
};



// Payment Controllers

// Create Razorpay order for payment
export const createPaymentOrder = async (req, res) => {
  try {
    const { billId } = req.body;
    const residentId = req.user.id;

    const bill = await Bill.findOne({
      _id: billId,
      residentId,
      status: { $in: ['pending', 'overdue'] }
    });

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found or already paid'
      });
    }

    // Create Razorpay order
    const order = await createRazorpayOrder({
      amount: bill.remainingAmount, // This is a virtual field that calculates the remaining amount
      currency: 'INR',
      receipt: `bill_${bill.billNumber}`,
      notes: {
        billId: bill._id.toString(),
        residentId: residentId,
        flatNumber: bill.flatNumber
      }
    });

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        billDetails: {
          billNumber: bill.billNumber,
          dueDate: bill.dueDate,
          totalAmount: bill.amount.totalAmount, // Access the nested totalAmount field
          remainingAmount: bill.remainingAmount // Virtual field works correctly
        }
      }
    });

  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order'
    });
  }
};

// Verify and process payment
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      billId
    } = req.body;
    const residentId = req.user.id;

    // Verify payment with Razorpay
    const isValid = verifyRazorpayPayment({
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature: razorpay_signature
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    const bill = await Bill.findOne({
      _id: billId,
      residentId
    }).populate('residentId');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Create payment record
    const payment = new Payment({
      billId,
      residentId,
      flatNumber: bill.flatNumber,
      societyName: bill.societyName,
      amount: bill.remainingAmount, // This is a virtual field that calculates bill.amount.totalAmount - bill.paidAmount
      paymentMethod: 'razorpay_upi', // Can be determined from Razorpay webhook
      razorpayPaymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpaySignature: razorpay_signature,
      status: 'completed',
      paymentSource: 'web',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await payment.save();

    // Update bill status
    bill.status = 'paid';
    bill.paidAmount = bill.amount.totalAmount; // Access the nested totalAmount field
    bill.paidDate = new Date();
    await bill.save();

    // Apply loyalty discount for next eligible bill
    await applyLoyaltyDiscount(residentId);

    // Fetch the complete payment with bill details for response
    const completePayment = await Payment.findById(payment._id)
      .populate('billId', 'billNumber billingPeriod amount')
      .populate('residentId', 'name email flatNumber');

    res.status(200).json({
      success: true,
      message: 'Payment successful',
      data: {
        payment: {
          paymentId: completePayment.paymentId,
          receiptNumber: completePayment.receiptNumber,
          amount: completePayment.amount,
          paymentDate: completePayment.paymentDate,
          paymentMethod: completePayment.paymentMethod,
          razorpayPaymentId: completePayment.razorpayPaymentId,
          razorpayOrderId: completePayment.razorpayOrderId,
          status: completePayment.status
        },
        bill: {
          billNumber: bill.billNumber,
          billType: bill.billType,
          flatNumber: bill.flatNumber,
          societyName: bill.societyName,
          billingPeriod: bill.billingPeriod,
          amount: bill.amount,
          status: bill.status,
          paidDate: bill.paidDate
        }
      }
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
};

// Get payment history
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id; // Use _id instead of id
    const userRole = req.user.role;
    const { page = 1, limit = 10, status, flatNumber, month, year } = req.query;

    let filter = {};

    if (userRole === 'resident') {
      // Residents can only see their own payments
      filter.residentId = userId;
    } else if (userRole === 'admin') {
      // Admins can see all payments in their society
      const admin = await User.findById(userId);
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }
      filter.societyName = admin.societyName;
      
      // Apply additional filters for admin
      if (flatNumber) filter.flatNumber = flatNumber;
      if (month && year) {
        // Get payments for bills from specific month/year
        const bills = await Bill.find({
          societyName: admin.societyName,
          'billingPeriod.month': parseInt(month),
          'billingPeriod.year': parseInt(year)
        }).select('_id');
        filter.billId = { $in: bills.map(bill => bill._id) };
      }
    }

    if (status) filter.status = status;

    const payments = await Payment.find(filter)
      .populate('billId', 'billNumber billingPeriod billType flatNumber')
      .populate('residentId', 'firstName lastName flatNumber')
      .sort({ paymentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payment.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalPayments: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history'
    });
  }
};

// Send payment reminders (Admin only)
export const sendPaymentReminders = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { billIds } = req.body;

    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const bills = await Bill.find({
      _id: { $in: billIds },
      societyName: admin.societyName,
      status: { $in: ['pending', 'overdue'] }
    }).populate('residentId', 'name email');

    const results = [];
    
    for (const bill of bills) {
      try {
        await sendPaymentReminder(bill.residentId.email, bill);
        results.push({
          billId: bill._id,
          flatNumber: bill.flatNumber,
          status: 'sent'
        });
      } catch (error) {
        results.push({
          billId: bill._id,
          flatNumber: bill.flatNumber,
          status: 'failed',
          error: error.message
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Reminders processed',
      data: results
    });

  } catch (error) {
    console.error('Send payment reminders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reminders'
    });
  }
};

// Generate billing analytics
export const getBillingAnalytics = async (req, res) => {
  try {
    const { societyName, year, month } = req.query;

    if (!societyName || !year) {
      return res.status(400).json({
        success: false,
        message: 'Society name and year are required'
      });
    }

    // Build date filter
    const startDate = month 
      ? new Date(year, month - 1, 1)
      : new Date(year, 0, 1);
    
    const endDate = month 
      ? new Date(year, month, 0, 23, 59, 59)
      : new Date(year, 11, 31, 23, 59, 59);

    // Get bill analytics
    const billAnalytics = await Bill.aggregate([
      {
        $match: {
          societyName,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          paidAmount: { $sum: '$paidAmount' }
        }
      }
    ]);

    // Get payment analytics
    const paymentAnalytics = await Payment.getPaymentAnalytics(societyName, year, month || null);

    // Calculate collection efficiency
    const totalBilled = billAnalytics.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalCollected = billAnalytics.reduce((sum, item) => sum + (item.paidAmount || 0), 0);
    const collectionEfficiency = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;

    res.json({
      success: true,
      data: {
        billAnalytics,
        paymentAnalytics,
        summary: {
          totalBilled,
          totalCollected,
          pendingAmount: totalBilled - totalCollected,
          collectionEfficiency: Math.round(collectionEfficiency * 100) / 100
        },
        period: {
          year: parseInt(year),
          month: month ? parseInt(month) : null,
          startDate,
          endDate
        }
      }
    });

  } catch (error) {
    console.error('Error fetching billing analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin-specific billing analytics (automatically uses admin's society)
export const getAdminBillingAnalytics = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { year, month } = req.query;

    const admin = await User.findById(adminId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const societyName = admin.societyName;
    const currentYear = year || new Date().getFullYear();

    // Build date filter
    const startDate = month 
      ? new Date(currentYear, month - 1, 1)
      : new Date(currentYear, 0, 1);
    
    const endDate = month 
      ? new Date(currentYear, month, 0, 23, 59, 59)
      : new Date(currentYear, 11, 31, 23, 59, 59);

    // Get bill analytics
    const billAnalytics = await Bill.aggregate([
      {
        $match: {
          societyName,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount.totalAmount' },
          paidAmount: { $sum: '$paidAmount' }
        }
      }
    ]);

    // Get payment analytics
    const paymentAnalytics = await Payment.getPaymentAnalytics(societyName, currentYear, month || null);

    // Calculate collection efficiency
    const totalBilled = billAnalytics.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    const totalCollected = billAnalytics.reduce((sum, item) => sum + (item.paidAmount || 0), 0);
    const collectionEfficiency = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;

    // Get monthly breakdown for trends
    const monthlyData = await Bill.aggregate([
      {
        $match: {
          societyName,
          createdAt: { $gte: new Date(currentYear, 0, 1), $lte: new Date(currentYear, 11, 31, 23, 59, 59) }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          bills: { $sum: 1 },
          totalAmount: { $sum: '$amount.totalAmount' },
          paidAmount: { $sum: '$paidAmount' }
        }
      },
      {
        $sort: { '_id.month': 1 }
      }
    ]);

    // Get bill type breakdown
    const billTypeData = await Bill.aggregate([
      {
        $match: {
          societyName,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$billType',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount.totalAmount' },
          paidAmount: { $sum: '$paidAmount' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalBills: billAnalytics.reduce((sum, item) => sum + item.count, 0),
          totalAmount: totalBilled,
          collectedAmount: totalCollected,
          pendingAmount: totalBilled - totalCollected,
          collectionRate: Math.round(collectionEfficiency)
        },
        billAnalytics,
        paymentAnalytics,
        monthlyData,
        billTypeData,
        summary: {
          totalBilled,
          totalCollected,
          pendingAmount: totalBilled - totalCollected,
          collectionEfficiency: Math.round(collectionEfficiency * 100) / 100
        },
        period: {
          year: parseInt(currentYear),
          month: month ? parseInt(month) : null,
          startDate,
          endDate
        }
      }
    });

  } catch (error) {
    console.error('Error fetching admin billing analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Record manual payment (cash, cheque, bank transfer)
export const recordManualPayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { billId } = req.params;
    const paymentData = req.body;

    const bill = await Bill.findById(billId);
    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Create payment record
    const payment = new Payment({
      billId: billId,
      residentId: bill.residentId,
      flatNumber: bill.flatNumber,
      societyName: bill.societyName,
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      status: paymentData.paymentMethod === 'cheque' ? 'pending' : 'completed',
      description: paymentData.description,
      bankTransferDetails: paymentData.bankTransferDetails,
      chequeDetails: paymentData.chequeDetails,
      processedBy: req.user?.id,
      paymentSource: 'admin_portal',
      adminNotes: paymentData.adminNotes
    });

    await payment.save();

    // Update bill if payment is completed
    if (payment.status === 'completed') {
      const newPaidAmount = (bill.paidAmount || 0) + payment.amount;
      let newStatus = 'unpaid';
      
      if (newPaidAmount >= bill.totalAmount) {
        newStatus = 'paid';
      } else if (newPaidAmount > 0) {
        newStatus = 'partially_paid';
      }

      await Bill.findByIdAndUpdate(billId, {
        paidAmount: newPaidAmount,
        status: newStatus,
        lastPaymentDate: new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: payment
    });

  } catch (error) {
    console.error('Error recording manual payment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get payment history for a bill
export const getBillPayments = async (req, res) => {
  try {
    const { billId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Payment.find({ billId })
      .populate('processedBy', 'name')
      .populate('verifiedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments({ billId });

    res.json({
      success: true,
      data: payments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Error fetching bill payments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Generate bill PDF
export const generateBillPdf = async (req, res) => {
  try {
    const { billId } = req.params;

    const bill = await Bill.findById(billId)
      .populate('residentId', 'name email phone address');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    const pdfBuffer = await generatePDF('bill', { 
      bill, 
      resident: bill.residentId 
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=bill-${bill.billNumber}.pdf`);
    res.status(200).send(Buffer.from(pdfBuffer));

  } catch (error) {
    console.error('Error generating bill PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF',
      error: error.message
    });
  }
};

// Get billing summary for residents
export const getBillingSummary = async (req, res) => {
  try {
    const residentId = req.user.id;

    // Get all bills for the resident
    const bills = await Bill.find({ residentId });
    
    // Calculate summary statistics
    const totalPending = bills
      .filter(bill => bill.status === 'unpaid' || bill.status === 'overdue' || bill.status === 'partially_paid')
      .reduce((sum, bill) => sum + (bill.amount.totalAmount - (bill.paidAmount || 0)), 0);

    const totalPaid = bills
      .filter(bill => bill.status === 'paid')
      .reduce((sum, bill) => sum + bill.amount.totalAmount, 0);

    const overdueBills = bills.filter(bill => bill.status === 'overdue').length;

    // Calculate upcoming dues (bills due in the next 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingDues = bills.filter(bill => {
      const dueDate = new Date(bill.dueDate);
      return bill.status === 'unpaid' && dueDate <= thirtyDaysFromNow && dueDate > now;
    }).length;

    // Get recent payments
    const recentPayments = await Payment.find({ residentId })
      .sort({ paymentDate: -1 })
      .limit(5)
      .populate('billId', 'billNumber billType');

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalPending,
          totalPaid,
          upcomingDues,
          overdueBills
        },
        recentPayments: recentPayments.map(payment => ({
          id: payment._id,
          amount: payment.amount,
          paymentDate: payment.paymentDate,
          paymentMethod: payment.paymentMethod,
          status: payment.status,
          receiptNumber: payment.receiptNumber,
          billNumber: payment.billId?.billNumber,
          billType: payment.billId?.billType
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching billing summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch billing summary',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper Functions

// Check loyalty eligibility for discount
const checkLoyaltyEligibility = async (residentId) => {
  try {
    // Get payment history for the resident
    const payments = await Payment.find({ 
      residentId, 
      status: 'completed' 
    }).sort({ paymentDate: -1 }).limit(12);

    // Check for consecutive on-time payments (loyalty criteria)
    const onTimePayments = payments.filter(payment => {
      // Consider payment on-time if made within due date
      return payment.paymentDate <= payment.dueDate;
    });

    // Apply discount if resident has 6+ consecutive on-time payments
    const discount = onTimePayments.length >= 6 ? 500 : 0; // ₹500 discount
    
    return {
      discount,
      eligiblePayments: onTimePayments.length,
      isEligible: discount > 0
    };
  } catch (error) {
    console.error('Error checking loyalty eligibility:', error);
    return { discount: 0, eligiblePayments: 0, isEligible: false };
  }
};

// Send bill notification email
const sendBillNotification = async (email, bill) => {
  try {
    // This would integrate with email service (Nodemailer, etc.)
    // For now, just log the notification
    console.log(`Bill notification sent to ${email} for bill ${bill.billNumber}`);
    return true;
  } catch (error) {
    console.error('Email notification error:', error);
    throw error;
  }
};

// Send payment reminder email
const sendPaymentReminder = async (email, bill) => {
  try {
    // This would integrate with email service for payment reminders
    console.log(`Payment reminder sent to ${email} for bill ${bill.billNumber}`);
    return true;
  } catch (error) {
    console.error('Payment reminder error:', error);
    throw error;
  }
};

// Create Razorpay order
const createRazorpayOrder = async (orderData) => {
  try {
    const order = await razorpay.orders.create({
      amount: orderData.amount * 100, // Convert to paisa
      currency: orderData.currency || 'INR',
      receipt: orderData.receipt,
      notes: orderData.notes
    });
    return order;
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    throw error;
  }
};

// Verify Razorpay payment
const verifyRazorpayPayment = ({ order_id, payment_id, signature }) => {
  try {
    console.log('Verifying payment with:', { order_id, payment_id, signature });
    
    const body = order_id + "|" + payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");
    
    console.log('Expected signature:', expectedSignature);
    console.log('Received signature:', signature);
    console.log('Signatures match:', expectedSignature === signature);
    
    return expectedSignature === signature;
  } catch (error) {
    console.error('Payment verification error:', error);
    return false;
  }
};

// Apply loyalty discount for next bill
const applyLoyaltyDiscount = async (residentId) => {
  try {
    // Mark resident as eligible for loyalty discount on next bill
    await User.findByIdAndUpdate(residentId, {
      $set: { loyaltyDiscountEligible: true }
    });
    return true;
  } catch (error) {
    console.error('Error applying loyalty discount:', error);
    return false;
  }
};

// Create bill PDF
const createBillPDF = async (bill) => {
  try {
    // Use the new Puppeteer-based PDF service
    return await generatePDF('bill', { 
      bill, 
      resident: bill.residentId 
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};

// Get payment details by bill ID (for payment success page)
export const getPaymentByBillId = async (req, res) => {
  try {
    const { billId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Find the most recent completed payment for this bill
    let filter = { billId, status: 'completed' };
    
    // Residents can only view their own payments
    if (userRole === 'resident') {
      filter.residentId = userId;
    } else if (userRole === 'admin') {
      const admin = await User.findById(userId);
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }
      // Admin filter will be applied through bill population
    }

    const payment = await Payment.findOne(filter)
      .populate({
        path: 'billId',
        populate: {
          path: 'residentId',
          select: 'name email flatNumber'
        }
      })
      .sort({ paymentDate: -1 }); // Get the most recent payment

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'No completed payment found for this bill'
      });
    }

    // Check if admin is from the same society
    if (userRole === 'admin') {
      const admin = await User.findById(userId);
      if (payment.societyName !== admin.societyName) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        payment: {
          paymentId: payment.paymentId,
          receiptNumber: payment.receiptNumber,
          amount: payment.amount,
          paymentDate: payment.paymentDate,
          paymentMethod: payment.paymentMethod,
          razorpayPaymentId: payment.razorpayPaymentId,
          razorpayOrderId: payment.razorpayOrderId,
          status: payment.status
        },
        bill: {
          billNumber: payment.billId.billNumber,
          billType: payment.billId.billType,
          flatNumber: payment.billId.flatNumber,
          societyName: payment.billId.societyName,
          billingPeriod: payment.billId.billingPeriod,
          amount: payment.billId.amount,
          status: payment.billId.status,
          paidDate: payment.billId.paidDate
        }
      }
    });

  } catch (error) {
    console.error('Get payment by bill ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details'
    });
  }
};

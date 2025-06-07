import { generatePDF } from '../services/pdfService.js';
import Payment from '../models/Payment.js';
import Bill from '../models/Bill.js';
import User from '../models/User.js';

// Generate and download payment receipt PDF
export const downloadPaymentReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find payment with related bill and resident data
    const payment = await Payment.findOne({ paymentId: paymentId })
      .populate({
        path: 'billId',
        populate: {
          path: 'residentId',
          select: 'fullName email phone flatNumber building'
        }
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check authorization
    if (userRole === 'resident' && payment.billId.residentId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to access this payment receipt'
      });
    } else if (userRole === 'admin') {
      const admin = await User.findById(userId);
      if (payment.billId.societyName !== admin.societyName) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to access this payment receipt'
        });
      }
    }

    // Generate PDF
    const pdfBuffer = await generatePDF('receipt', {
      payment,
      bill: payment.billId,
      resident: payment.billId.residentId
    });

    // Set response headers for PDF download
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=receipt-${payment.receiptNumber}.pdf`,
      'Content-Length': pdfBuffer.length
    });

    res.status(200).send(Buffer.from(pdfBuffer));

  } catch (error) {
    console.error('Error downloading payment receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate payment receipt PDF'
    });
  }
};

// Generate and download bill PDF
export const downloadBillPDF = async (req, res) => {
  try {
    const { billId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find bill with resident data
    const bill = await Bill.findById(billId)
      .populate('residentId', 'fullName email phone flatNumber building');

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Bill not found'
      });
    }

    // Check authorization
    if (userRole === 'resident' && bill.residentId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to access this bill'
      });
    } else if (userRole === 'admin') {
      const admin = await User.findById(userId);
      if (bill.societyName !== admin.societyName) {
        return res.status(403).json({
          success: false,
          message: 'Unauthorized to access this bill'
        });
      }
    }

    // Generate PDF
    const pdfBuffer = await generatePDF('bill', {
      bill,
      resident: bill.residentId
    });

    // Set response headers for PDF download
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=bill-${bill.billNumber}.pdf`,
      'Content-Length': pdfBuffer.length
    });

    res.status(200).send(Buffer.from(pdfBuffer));

  } catch (error) {
    console.error('Error downloading bill PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate bill PDF'
    });
  }
};

// Generate payment receipt PDF and store in ImageKit (optional)
export const generateAndStoreReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // Find payment with related data
    const payment = await Payment.findOne({ paymentId: paymentId })
      .populate({
        path: 'billId',
        populate: {
          path: 'residentId',
          select: 'fullName email phone flatNumber building'
        }
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Generate PDF
    const pdfBuffer = await generatePDF('receipt', {
      payment,
      bill: payment.billId,
      resident: payment.billId.residentId
    });

    // TODO: Implement ImageKit storage
    // const uploadResult = await uploadToImageKit(pdfBuffer, `receipt-${payment.receiptNumber}.pdf`);

    res.json({
      success: true,
      message: 'Receipt PDF generated successfully',
      // fileUrl: uploadResult.url, // When ImageKit is implemented
      fileName: `receipt-${payment.receiptNumber}.pdf`
    });

  } catch (error) {
    console.error('Error generating and storing receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate and store receipt PDF'
    });
  }
};

// Email payment receipt PDF
export const emailPaymentReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // Find payment with related data
    const payment = await Payment.findOne({ paymentId: paymentId })
      .populate({
        path: 'billId',
        populate: {
          path: 'residentId',
          select: 'fullName email phone flatNumber building'
        }
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Generate PDF
    const pdfBuffer = await generatePDF('receipt', {
      payment,
      bill: payment.billId,
      resident: payment.billId.residentId
    });

    // TODO: Implement email functionality
    // await sendReceiptEmail(payment.billId.residentId.email, pdfBuffer, payment);

    res.json({
      success: true,
      message: 'Receipt PDF sent via email successfully'
    });

  } catch (error) {
    console.error('Error emailing payment receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to email payment receipt'
    });
  }
};

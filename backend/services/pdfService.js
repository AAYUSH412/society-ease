import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Main PDF generation function
export const generatePDF = async (type, data) => {
  let browser;
  try {
    // Launch Puppeteer browser
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    let htmlContent;
    
    switch (type) {
      case 'receipt':
        htmlContent = generateReceiptHTML(data);
        break;
      case 'bill':
        htmlContent = generateBillHTML(data);
        break;
      default:
        throw new Error('Invalid PDF type');
    }

    // Set page content
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    return pdfBuffer;

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// Generate Payment Receipt HTML (matches payment success page styling)
const generateReceiptHTML = ({ payment, bill, resident }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const paymentAmount = Number(payment.amount) || 0;
  const paymentDate = new Date(payment.paymentDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const billingPeriod = new Date(bill.billingPeriod.year, bill.billingPeriod.month - 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Receipt - ${payment.receiptNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #374151;
          background-color: #f9fafb;
          padding: 20px;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .header {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        
        .success-icon {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
        }
        
        .header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .header p {
          font-size: 16px;
          opacity: 0.9;
        }
        
        .content {
          padding: 30px;
        }
        
        .section {
          background: #f9fafb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .section h3 {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 12px;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .detail-row:last-child {
          border-bottom: none;
        }
        
        .detail-label {
          color: #6b7280;
          font-size: 14px;
        }
        
        .detail-value {
          font-weight: 500;
          color: #111827;
          font-size: 14px;
        }
        
        .amount-breakdown {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
        }
        
        .amount-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 12px;
          color: #6b7280;
        }
        
        .amount-row.discount {
          color: #059669;
        }
        
        .total-amount {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-top: 1px solid #e5e7eb;
          margin-top: 8px;
          font-weight: 600;
        }
        
        .total-amount .amount {
          font-size: 18px;
          font-weight: 700;
          color: #059669;
        }
        
        .next-steps {
          background: #eff6ff;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .next-steps h3 {
          color: #1e40af;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 12px;
        }
        
        .next-steps ul {
          list-style: none;
          color: #1e40af;
        }
        
        .next-steps li {
          padding: 4px 0;
          font-size: 14px;
        }
        
        .footer {
          text-align: center;
          padding: 20px 30px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        
        .company-info {
          margin-bottom: 20px;
        }
        
        .company-name {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 4px;
        }
        
        .society-name {
          font-size: 18px;
          color: #059669;
          font-weight: 600;
        }
        
        @media print {
          body {
            background: white;
            padding: 0;
          }
          
          .container {
            box-shadow: none;
            border-radius: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="success-icon">✓</div>
          <h1>Payment Successful!</h1>
          <p>Your payment has been processed and your bill has been updated.</p>
        </div>
        
        <div class="content">
          <div class="company-info">
            <div class="company-name">SocietyEase</div>
            <div class="society-name">${bill.societyName}</div>
          </div>
          
          <div class="section">
            <h3>Payment Details</h3>
            <div class="detail-row">
              <span class="detail-label">Receipt Number:</span>
              <span class="detail-value">#${payment.receiptNumber}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment ID:</span>
              <span class="detail-value">${payment.paymentId || payment._id}</span>
            </div>
            ${payment.razorpayPaymentId ? `
            <div class="detail-row">
              <span class="detail-label">Transaction ID:</span>
              <span class="detail-value">${payment.razorpayPaymentId}</span>
            </div>` : ''}
            <div class="detail-row">
              <span class="detail-label">Payment Method:</span>
              <span class="detail-value" style="text-transform: capitalize;">${payment.paymentMethod}</span>
            </div>
            
            <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
              <h4 style="font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 12px;">Bill Details</h4>
              <div class="detail-row">
                <span class="detail-label">Bill Number:</span>
                <span class="detail-value">#${bill.billNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Bill Type:</span>
                <span class="detail-value" style="text-transform: capitalize;">${bill.billType.replace('_', ' ')}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Flat Number:</span>
                <span class="detail-value">${bill.flatNumber}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Billing Period:</span>
                <span class="detail-value">${billingPeriod}</span>
              </div>
            </div>
            
            <div class="amount-breakdown">
              <div class="amount-row">
                <span>Base Amount:</span>
                <span>${formatCurrency(bill.amount.baseAmount)}</span>
              </div>
              ${bill.amount.taxes > 0 ? `
              <div class="amount-row">
                <span>Taxes:</span>
                <span>${formatCurrency(bill.amount.taxes)}</span>
              </div>` : ''}
              ${bill.amount.lateFee > 0 ? `
              <div class="amount-row">
                <span>Late Fee:</span>
                <span>${formatCurrency(bill.amount.lateFee)}</span>
              </div>` : ''}
              ${bill.amount.otherCharges > 0 ? `
              <div class="amount-row">
                <span>Other Charges:</span>
                <span>${formatCurrency(bill.amount.otherCharges)}</span>
              </div>` : ''}
              ${bill.amount.discount > 0 ? `
              <div class="amount-row discount">
                <span>Discount:</span>
                <span>-${formatCurrency(bill.amount.discount)}</span>
              </div>` : ''}
            </div>
            
            <div class="total-amount">
              <span>Amount Paid:</span>
              <span class="amount">${formatCurrency(paymentAmount)}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">Payment Date:</span>
              <span class="detail-value">${paymentDate}</span>
            </div>
          </div>
          
          <div class="next-steps">
            <h3>What's Next?</h3>
            <ul>
              <li>• You will receive a payment confirmation email shortly</li>
              <li>• Your bill status has been updated to "Paid"</li>
              <li>• This receipt serves as proof of payment</li>
              <li>• Check your billing dashboard for updated information</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>Need help? Contact our support team at 
            <a href="mailto:support@societyease.com" style="color: #2563eb;">support@societyease.com</a>
          </p>
          <p style="margin-top: 8px; font-size: 12px;">
            This is a computer-generated receipt and does not require a signature.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate Bill HTML
const generateBillHTML = ({ bill, resident }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const dueDate = new Date(bill.dueDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const billDate = new Date(bill.createdAt || bill.generatedDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const billingPeriod = new Date(bill.billingPeriod.year, bill.billingPeriod.month - 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric'
  });

  const totalAmount = bill.amount.totalAmount || 
    (bill.amount.baseAmount + bill.amount.taxes + bill.amount.lateFee + bill.amount.otherCharges - bill.amount.discount);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bill - ${bill.billNumber}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #374151;
          background-color: #f9fafb;
          padding: 20px;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .header {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        
        .bill-icon {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 30px;
        }
        
        .header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        
        .header p {
          font-size: 16px;
          opacity: 0.9;
        }
        
        .content {
          padding: 30px;
        }
        
        .section {
          background: #f9fafb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .section h3 {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 12px;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .detail-row:last-child {
          border-bottom: none;
        }
        
        .detail-label {
          color: #6b7280;
          font-size: 14px;
        }
        
        .detail-value {
          font-weight: 500;
          color: #111827;
          font-size: 14px;
        }
        
        .amount-breakdown {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
        }
        
        .amount-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 14px;
        }
        
        .amount-row.discount {
          color: #059669;
        }
        
        .total-amount {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-top: 2px solid #e5e7eb;
          margin-top: 12px;
          font-weight: 600;
          font-size: 18px;
        }
        
        .total-amount .amount {
          font-size: 24px;
          font-weight: 700;
          color: #dc2626;
        }
        
        .status {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        
        .status.pending {
          background: #fef3c7;
          color: #92400e;
        }
        
        .status.paid {
          background: #d1fae5;
          color: #065f46;
        }
        
        .status.overdue {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .footer {
          text-align: center;
          padding: 20px 30px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        
        .company-info {
          margin-bottom: 20px;
        }
        
        .company-name {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 4px;
        }
        
        .society-name {
          font-size: 18px;
          color: #2563eb;
          font-weight: 600;
        }
        
        .due-date-warning {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
          color: #dc2626;
          text-align: center;
        }
        
        @media print {
          body {
            background: white;
            padding: 0;
          }
          
          .container {
            box-shadow: none;
            border-radius: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="bill-icon">📄</div>
          <h1>Maintenance Bill</h1>
          <p>Bill Number: #${bill.billNumber}</p>
        </div>
        
        <div class="content">
          <div class="company-info">
            <div class="company-name">SocietyEase</div>
            <div class="society-name">${bill.societyName}</div>
          </div>
          
          ${bill.status === 'pending' && new Date(bill.dueDate) < new Date() ? `
          <div class="due-date-warning">
            <strong>⚠️ Payment Overdue</strong><br>
            This bill was due on ${dueDate}. Please make payment immediately to avoid additional charges.
          </div>` : ''}
          
          <div class="section">
            <h3>Bill Information</h3>
            <div class="detail-row">
              <span class="detail-label">Bill Number:</span>
              <span class="detail-value">#${bill.billNumber}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Bill Type:</span>
              <span class="detail-value" style="text-transform: capitalize;">${bill.billType.replace('_', ' ')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Billing Period:</span>
              <span class="detail-value">${billingPeriod}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Bill Date:</span>
              <span class="detail-value">${billDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Due Date:</span>
              <span class="detail-value">${dueDate}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value">
                <span class="status ${bill.status}">${bill.status}</span>
              </span>
            </div>
          </div>
          
          <div class="section">
            <h3>Resident Details</h3>
            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <span class="detail-value">${resident.fullName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Flat Number:</span>
              <span class="detail-value">${bill.flatNumber}</span>
            </div>
            ${resident.building ? `
            <div class="detail-row">
              <span class="detail-label">Building:</span>
              <span class="detail-value">${resident.building}</span>
            </div>` : ''}
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">${resident.email}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span class="detail-value">${resident.phone}</span>
            </div>
          </div>
          
          <div class="section">
            <h3>Bill Details</h3>
            <div class="amount-breakdown">
              <div class="amount-row">
                <span>Base Amount:</span>
                <span>${formatCurrency(bill.amount.baseAmount)}</span>
              </div>
              ${bill.amount.taxes > 0 ? `
              <div class="amount-row">
                <span>Taxes:</span>
                <span>${formatCurrency(bill.amount.taxes)}</span>
              </div>` : ''}
              ${bill.amount.lateFee > 0 ? `
              <div class="amount-row">
                <span>Late Fee:</span>
                <span>${formatCurrency(bill.amount.lateFee)}</span>
              </div>` : ''}
              ${bill.amount.otherCharges > 0 ? `
              <div class="amount-row">
                <span>Other Charges:</span>
                <span>${formatCurrency(bill.amount.otherCharges)}</span>
              </div>` : ''}
              ${bill.amount.discount > 0 ? `
              <div class="amount-row discount">
                <span>Discount:</span>
                <span>-${formatCurrency(bill.amount.discount)}</span>
              </div>` : ''}
            </div>
            
            <div class="total-amount">
              <span>Total Amount:</span>
              <span class="amount">${formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>For payment inquiries, contact: 
            <a href="mailto:billing@societyease.com" style="color: #2563eb;">billing@societyease.com</a>
          </p>
          <p style="margin-top: 8px; font-size: 12px;">
            This is a computer-generated bill and does not require a signature.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

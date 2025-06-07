import mongoose from 'mongoose';

const pdfSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['bill', 'receipt'],
    index: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'referenceModel',
    index: true
  },
  referenceModel: {
    type: String,
    required: true,
    enum: ['Bill', 'Payment']
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  filePath: {
    type: String, // For ImageKit URL or local storage path
    required: false
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  generationMethod: {
    type: String,
    default: 'puppeteer',
    enum: ['puppeteer', 'html-pdf-node']
  },
  metadata: {
    societyName: String,
    residentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    billNumber: String,
    receiptNumber: String,
    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  status: {
    type: String,
    default: 'generated',
    enum: ['generated', 'stored', 'emailed', 'failed']
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastDownloadedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
pdfSchema.index({ type: 1, referenceId: 1 });
pdfSchema.index({ generatedBy: 1, createdAt: -1 });
pdfSchema.index({ 'metadata.societyName': 1, type: 1 });
pdfSchema.index({ 'metadata.residentId': 1, type: 1 });

// Static method to log PDF generation
pdfSchema.statics.logGeneration = async function(pdfData) {
  try {
    const pdf = new this(pdfData);
    await pdf.save();
    return pdf;
  } catch (error) {
    console.error('Error logging PDF generation:', error);
    throw error;
  }
};

// Instance method to update download count
pdfSchema.methods.recordDownload = async function() {
  this.downloadCount += 1;
  this.lastDownloadedAt = new Date();
  await this.save();
};

// Instance method to mark as emailed
pdfSchema.methods.markAsEmailed = async function() {
  this.emailSent = true;
  this.status = 'emailed';
  await this.save();
};

// Instance method to update file path (for ImageKit storage)
pdfSchema.methods.updateFilePath = async function(filePath) {
  this.filePath = filePath;
  this.status = 'stored';
  await this.save();
};

export default mongoose.model('PDF', pdfSchema);

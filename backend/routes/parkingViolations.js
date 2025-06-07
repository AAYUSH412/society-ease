import express from 'express';
import { 
  reportViolation,
  getMyReports,
  getViolationsAgainstMe,
  updateViolationReport,
  uploadViolationPhotos,
  deleteViolationPhoto
} from '../controllers/parkingViolationController.js';
import { auth } from '../middleware/auth.js';
import { validateViolationReport, validateViolationUpdate } from '../middleware/validation.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Resident Routes
router.post('/report', auth, upload.array('photos', 5), validateViolationReport, reportViolation);
router.get('/my-reports', auth, getMyReports);
router.get('/against-me', auth, getViolationsAgainstMe);
router.put('/update/:id', auth, validateViolationUpdate, updateViolationReport);

// Photo management routes
router.post('/photos/:id', auth, upload.array('photos', 5), uploadViolationPhotos);
router.delete('/photos/:violationId/:photoId', auth, deleteViolationPhoto);

export default router;

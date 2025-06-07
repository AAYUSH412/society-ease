// Central export file for all database models
import UserModel from './User.js';
import BillModel from './Bill.js';
import PaymentModel from './Payment.js';
import PDFModel from './PDF.js';
import AlertModel from './Alert.js';
import NotificationModel from './Notification.js';
import ParkingViolationModel from './ParkingViolation.js';
import ViolationCategoryModel from './ViolationCategory.js';
import ViolationFineModel from './ViolationFine.js';

// Named exports
export { default as User } from './User.js';
export { default as Bill } from './Bill.js';
export { default as Payment } from './Payment.js';
export { default as PDF } from './PDF.js';
export { default as Alert } from './Alert.js';
export { default as Notification } from './Notification.js';
export { default as ParkingViolation } from './ParkingViolation.js';
export { default as ViolationCategory } from './ViolationCategory.js';
export { default as ViolationFine } from './ViolationFine.js';

// Default export for convenience
export default {
  User: UserModel,
  Bill: BillModel,
  Payment: PaymentModel,
  PDF: PDFModel,
  Alert: AlertModel,
  Notification: NotificationModel,
  ParkingViolation: ParkingViolationModel,
  ViolationCategory: ViolationCategoryModel,
  ViolationFine: ViolationFineModel
};

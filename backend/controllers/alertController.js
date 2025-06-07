import Alert from '../models/Alert.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { sendEmail } from '../config/nodemailer.js';
import { alertEmailTemplate, alertUpdateTemplate, alertResolutionTemplate } from '../utils/emailTemplates.js';

// Create new alert (Admin and Residents)
export const createAlert = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      subType,
      priority,
      estimatedResolutionTime,
      scheduledTime,
      visibility,
      tags,
      autoClose
    } = req.body;

    // Validation
    if (!title || !description || !type || !estimatedResolutionTime) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: title, description, type, estimatedResolutionTime'
      });
    }

    // Validate alert type
    const validTypes = ['water', 'electricity', 'gas', 'general', 'maintenance', 'security', 'internet'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid alert type. Must be one of: water, electricity, gas, general, maintenance, security, internet'
      });
    }

    // Ensure estimatedResolutionTime is in the future
    if (new Date(estimatedResolutionTime) <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Estimated resolution time must be in the future'
      });
    }

    // Set default priority based on user role
    let alertPriority = priority || 'medium';
    
    // Residents can only create medium or high priority alerts
    if (req.user.role === 'resident' && ['critical'].includes(alertPriority)) {
      alertPriority = 'high'; // Auto-adjust critical to high for residents
    }

    // Create alert
    const alert = new Alert({
      title,
      description,
      type,
      subType,
      priority: alertPriority,
      estimatedResolutionTime: new Date(estimatedResolutionTime),
      scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
      createdBy: {
        userId: req.user._id,
        userRole: req.user.role,
        userName: `${req.user.firstName} ${req.user.lastName}`,
        userContact: {
          email: req.user.email,
          phone: req.user.phone
        }
      },
      visibility: {
        scope: visibility?.scope || 'all',
        affectedAreas: visibility?.affectedAreas || {},
        societyName: req.user.societyName
      },
      tags: tags || [],
      autoClose: autoClose || { enabled: false }
    });

    await alert.save();

    // Send notifications to affected residents
    await sendAlertNotifications(alert, 'alert_created');

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: alert
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating alert',
      error: error.message
    });
  }
};

// Get all alerts with filters (Admin/Resident)
export const getAlerts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      priority,
      search,
      sortBy = 'createdDate',
      sortOrder = 'desc',
      dateFrom,
      dateTo
    } = req.query;

    // Build query based on user role
    let query = {};

    if (req.user.role === 'resident') {
      // For residents, only show alerts visible to them
      query = {
        'visibility.societyName': req.user.societyName,
        $or: [
          { 'visibility.scope': 'all' },
          { 
            'visibility.scope': 'specific_buildings',
            'visibility.affectedAreas.buildings': req.user.building
          },
          {
            'visibility.scope': 'specific_flats',
            'visibility.affectedAreas.flats': {
              $elemMatch: {
                flatNumber: req.user.flatNumber,
                building: req.user.building
              }
            }
          }
        ]
      };
    } else {
      // For admins, show all alerts in their society
      query['visibility.societyName'] = req.user.societyName;
    }

    // Apply filters
    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;

    if (search) {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      });
    }

    if (dateFrom || dateTo) {
      query.createdDate = {};
      if (dateFrom) query.createdDate.$gte = new Date(dateFrom);
      if (dateTo) query.createdDate.$lte = new Date(dateTo);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const alerts = await Alert.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy.userId', 'firstName lastName email')
      .populate('updates.updatedBy.userId', 'firstName lastName')
      .lean();

    const totalAlerts = await Alert.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        alerts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalAlerts / parseInt(limit)),
          totalAlerts,
          hasNextPage: parseInt(page) < Math.ceil(totalAlerts / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts',
      error: error.message
    });
  }
};

// Get single alert details
export const getAlert = async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await Alert.findOne({ alertId })
      .populate('createdBy.userId', 'firstName lastName email phone')
      .populate('updates.updatedBy.userId', 'firstName lastName')
      .populate('resolution.resolvedBy.userId', 'firstName lastName')
      .populate('escalation.escalatedBy', 'firstName lastName');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Check if resident can access this alert
    if (req.user.role === 'resident') {
      const canAccess = await checkResidentAccess(alert, req.user);
      if (!canAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this alert'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Error fetching alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alert',
      error: error.message
    });
  }
};

// Update alert (Admin only)
export const updateAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const updates = req.body;

    const alert = await Alert.findOne({ alertId });
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Check society access
    if (alert.visibility.societyName !== req.user.societyName) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Prevent updating resolved alerts unless changing status back
    if (alert.status === 'resolved' && updates.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update resolved alert'
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'title', 'description', 'priority', 'estimatedResolutionTime',
      'visibility', 'tags', 'autoClose'
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        alert[field] = updates[field];
      }
    });

    await alert.save();

    // Send update notifications if significant changes
    if (updates.priority || updates.estimatedResolutionTime || updates.description) {
      await sendAlertNotifications(alert, 'update');
    }

    res.status(200).json({
      success: true,
      message: 'Alert updated successfully',
      data: alert
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating alert',
      error: error.message
    });
  }
};

// Add update to alert (Admin/Resident - based on permissions)
export const addAlertUpdate = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { message, updateType, attachments } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Update message is required'
      });
    }

    const alert = await Alert.findOne({ alertId });
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Check access
    if (req.user.role === 'resident') {
      const canAccess = await checkResidentAccess(alert, req.user);
      if (!canAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } else if (alert.visibility.societyName !== req.user.societyName) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const update = await alert.addUpdate({
      message,
      updateType: updateType || 'general',
      updatedBy: {
        userId: req.user._id,
        userName: `${req.user.firstName} ${req.user.lastName}`,
        userRole: req.user.role
      },
      attachments: attachments || []
    });

    // Send notification for important updates
    if (updateType === 'progress' || updateType === 'delay' || updateType === 'escalation') {
      await sendAlertNotifications(alert, 'update');
    }

    res.status(200).json({
      success: true,
      message: 'Update added successfully',
      data: update
    });
  } catch (error) {
    console.error('Error adding alert update:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding update',
      error: error.message
    });
  }
};

// Resolve alert (Admin or Alert Creator)
export const resolveAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { resolutionNotes, resolutionProof } = req.body;

    const alert = await Alert.findOne({ alertId });
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Check society access
    if (alert.visibility.societyName !== req.user.societyName) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if user can resolve this alert (Admin or Alert Creator)
    const canResolve = req.user.role === 'admin' || 
                      alert.createdBy.userId.toString() === req.user._id.toString();
    
    if (!canResolve) {
      return res.status(403).json({
        success: false,
        message: 'Only admin or alert creator can resolve this alert'
      });
    }

    if (alert.status === 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'Alert is already resolved'
      });
    }

    await alert.resolveAlert({
      resolvedBy: {
        userId: req.user._id,
        userName: `${req.user.firstName} ${req.user.lastName}`,
        userRole: req.user.role
      },
      resolutionNotes: resolutionNotes || 'Alert resolved',
      resolutionProof: resolutionProof || []
    });

    // Send resolution notifications
    await sendAlertNotifications(alert, 'resolved');

    res.status(200).json({
      success: true,
      message: 'Alert resolved successfully',
      data: alert
    });
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error resolving alert',
      error: error.message
    });
  }
};

// Escalate alert (Admin/Resident)
export const escalateAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Escalation reason is required'
      });
    }

    const alert = await Alert.findOne({ alertId });
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Check access
    if (req.user.role === 'resident') {
      const canAccess = await checkResidentAccess(alert, req.user);
      if (!canAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } else if (alert.visibility.societyName !== req.user.societyName) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (alert.status === 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot escalate resolved alert'
      });
    }

    await alert.escalateAlert({
      escalatedBy: req.user._id,
      reason
    });

    // Add escalation update
    await alert.addUpdate({
      message: `Alert escalated: ${reason}`,
      updateType: 'escalation',
      updatedBy: {
        userId: req.user._id,
        userName: `${req.user.firstName} ${req.user.lastName}`,
        userRole: req.user.role
      }
    });

    // Send escalation notifications
    await sendAlertNotifications(alert, 'escalated');

    res.status(200).json({
      success: true,
      message: 'Alert escalated successfully',
      data: alert
    });
  } catch (error) {
    console.error('Error escalating alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error escalating alert',
      error: error.message
    });
  }
};

// Delete alert (Admin only)
export const deleteAlert = async (req, res) => {
  try {
    const { alertId } = req.params;

    const alert = await Alert.findOne({ alertId });
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    // Check society access
    if (alert.visibility.societyName !== req.user.societyName) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Soft delete by setting isActive to false
    alert.isActive = false;
    await alert.save();

    res.status(200).json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting alert',
      error: error.message
    });
  }
};

// Get alert statistics (Admin only)
export const getAlertStatistics = async (req, res) => {
  try {
    const { dateFrom, dateTo } = req.query;
    
    let dateRange = null;
    if (dateFrom && dateTo) {
      dateRange = {
        startDate: new Date(dateFrom),
        endDate: new Date(dateTo)
      };
    }

    const stats = await Alert.getAlertStatistics(req.user.societyName, dateRange);

    res.status(200).json({
      success: true,
      data: stats[0] || {
        totalAlerts: 0,
        activeAlerts: 0,
        resolvedAlerts: 0,
        criticalAlerts: 0,
        overdueAlerts: 0,
        avgResolutionTime: 0
      }
    });
  } catch (error) {
    console.error('Error fetching alert statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// Get active alerts for resident dashboard
export const getActiveAlertsForResident = async (req, res) => {
  try {
    const alerts = await Alert.getActiveAlertsForResident({
      flatNumber: req.user.flatNumber,
      building: req.user.building,
      societyName: req.user.societyName
    });

    res.status(200).json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching active alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active alerts',
      error: error.message
    });
  }
};

// Helper function to check if resident can access alert
const checkResidentAccess = async (alert, user) => {
  if (alert.visibility.societyName !== user.societyName) {
    return false;
  }

  switch (alert.visibility.scope) {
    case 'all':
      return true;
    case 'specific_buildings':
      return alert.visibility.affectedAreas.buildings.includes(user.building);
    case 'specific_flats':
      return alert.visibility.affectedAreas.flats.some(
        flat => flat.flatNumber === user.flatNumber && flat.building === user.building
      );
    case 'specific_areas':
      // For areas, we assume all residents can see area-specific alerts
      return true;
    default:
      return false;
  }
};

// Helper function to send alert notifications
const sendAlertNotifications = async (alert, type) => {
  try {
    // Get affected residents based on visibility
    let query = {
      societyName: alert.visibility.societyName,
      status: 'approved',
      role: 'resident'
    };

    switch (alert.visibility.scope) {
      case 'specific_buildings':
        query.building = { $in: alert.visibility.affectedAreas.buildings };
        break;
      case 'specific_flats':
        query.$or = alert.visibility.affectedAreas.flats.map(flat => ({
          flatNumber: flat.flatNumber,
          building: flat.building
        }));
        break;
      // For 'all' and 'specific_areas', query remains as is
    }

    const residents = await User.find(query).select('email firstName lastName');

    // Create email template based on type
    let emailTemplate, subject;
    switch (type) {
      case 'new':
        subject = `New Alert: ${alert.title}`;
        emailTemplate = alertEmailTemplate(alert, 'new');
        break;
      case 'update':
        subject = `Alert Update: ${alert.title}`;
        emailTemplate = alertUpdateTemplate(alert);
        break;
      case 'resolved':
        subject = `Alert Resolved: ${alert.title}`;
        emailTemplate = alertResolutionTemplate(alert);
        break;
      case 'escalated':
        subject = `Alert Escalated: ${alert.title}`;
        emailTemplate = alertEmailTemplate(alert, 'escalated');
        break;
      default:
        return;
    }

    // Send notifications to all affected residents
    for (const resident of residents) {
      try {
        // Create notification record
        const notification = new Notification({
          recipientEmail: resident.email,
          recipientName: `${resident.firstName} ${resident.lastName}`,
          subject,
          content: emailTemplate.text,
          htmlContent: emailTemplate.html,
          priority: alert.priority,
          relatedAlert: alert._id,
          metadata: {
            alertId: alert.alertId,
            alertType: alert.type,
            notificationType: type
          }
        });

        await notification.save();

        // Send email
        await sendEmail({
          to: resident.email,
          subject,
          text: emailTemplate.text,
          html: emailTemplate.html
        });

        // Update notification status
        await notification.markAsSent();
      } catch (emailError) {
        console.error(`Error sending notification to ${resident.email}:`, emailError);
      }
    }
  } catch (error) {
    console.error('Error sending alert notifications:', error);
  }
};

export default {
  createAlert,
  getAlerts,
  getAlert,
  updateAlert,
  addAlertUpdate,
  resolveAlert,
  escalateAlert,
  deleteAlert,
  getAlertStatistics,
  getActiveAlertsForResident
};

import User from '../models/User.js';
import Alert from '../models/Alert.js';
import Notification from '../models/Notification.js';

export class AlertUtils {
  
  /**
   * Get affected residents based on alert visibility settings
   * @param {Object} alert - Alert document
   * @returns {Array} Array of resident IDs
   */
  static async getAffectedResidents(alert) {
    const { visibility } = alert;
    let query = {
      societyName: visibility.societyName,
      status: 'approved',
      role: 'resident'
    };

    switch (visibility.scope) {
      case 'all':
        // All residents in the society
        break;
        
      case 'specific_buildings':
        if (visibility.affectedAreas.buildings.length > 0) {
          query.building = { $in: visibility.affectedAreas.buildings };
        }
        break;
        
      case 'specific_flats':
        if (visibility.affectedAreas.flats.length > 0) {
          const flatQueries = visibility.affectedAreas.flats.map(flat => ({
            flatNumber: flat.flatNumber,
            building: flat.building || { $exists: true }
          }));
          query.$or = flatQueries;
        }
        break;
        
      case 'specific_areas':
        // For area-specific alerts, we might need additional logic
        // depending on how areas are mapped to residents
        break;
    }

    return await User.find(query).select('_id email phone flatNumber building firstName lastName');
  }

  /**
   * Calculate alert priority score for sorting
   * @param {Object} alert - Alert document
   * @returns {Number} Priority score
   */
  static calculatePriorityScore(alert) {
    const priorityScores = {
      critical: 100,
      high: 75,
      medium: 50,
      low: 25
    };

    let score = priorityScores[alert.priority] || 0;

    // Increase score for overdue alerts
    if (alert.isOverdue) {
      score += 20;
    }

    // Increase score for escalated alerts
    if (alert.escalation.isEscalated) {
      score += (alert.escalation.escalationLevel * 10);
    }

    // Decrease score for older alerts (to prioritize recent ones of same priority)
    const ageInHours = (Date.now() - alert.createdDate) / (1000 * 60 * 60);
    if (ageInHours > 24) {
      score -= Math.min(10, Math.floor(ageInHours / 24));
    }

    return Math.max(0, score);
  }

  /**
   * Generate alert notification content
   * @param {Object} alert - Alert document
   * @param {String} notificationType - Type of notification
   * @param {Object} recipient - Recipient user data
   * @returns {Object} Notification content
   */
  static generateNotificationContent(alert, notificationType, recipient) {
    const priorityEmojis = {
      critical: '🚨',
      high: '⚠️',
      medium: 'ℹ️',
      low: '📝'
    };

    const typeEmojis = {
      water: '💧',
      electricity: '⚡',
      gas: '🔥',
      general: '📢',
      maintenance: '🔧',
      security: '🔒',
      internet: '🌐'
    };

    let subject, body;
    const emoji = `${priorityEmojis[alert.priority]} ${typeEmojis[alert.type]}`;

    switch (notificationType) {
      case 'alert_created':
        subject = `${emoji} New ${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert: ${alert.title}`;
        body = `Dear ${recipient.firstName},\n\nA new ${alert.priority} priority alert has been created:\n\n` +
               `Title: ${alert.title}\n` +
               `Type: ${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}\n` +
               `Description: ${alert.description}\n` +
               `Estimated Resolution: ${new Date(alert.estimatedResolutionTime).toLocaleString()}\n\n` +
               `We will keep you updated on the progress.\n\n` +
               `Society Management Team`;
        break;

      case 'alert_updated':
        subject = `${emoji} Update on ${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert: ${alert.title}`;
        const latestUpdate = alert.updates[alert.updates.length - 1];
        body = `Dear ${recipient.firstName},\n\nThere's an update on the ongoing alert:\n\n` +
               `Title: ${alert.title}\n` +
               `Latest Update: ${latestUpdate.message}\n` +
               `Updated by: ${latestUpdate.updatedBy.userName}\n` +
               `Update Time: ${new Date(latestUpdate.timestamp).toLocaleString()}\n\n` +
               `Thank you for your patience.\n\n` +
               `Society Management Team`;
        break;

      case 'alert_resolved':
        subject = `✅ Resolved: ${alert.title}`;
        body = `Dear ${recipient.firstName},\n\nGood news! The following alert has been resolved:\n\n` +
               `Title: ${alert.title}\n` +
               `Type: ${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}\n` +
               `Resolved at: ${new Date(alert.actualResolutionTime).toLocaleString()}\n`;
        
        if (alert.resolution.resolutionNotes) {
          body += `Resolution Notes: ${alert.resolution.resolutionNotes}\n`;
        }
        
        body += `\nThank you for your patience during this time.\n\n` +
                `Society Management Team`;
        break;

      case 'alert_escalated':
        subject = `🔺 Escalated: ${alert.title}`;
        body = `Dear ${recipient.firstName},\n\nThe following alert has been escalated:\n\n` +
               `Title: ${alert.title}\n` +
               `Escalation Level: ${alert.escalation.escalationLevel}\n` +
               `Reason: ${alert.escalation.escalationReason}\n` +
               `Escalated at: ${new Date(alert.escalation.escalatedAt).toLocaleString()}\n\n` +
               `We are taking additional measures to resolve this issue quickly.\n\n` +
               `Society Management Team`;
        break;

      case 'reminder':
        subject = `⏰ Reminder: Ongoing ${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert`;
        body = `Dear ${recipient.firstName},\n\nThis is a reminder about an ongoing alert:\n\n` +
               `Title: ${alert.title}\n` +
               `Status: ${alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}\n` +
               `Started: ${new Date(alert.startTime).toLocaleString()}\n` +
               `Expected Resolution: ${new Date(alert.estimatedResolutionTime).toLocaleString()}\n\n` +
               `We are working to resolve this as soon as possible.\n\n` +
               `Society Management Team`;
        break;

      default:
        subject = `${emoji} Alert Notification: ${alert.title}`;
        body = `Dear ${recipient.firstName},\n\nYou have a new notification regarding: ${alert.title}\n\n` +
               `Please check your resident portal for more details.\n\n` +
               `Society Management Team`;
    }

    return {
      subject,
      body,
      htmlBody: this.generateHtmlNotification(alert, notificationType, recipient, subject, body)
    };
  }

  /**
   * Generate HTML version of notification
   * @param {Object} alert - Alert document
   * @param {String} notificationType - Type of notification
   * @param {Object} recipient - Recipient user data
   * @param {String} subject - Email subject
   * @param {String} body - Email body
   * @returns {String} HTML content
   */
  static generateHtmlNotification(alert, notificationType, recipient, subject, body) {
    const priorityColors = {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#2563eb',
      low: '#16a34a'
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; border-radius: 8px; overflow: hidden; }
            .header { background: ${priorityColors[alert.priority]}; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background: white; }
            .alert-info { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .alert-info h3 { margin-top: 0; color: ${priorityColors[alert.priority]}; }
            .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .btn { display: inline-block; background: ${priorityColors[alert.priority]}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${subject}</h1>
            </div>
            <div class="content">
                <p>Dear ${recipient.firstName},</p>
                
                <div class="alert-info">
                    <h3>Alert Details</h3>
                    <p><strong>Title:</strong> ${alert.title}</p>
                    <p><strong>Type:</strong> ${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}</p>
                    <p><strong>Priority:</strong> ${alert.priority.charAt(0).toUpperCase() + alert.priority.slice(1)}</p>
                    <p><strong>Description:</strong> ${alert.description}</p>
                    ${alert.estimatedResolutionTime ? `<p><strong>Expected Resolution:</strong> ${new Date(alert.estimatedResolutionTime).toLocaleString()}</p>` : ''}
                </div>

                ${body.split('\n').map(line => `<p>${line}</p>`).join('')}

                <a href="#" class="btn">View in Portal</a>
            </div>
            <div class="footer">
                <p>This is an automated notification from Society Ease Management System</p>
                <p>Society: ${alert.visibility.societyName}</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  /**
   * Check if resident should receive notification based on basic checks
   * @param {Object} resident - Resident user data
   * @param {Object} alert - Alert document
   * @param {String} notificationType - Type of notification
   * @returns {Boolean} Should receive notification
   */
  static shouldReceiveNotification(resident, alert, notificationType) {
    // Basic checks
    if (!resident.email) return false;
    if (resident.status !== 'approved') return false;

    // Check if it's quiet hours for non-critical alerts
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();

    // Quiet hours: 22:00 to 07:00 - only send critical alerts
    if (currentTime >= 2200 || currentTime <= 700) {
      if (alert.priority !== 'critical') return false;
    }

    return true;
  }

  /**
   * Create notifications for all affected residents
   * @param {Object} alert - Alert document
   * @param {String} notificationType - Type of notification
   * @returns {Array} Created notification documents
   */
  static async createNotificationsForAlert(alert, notificationType = 'alert_created') {
    const affectedResidents = await this.getAffectedResidents(alert);
    const notifications = [];

    for (const resident of affectedResidents) {
      if (!this.shouldReceiveNotification(resident, alert, notificationType)) {
        continue;
      }

      const content = this.generateNotificationContent(alert, notificationType, resident);
      
      const notificationData = {
        alertId: alert._id,
        notificationType,
        recipientId: resident._id,
        recipientDetails: {
          email: resident.email,
          flatNumber: resident.flatNumber,
          building: resident.building,
          societyName: resident.societyName
        },
        content,
        priority: alert.priority
      };

      try {
        const notification = new Notification(notificationData);
        await notification.save();
        notifications.push(notification);
      } catch (error) {
        console.error(`Failed to create notification for resident ${resident._id}:`, error);
      }
    }

    return notifications;
  }

  /**
   * Get alert dashboard data for admin
   * @param {String} societyName - Society name
   * @param {Object} dateRange - Date range filter
   * @returns {Object} Dashboard data
   */
  static async getAlertDashboardData(societyName, dateRange = null) {
    const alerts = await Alert.getAlertStatistics(societyName, dateRange);
    const notifications = await Notification.getNotificationStats(societyName, dateRange);

    // Get recent alerts
    const recentAlerts = await Alert.find({
      'visibility.societyName': societyName,
      ...(dateRange && {
        createdDate: {
          $gte: dateRange.startDate,
          $lte: dateRange.endDate
        }
      })
    })
    .sort({ createdDate: -1 })
    .limit(10)
    .populate('createdBy.userId', 'firstName lastName');

    // Get alert trends (alerts created per day for the last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const alertTrends = await Alert.aggregate([
      {
        $match: {
          'visibility.societyName': societyName,
          createdDate: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdDate' }
          },
          count: { $sum: 1 },
          criticalCount: {
            $sum: { $cond: [{ $eq: ['$priority', 'critical'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return {
      statistics: alerts[0] || {},
      notificationStats: notifications || [],
      recentAlerts,
      alertTrends
    };
  }
}

export default AlertUtils;

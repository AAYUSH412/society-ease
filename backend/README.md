# Society Ease - Backend API

A robust and scalable Node.js backend API server that powers the Society Ease residential management platform. Built with Express.js, MongoDB, and modern security practices to handle all society management operations.

## 🚀 Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication**: Secure token-based authentication system
- **Role-based Access Control**: Different permission levels (Admin, Resident, Security)
- **Refresh Token System**: Automatic token renewal for seamless user experience
- **Password Security**: Bcrypt hashing with salt rounds
- **Session Management**: Secure session handling with HTTP-only cookies
- **Email Verification**: Account verification through email links

### 👥 User Management
- **User Registration**: Comprehensive user registration with approval workflow
- **Profile Management**: Complete user profile CRUD operations
- **Account Status Control**: Approve, suspend, or reactivate user accounts
- **Role Assignment**: Dynamic role assignment and permission management
- **User Statistics**: Track user engagement and activity metrics
- **Bulk Operations**: Batch user operations for administrative efficiency

### 💰 Billing System
- **Automated Bill Generation**: Monthly maintenance bill creation for all residents
- **Bulk Billing**: Generate bills for multiple residents simultaneously
- **Payment Integration**: Razorpay payment gateway integration
- **Payment Tracking**: Real-time payment status monitoring
- **Receipt Generation**: Automatic PDF receipt creation and email delivery
- **Payment Analytics**: Revenue tracking and collection analysis
- **Overdue Management**: Automated reminder system for pending payments

### 🚨 Alert Management
- **Multi-priority Alerts**: Create alerts with different urgency levels
- **Broadcast System**: Send alerts to specific groups or all residents
- **Real-time Notifications**: Instant alert delivery via email and in-app
- **Alert Scheduling**: Schedule alerts for future delivery
- **Response Tracking**: Monitor alert acknowledgment and responses
- **Escalation System**: Escalate unresolved alerts to higher authorities

### 📄 PDF Services
- **Dynamic PDF Generation**: Create PDFs using Puppeteer
- **Bill PDFs**: Generate formatted maintenance bills
- **Receipt PDFs**: Create payment receipts with transaction details
- **Email Integration**: Automatically email PDFs to residents
- **Template System**: Customizable PDF templates for different documents

### 📂 File Management
- **Image Upload**: ImageKit integration for secure image storage
- **File Validation**: Type and size validation for uploaded files
- **CDN Integration**: Fast image delivery through ImageKit CDN
- **Violation Evidence**: Photo upload for violation documentation

### ⚖️ Violation Management
- **Violation Categories**: Customizable violation types and fine structures
- **Fine Management**: Automated fine calculation and tracking
- **Evidence Upload**: Photo evidence support for violations
- **Payment Processing**: Online fine payment through integrated gateway
- **Compliance Tracking**: Monitor violation resolution and compliance

## 🛠️ Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **PDF Generation**: Puppeteer
- **Email Service**: Brevo (Sendinblue) SMTP
- **Payment Gateway**: Razorpay
- **Image Storage**: ImageKit
- **Validation**: Joi/Zod schema validation
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston or Morgan
- **Environment**: dotenv

## 📁 Project Structure

```
backend/
├── config/                    # Configuration files
│   ├── database.js           # MongoDB connection setup
│   ├── imagekit.js           # ImageKit configuration
│   └── nodemailer.js         # Email service configuration
├── controllers/              # Request handlers
│   ├── authController.js     # Authentication logic
│   ├── adminController.js    # Admin management
│   ├── billingController.js  # Billing operations
│   ├── alertController.js    # Alert management
│   ├── pdfController.js      # PDF generation
│   └── violationCategoryController.js # Violation management
├── middleware/               # Custom middleware
│   ├── auth.js              # Authentication middleware
│   └── validation.js        # Request validation
├── models/                   # Database models
│   ├── User.js              # User schema
│   ├── Bill.js              # Billing schema
│   ├── Payment.js           # Payment schema
│   ├── Alert.js             # Alert schema
│   ├── ViolationCategory.js # Violation schema
│   └── index.js             # Model exports
├── routes/                   # API route definitions
│   ├── auth.js              # Authentication routes
│   ├── admin.js             # Admin routes
│   ├── billing.js           # Billing routes
│   ├── alerts.js            # Alert routes
│   ├── pdf.js               # PDF routes
│   └── violationCategories.js # Violation routes
├── services/                 # Business logic services
│   └── pdfService.js        # PDF generation service
├── templates/                # Template files
│   └── homeTemplate.js      # API documentation template
├── utils/                    # Utility functions
│   ├── jwt.js               # JWT utilities
│   ├── emailTemplates.js    # Email templates
│   └── alertUtils.js        # Alert utilities
├── uploads/                  # File upload directory
├── server.js                # Application entry point
└── package.json             # Dependencies and scripts
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 4.4+
- npm/yarn/pnpm

### Installation

1. **Navigate to backend directory**:
```bash
cd backend
```

2. **Install dependencies**:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**:
```bash
cp .env.example .env.local
```

Configure the following variables:
```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/society-ease

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret

# Email Configuration (Brevo)
BREVO_API_KEY=your-brevo-api-key
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-brevo-smtp-login
BREVO_SMTP_PASS=your-brevo-smtp-password
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Society Ease

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Image Storage (ImageKit)
IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-endpoint
```

4. **Start the development server**:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. **Verify the server**:
The server will start on [http://localhost:4000](http://localhost:4000)

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)
```
POST   /register          # Register new user
POST   /login             # User login
POST   /logout            # User logout
POST   /refresh-token     # Refresh access token
POST   /verify-email      # Verify email address
POST   /forgot-password   # Request password reset
POST   /reset-password    # Reset password
GET    /me                # Get current user info
```

### Admin Management Routes (`/api/admin`)
```
GET    /users             # Get all users
GET    /users/pending     # Get pending approvals
POST   /users/create      # Create new user
PATCH  /users/:id/approve # Approve user registration
PUT    /users/:id         # Update user information
DELETE /users/:id         # Delete user account
GET    /users/stats       # Get user statistics
```

### Billing Routes (`/api/billing`)
```
# Admin Routes
POST   /admin/generate-bulk    # Generate bulk bills
GET    /admin/analytics        # Get billing analytics
POST   /admin/send-reminders   # Send payment reminders

# Resident Routes
GET    /resident/bills         # Get user bills
GET    /bills/:id              # Get specific bill
POST   /payment/create-order   # Create payment order
POST   /payment/verify         # Verify payment
```

### Alert Routes (`/api/alerts`)
```
GET    /                  # Get all alerts
POST   /                  # Create new alert
GET    /:id               # Get specific alert
PUT    /:id               # Update alert
DELETE /:id               # Delete alert
POST   /:id/resolve       # Mark alert as resolved
POST   /:id/escalate      # Escalate alert
GET    /statistics        # Get alert statistics
GET    /active            # Get active alerts for resident
```

### PDF Routes (`/api/pdf`)
```
GET    /receipt/:id/download   # Download payment receipt
GET    /bill/:id/download      # Download bill PDF
POST   /receipt/:id/email      # Email receipt to user
POST   /receipt/:id/store      # Store receipt in cloud
```

### Violation Categories Routes (`/api/violation-categories`)
```
GET    /                  # Get all categories
POST   /                  # Create new category (Admin)
GET    /:id               # Get specific category
PUT    /:id               # Update category (Admin)
DELETE /:id               # Delete category (Admin)
GET    /search            # Search categories
GET    /stats/overview    # Get violation statistics
```

## 🔒 Security Features

### Authentication Security
- **JWT Tokens**: Secure token-based authentication
- **Token Rotation**: Automatic refresh token rotation
- **Password Hashing**: bcrypt with configurable salt rounds
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Cross-origin request protection

### Data Security
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: MongoDB injection protection
- **XSS Protection**: Cross-site scripting prevention
- **CSRF Protection**: Cross-site request forgery protection
- **Secure Headers**: Security headers via Helmet.js

### File Security
- **File Type Validation**: Restrict file types for uploads
- **File Size Limits**: Prevent large file uploads
- **Secure Storage**: Cloud-based file storage with ImageKit
- **Access Control**: Role-based file access permissions

## 📊 Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['admin', 'resident', 'security'],
  status: Enum ['pending', 'approved', 'suspended'],
  profile: {
    phone: String,
    address: String,
    flatNumber: String,
    emergencyContact: Object
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Bill Model
```javascript
{
  userId: ObjectId (ref: User),
  amount: Number,
  dueDate: Date,
  billMonth: String,
  status: Enum ['pending', 'paid', 'overdue'],
  paymentId: ObjectId (ref: Payment),
  generatedAt: Date,
  paidAt: Date
}
```

### Alert Model
```javascript
{
  title: String,
  description: String,
  priority: Enum ['low', 'medium', 'high', 'critical'],
  status: Enum ['active', 'resolved', 'archived'],
  createdBy: ObjectId (ref: User),
  targetAudience: Enum ['all', 'residents', 'specific'],
  expiresAt: Date,
  responses: Array,
  createdAt: Date
}
```

## 🔧 Development

### Available Scripts

```bash
# Development server with nodemon
npm run dev

# Production server
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage
npm run test:coverage

# Database seeding
npm run seed

# Database reset
npm run db:reset
```

### Environment Modes

```bash
# Development mode
NODE_ENV=development npm run dev

# Production mode
NODE_ENV=production npm start

# Testing mode
NODE_ENV=test npm test
```

## 📧 Email Templates

The system includes pre-built email templates for:

- **Welcome Email**: New user registration confirmation
- **Bill Reminder**: Payment due date reminders
- **Payment Confirmation**: Successful payment notifications
- **Alert Notifications**: Community alert broadcasts
- **Password Reset**: Secure password reset links
- **Account Approval**: Registration approval notifications

## 🚀 Deployment

### Production Build

```bash
# Install production dependencies
npm ci --only=production

# Start production server
npm start
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/society-ease
JWT_SECRET=your-production-jwt-secret
# ... other production environment variables
```

### Process Management

Consider using PM2 for production process management:

```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start server.js --name "society-ease-api"

# Save PM2 configuration
pm2 save

# Set up startup script
pm2 startup
```

## 📈 Monitoring & Logging

### Health Check Endpoint
```
GET /health
```
Returns server status, uptime, and database connection status.

### Logging Levels
- **Error**: System errors and exceptions
- **Warn**: Warning messages and deprecated usage
- **Info**: General information and API requests
- **Debug**: Detailed debugging information

### Metrics Tracking
- **API Response Times**: Monitor endpoint performance
- **Database Queries**: Track query execution times
- **Error Rates**: Monitor error frequency and patterns
- **User Activity**: Track user engagement metrics

## 🧪 Testing

### Test Structure
```
tests/
├── unit/           # Unit tests for individual functions
├── integration/    # Integration tests for API endpoints
├── fixtures/       # Test data and fixtures
└── helpers/        # Test helper functions
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "Authentication"

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow coding standards**: ESLint and Prettier configuration
4. **Write tests**: Add unit and integration tests
5. **Update documentation**: Update API docs and README
6. **Commit changes**: `git commit -m 'Add amazing feature'`
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Create Pull Request**: Submit PR with detailed description

### Code Standards

- **ESLint**: Follow project ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Naming Conventions**: Use camelCase for variables, PascalCase for classes
- **Error Handling**: Proper error handling with try-catch blocks
- **Documentation**: JSDoc comments for functions and classes

## 📄 API Documentation

The API documentation is automatically generated and available at:
- **Development**: [http://localhost:4000](http://localhost:4000)
- **Production**: Your production domain root

The documentation includes:
- Complete endpoint listing
- Request/response examples
- Authentication requirements
- Error code descriptions

## 📄 License

This project is part of the Society Ease ecosystem. See the main repository for license information.

## 🆘 Support

For technical support:
- **Issues**: Create GitHub issues for bugs and feature requests
- **Documentation**: Check API documentation for endpoint details
- **Email**: Contact development team for critical issues

## 🔄 Version History

- **v1.0.0**: Initial release with core features
- **v1.1.0**: Added violation management system
- **v1.2.0**: Enhanced alert system with scheduling
- **v1.3.0**: Improved payment integration and PDF generation
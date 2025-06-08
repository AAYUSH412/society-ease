<div align="center">

# 🏢 Society Ease

✨ **A comprehensive society management system that simplifies community living** ✨

[![GitHub Stars](https://img.shields.io/github/stars/AAYUSH412/society-ease?style=for-the-badge&logo=github&color=ff6b6b)](https://github.com/AAYUSH412/society-ease/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/AAYUSH412/society-ease?style=for-the-badge&logo=github&color=764ba2)](https://github.com/AAYUSH412/society-ease/network/members)
[![GitHub Issues](https://img.shields.io/github/issues/AAYUSH412/society-ease?style=for-the-badge&logo=github&color=667eea)](https://github.com/AAYUSH412/society-ease/issues)
[![MIT License](https://img.shields.io/badge/License-MIT-success?style=for-the-badge)](https://github.com/AAYUSH412/society-ease/blob/main/LICENSE)

[![Next.js](https://img.shields.io/badge/Next.js-15.3.3-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)

[🚀 Quick Start](#-quick-start) • [✨ Features](#-features) • [🛠️ Tech Stack](#️-tech-stack) • [📚 API Docs](#-api-documentation) • [🤝 Contributing](#-contributing)

---

</div>

## 🌟 Overview

Society Ease is a comprehensive full-stack web application that revolutionizes residential community management through digital automation. Built with cutting-edge technologies including Next.js 15, React 19, and TypeScript 5, it provides intuitive interfaces for both residents and administrators, enabling seamless management of billing, parking violations, alerts, and community communications.

### 🏆 Why Choose Society Ease?

- **🎛️ Streamlined Operations**: Automate repetitive administrative tasks and reduce overhead
- **👥 User-Centric Design**: Intuitive interfaces designed for users of all technical backgrounds  
- **🔒 Enterprise Security**: JWT authentication, role-based access control, and data protection
- **📱 Mobile-First**: Responsive design ensuring perfect experience across all devices
- **⚡ Real-Time Updates**: Live notifications and instant status updates
- **🔧 Highly Configurable**: Customizable settings to match your society's unique needs
- **💡 Modern Architecture**: Built with the latest web technologies and best practices

## 🚀 Features

### 👥 **For Residents**
- 📋 **Bill Management**: View and track monthly bills, payment history, and outstanding dues
- 🚗 **Parking Violations**: View violations, pay fines, and track parking compliance
- 🔔 **Alerts & Notifications**: Receive important community announcements and reminders
- 👤 **Profile Management**: Update personal information and contact details
- 📱 **Responsive Dashboard**: Mobile-friendly interface for on-the-go access

### 🛠️ **For Administrators**
- 💰 **Billing System**: Generate monthly bills, track payments, and manage outstanding dues
- 🚫 **Violation Management**: Issue parking violations, categorize offenses, and manage fines
- 📢 **Alert Broadcasting**: Send community-wide announcements and notifications
- 👨‍👩‍👧‍👦 **User Management**: Manage resident profiles and access permissions
- 📊 **Analytics Dashboard**: Track payments, violations, and community metrics with Recharts
- 📄 **PDF Generation**: Automated bill generation and violation notices with Puppeteer

### 🔧 **Core Features**
- 🔐 **Secure Authentication**: JWT-based authentication with role-based access control
- 📧 **Email Integration**: Automated email notifications via Brevo SMTP
- 📱 **Real-time Updates**: Live notifications and status updates
- 🎨 **Modern UI/UX**: Clean, intuitive interface with Tailwind CSS and Shadcn/ui
- 🔄 **API-First Design**: RESTful APIs for seamless integration
- 🖼️ **Media Management**: ImageKit integration for file uploads and processing
- 💳 **Payment Gateway**: Razorpay integration for secure online payments

## 🏗️ Architecture

The project follows a microservices architecture with three main components:

```
society-ease/
├── 🔧 backend/          # Express.js API Server
├── 🏠 frontend/         # Next.js Resident Portal
└── ⚙️ admin/           # Next.js Admin Portal
```

### Backend (Express.js API)
- **Port**: 4000
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with HTTP-only cookies
- **Email Service**: Brevo SMTP integration
- **PDF Generation**: Automated document creation with Puppeteer
- **Payment Processing**: Razorpay integration
- **Media Management**: ImageKit for file uploads

### Frontend (Resident Portal)
- **Port**: 3000
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS 4 + Shadcn/ui components
- **State Management**: React Context API
- **TypeScript**: Full type safety throughout
- **UI Library**: Radix UI primitives

### Admin Portal
- **Port**: 3001
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS 4 + Custom components
- **Features**: Advanced management dashboard
- **Analytics**: Real-time data visualization with Recharts
- **Forms**: React Hook Form + Zod validation

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JSON Web Tokens (JWT)
- **Email Service**: Nodemailer with Brevo SMTP
- **File Processing**: Multer for uploads
- **PDF Generation**: Puppeteer for automated documents
- **Security**: bcryptjs, CORS, security headers
- **Payment**: Razorpay integration
- **Media**: ImageKit for file management

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn/ui, Radix UI
- **State Management**: React Context
- **Icons**: Lucide React
- **Charts**: Recharts for analytics
- **Forms**: React Hook Form + Zod validation

### Development Tools
- **Package Manager**: npm
- **Environment**: dotenv for configuration
- **API Testing**: Built-in endpoints
- **Code Quality**: ESLint configuration

## 📦 Installation

### Prerequisites
- Node.js 18 or higher
- MongoDB (local or cloud instance)
- npm package manager

### 1. Clone the Repository
```bash
git clone https://github.com/AAYUSH412/society-ease.git
cd society-ease
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install admin dependencies
cd ../admin
npm install
```

### 3. Environment Configuration

Create `.env.local` files in each directory:

#### Backend (.env.local)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/society-ease

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Email Configuration (Brevo)
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=your-brevo-email@example.com
EMAIL_PASS=your-brevo-smtp-key
EMAIL_FROM=noreply@societyease.com

# Server Configuration
PORT=4000
NODE_ENV=development
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

#### Admin (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 4. Database Setup
```bash
# Start MongoDB (if running locally)
mongod

# The application will automatically create collections on first run
```

## 🚀 Running the Application

### Development Mode

Start all services in separate terminals:

```bash
# Terminal 1: Backend API
cd backend
npm run dev

# Terminal 2: Resident Portal
cd frontend
npm run dev

# Terminal 3: Admin Portal
cd admin
npm run dev
```

### Application URLs
- **API Server**: http://localhost:4000
- **Resident Portal**: http://localhost:3000
- **Admin Portal**: http://localhost:3001

## 📚 API Documentation

### Authentication Endpoints
```http
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
POST /api/auth/logout       # User logout
GET  /api/auth/profile      # Get user profile
PUT  /api/auth/profile      # Update user profile
```

### Billing Endpoints
```http
GET  /api/billing/bills         # Get user bills
GET  /api/billing/bills/:id     # Get specific bill
POST /api/billing/bills/:id/pay # Pay bill
GET  /api/billing/payments      # Get payment history
```

### Parking Violation Endpoints
```http
GET  /api/parking/violations     # Get user violations
GET  /api/parking/violations/:id # Get specific violation
POST /api/parking/violations/:id/pay # Pay violation fine
```

### Alert Endpoints
```http
GET  /api/alerts               # Get user alerts
PUT  /api/alerts/:id/read      # Mark alert as read
```

### Admin Endpoints
```http
# User Management
GET  /api/admin/users          # Get all users
POST /api/admin/users          # Create user
PUT  /api/admin/users/:id      # Update user
DELETE /api/admin/users/:id    # Delete user

# Bill Management
POST /api/admin/bills          # Create bill
PUT  /api/admin/bills/:id      # Update bill
GET  /api/admin/payments       # Get all payments

# Violation Management
POST /api/admin/parking/violations    # Create violation
PUT  /api/admin/parking/violations/:id # Update violation
GET  /api/admin/parking/violations    # Get all violations
```
## 📱 Screenshots & Demo

<div align="center">

### 🌐 Live Demo

Experience Society Ease in action! Check out our demo deployment:

[![Live Demo](https://img.shields.io/badge/🌐-Live%20Demo-blue?style=for-the-badge)](https://society-ease-demo.vercel.app)

*Demo credentials will be provided for testing*

</div>

### 🖼️ Application Preview

| Resident Portal | Admin Dashboard |
|:---------------:|:---------------:|
| ![Resident Dashboard](https://via.placeholder.com/500x300/667eea/ffffff?text=Resident+Dashboard) | ![Admin Dashboard](https://via.placeholder.com/500x300/764ba2/ffffff?text=Admin+Dashboard) |
| Modern, intuitive interface for residents | Comprehensive management tools for admins |

| Billing System | Mobile Responsive |
|:---------------:|:---------------:|
| ![Billing](https://via.placeholder.com/500x300/ff6b6b/ffffff?text=Billing+System) | ![Mobile](https://via.placeholder.com/300x500/4ecdc4/ffffff?text=Mobile+View) |
| Streamlined payment processing | Perfect on all devices |

---

## 📁 Project Structure


```
society-ease/
├── 📄 README.md
├── 📦 package.json
├── 🔧 backend/
│   ├── 📂 config/
│   │   ├── database.js          # MongoDB connection
│   │   └── nodemailer.js        # Email configuration
│   ├── 📂 controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── billingController.js # Billing operations
│   │   ├── alertController.js   # Alert management
│   │   └── parkingController.js # Violation handling
│   ├── 📂 models/
│   │   ├── User.js              # User schema
│   │   ├── Bill.js              # Bill schema
│   │   ├── Payment.js           # Payment schema
│   │   ├── Alert.js             # Alert schema
│   │   └── ParkingViolation.js  # Violation schema
│   ├── 📂 routes/
│   │   ├── auth.js              # Auth routes
│   │   ├── billing.js           # Billing routes
│   │   ├── alerts.js            # Alert routes
│   │   └── admin.js             # Admin routes
│   ├── 📂 middleware/
│   │   └── auth.js              # JWT verification
│   ├── 📂 utils/
│   │   ├── emailTemplates.js    # Email templates
│   │   └── pdfGenerator.js      # PDF utilities
│   └── 🚀 server.js             # Express server
├── 🏠 frontend/
│   ├── 📂 src/
│   │   ├── 📂 app/              # Next.js app router
│   │   ├── 📂 components/       # React components
│   │   ├── 📂 lib/              # Utility libraries
│   │   └── 📂 styles/           # Global styles
│   └── 📦 package.json
└── ⚙️ admin/
    ├── 📂 src/
    │   ├── 📂 app/              # Next.js app router
    │   ├── 📂 components/       # Admin components
    │   └── 📂 lib/              # Admin utilities
    └── 📦 package.json
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **CORS Protection**: Configured for specific origins
- **Security Headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- **Input Validation**: Server-side validation for all endpoints
- **Role-based Access**: Separate permissions for residents and admins

## 📧 Email Features

- **Welcome Emails**: Automated welcome messages for new users
- **Bill Notifications**: Monthly bill generation and payment reminders
- **Alert Notifications**: Community announcements and urgent alerts
- **Violation Notices**: Parking violation notifications and fine details
- **Payment Confirmations**: Receipt emails for successful payments

## 🚗 Parking Management

- **Violation Categories**: Customizable violation types and fines
- **Fine Management**: Automated fine calculation and payment tracking
- **Violation History**: Complete violation records for each resident
- **Admin Dashboard**: Comprehensive violation management interface

## 📱 Mobile Responsiveness

Both portals are fully responsive and optimized for:
- 📱 Mobile devices (320px+)
- 📟 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Large screens (1440px+)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Aayush Vaghela**
- GitHub: [@AAYUSH412](https://github.com/AAYUSH412)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- MongoDB for the flexible database solution
- Tailwind CSS for the utility-first CSS framework
- Shadcn/ui for the beautiful component library

---

<div align="center">
  <h3>🏢 Society Ease - Making Community Management Effortless</h3>
  <p>Built with ❤️ for modern residential communities</p>
</div>
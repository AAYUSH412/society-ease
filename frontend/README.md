# Society Ease - Resident Portal

A modern, intuitive web application designed for residential society members to manage their daily activities, billing, alerts, and community interactions. Built with Next.js and TypeScript for optimal performance and user experience.

## 🏠 Features

### 📊 Resident Dashboard
- **Personal Overview**: Quick view of pending bills, recent alerts, and account status
- **Activity Summary**: Track recent payments, alert interactions, and account activities
- **Quick Actions**: Fast access to bill payments, alert creation, and profile updates
- **Real-time Notifications**: Live updates for new alerts and billing information

### 💳 Smart Billing Management
- **Bill Overview**: View all current and past maintenance bills
- **Online Payments**: Secure payment processing with Razorpay integration
- **Payment History**: Complete transaction history with downloadable receipts
- **Auto-reminders**: Receive email notifications for upcoming due dates
- **PDF Downloads**: Download bills and payment receipts as PDF documents
- **Payment Analytics**: Track spending patterns and payment trends

### 🚨 Community Alerts System
- **Alert Dashboard**: View all society-wide alerts and announcements
- **Priority Filtering**: Filter alerts by urgency (Low, Medium, High, Critical)
- **Real-time Updates**: Instant notifications for new alerts
- **Alert Interaction**: Acknowledge, respond to, or escalate alerts
- **Create Alerts**: Report issues or make announcements to the community
- **Alert History**: Access past alerts and their resolution status

### 🏢 Violation Management
- **Violation Tracking**: Monitor parking violations and society rule infractions
- **Fine Payments**: Pay violation fines online with detailed breakdown
- **Compliance History**: Track violation history and compliance status
- **Photo Evidence**: View photographic evidence of violations
- **Appeal Process**: Submit appeals for disputed violations

### 👤 Profile Management
- **Personal Information**: Update contact details, family members, and emergency contacts
- **Notification Preferences**: Customize alert and communication settings
- **Security Settings**: Change passwords and manage account security
- **Vehicle Registration**: Register and manage vehicle information

### 📱 Mobile-Responsive Design
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Touch-friendly Interface**: Designed for easy mobile navigation
- **Progressive Web App**: Fast loading and offline capability
- **Cross-browser Compatibility**: Works across all modern browsers

## 🛠️ Technology Stack

- **Framework**: Next.js 14 with App Router and Server Components
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive design
- **UI Components**: shadcn/ui + Radix UI primitives
- **State Management**: React Context API with custom hooks
- **Authentication**: JWT-based secure authentication
- **Forms**: React Hook Form with Zod validation
- **Payments**: Razorpay integration for secure transactions
- **Icons**: Lucide React for consistent iconography
- **Animations**: Framer Motion for smooth interactions

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── login/                   # Authentication pages
│   ├── register/                # User registration
│   ├── resident/                # Resident-specific routes
│   │   ├── dashboard/           # Main dashboard
│   │   ├── billing/             # Billing management
│   │   │   ├── pay/            # Payment processing
│   │   │   ├── payment-success/ # Payment confirmation
│   │   │   └── payment-failure/ # Payment error handling
│   │   └── alerts/              # Alert management
│   │       ├── create/          # Create new alerts
│   │       ├── notifications/   # Alert notifications
│   │       └── [id]/           # Individual alert details
│   └── not-found.tsx           # 404 error page
├── components/                   # Reusable UI components
│   ├── alerts/                  # Alert-related components
│   │   └── resident/           # Resident-specific alert components
│   ├── billing/                 # Billing management components
│   │   └── resident/           # Resident billing components
│   ├── dashboard/               # Dashboard layout components
│   ├── sections/                # Landing page sections
│   ├── ui/                      # Base UI components (shadcn/ui)
│   ├── navbar.tsx               # Navigation component
│   ├── footer.tsx               # Footer component
│   └── theme-provider.tsx       # Dark/light theme provider
├── hooks/                       # Custom React hooks
│   └── use-auth.tsx            # Authentication hook
├── lib/                         # Utility libraries
│   ├── api.ts                  # API client configuration
│   ├── utils.ts                # Utility functions
│   └── api/                    # API interface modules
│       ├── billing.ts          # Billing API functions
│       └── resident-alerts.ts  # Alert API functions
└── types/                       # TypeScript type definitions
    └── api.ts                  # API response types
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- Running backend API server

### Installation

1. **Clone and navigate to frontend directory**:
```bash
cd frontend
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
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
NEXT_PUBLIC_APP_NAME=Society Ease
```

4. **Run the development server**:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. **Open the application**:
Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Authentication Flow

### Registration Process
1. **Sign Up**: New residents register with basic information
2. **Verification**: Email verification required
3. **Admin Approval**: Registration pending admin approval
4. **Account Activation**: Access granted after approval

### Login Process
1. **Email/Password**: Secure credential-based login
2. **JWT Tokens**: Access and refresh token management
3. **Session Persistence**: Automatic login on return visits
4. **Secure Logout**: Token invalidation and cleanup

## 💰 Payment Integration

### Razorpay Features
- **Secure Payments**: PCI DSS compliant payment processing
- **Multiple Payment Methods**: Cards, UPI, Net Banking, Wallets
- **Real-time Verification**: Instant payment confirmation
- **Receipt Generation**: Automatic PDF receipt generation
- **Payment Tracking**: Complete transaction history

### Payment Flow
1. **Bill Selection**: Choose bills to pay from dashboard
2. **Payment Gateway**: Redirect to secure Razorpay checkout
3. **Payment Processing**: Real-time payment verification
4. **Confirmation**: Payment success/failure handling
5. **Receipt Generation**: Automatic PDF receipt delivery

## 🎨 UI/UX Features

### Design System
- **Consistent Branding**: Cohesive visual identity throughout
- **Accessibility**: WCAG 2.1 AA compliance
- **Dark/Light Mode**: System preference and manual toggle
- **Responsive Grid**: Flexible layouts for all screen sizes
- **Loading States**: Skeleton screens and progress indicators

### User Experience
- **Intuitive Navigation**: Clear information architecture
- **Quick Actions**: Fast access to common tasks
- **Error Handling**: User-friendly error messages and recovery
- **Feedback Systems**: Toast notifications and status updates
- **Progressive Enhancement**: Graceful degradation for older browsers

## 🔧 Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Type checking
npm run type-check

# Linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Code Quality Tools

- **TypeScript**: Compile-time type checking
- **ESLint**: Code quality and style enforcement
- **Prettier**: Consistent code formatting
- **Husky**: Git hooks for pre-commit quality checks

## 📱 Key User Workflows

### Bill Payment Workflow
1. **Dashboard Overview**: View pending bills
2. **Bill Details**: Review bill breakdown and due dates
3. **Payment Processing**: Choose payment method and complete transaction
4. **Confirmation**: Receive payment confirmation and receipt
5. **History Tracking**: View payment in transaction history

### Alert Management Workflow
1. **Alert Reception**: Receive real-time alert notifications
2. **Alert Review**: Read alert details and priority level
3. **Response Actions**: Acknowledge, respond, or escalate if needed
4. **Create Alerts**: Report issues or make community announcements
5. **Follow-up**: Track alert resolution and responses

### Profile Management Workflow
1. **Profile Access**: Navigate to profile settings
2. **Information Update**: Modify personal and family details
3. **Preference Setting**: Customize notification preferences
4. **Security Management**: Update passwords and security settings
5. **Vehicle Registration**: Add or update vehicle information

## 🚀 Deployment

### Build Configuration

```bash
# Production build
npm run build

# Export static files (if needed)
npm run export
```

### Environment Variables for Production

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_production_razorpay_key
NEXT_PUBLIC_APP_NAME=Society Ease
NODE_ENV=production
```

### Performance Optimizations

- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic route-based code splitting
- **Static Generation**: Pre-rendered pages where possible
- **Bundle Analysis**: webpack-bundle-analyzer for optimization
- **Caching Strategy**: Optimized caching headers and service workers

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow coding standards**: Use TypeScript, ESLint, and Prettier
4. **Write tests**: Add unit tests for new functionality
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Create Pull Request**: Submit PR with detailed description

## 📄 License

This project is part of the Society Ease ecosystem. See the main repository for license information.

## 🆘 Support

For technical support or feature requests:
- Create an issue in the main repository
- Contact the development team
- Check the documentation for troubleshooting guides

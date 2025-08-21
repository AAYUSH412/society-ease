# Society Ease - Admin Dashboard



A comprehensive admin panel built with Next.js and TypeScript for managing residential society operations. This dashboard provides administrators with powerful tools to oversee all aspects of society management.

## 🚀 Features

### 👥 User Management
- **User Registration Approval**: Review and approve new resident registrations
- **User Profile Management**: Create, update, and manage resident profiles
- **Role-Based Access Control**: Assign roles (Admin, Resident, Security)
- **User Statistics Dashboard**: View user engagement metrics and statistics
- **Account Status Management**: Suspend, reactivate, or deactivate user accounts

### 💰 Billing Administration
- **Bulk Bill Generation**: Generate maintenance bills for all residents simultaneously
- **Payment Tracking**: Monitor payment status and generate collection reports
- **Billing Analytics**: View revenue insights and payment trends
- **Payment Reminders**: Send automated payment reminder notifications
- **Invoice Management**: Generate and manage PDF invoices

### 🚨 Alert Management
- **System-wide Alerts**: Create and broadcast important announcements
- **Priority-based Notifications**: Manage alerts by urgency levels (Low, Medium, High, Critical)
- **Alert Statistics**: Track alert engagement and response rates
- **Scheduled Alerts**: Plan and schedule future notifications
- **Alert Resolution Tracking**: Monitor and resolve community issues

### 📊 Analytics & Reporting
- **Revenue Analytics**: Track monthly/yearly billing and collection trends
- **User Engagement Metrics**: Monitor resident portal usage
- **Payment Performance**: Analyze payment patterns and defaults
- **Alert Response Analytics**: Measure community alert engagement

### ⚙️ System Administration
- **Security Settings**: Manage authentication and authorization policies
- **System Configuration**: Configure society-specific settings
- **Audit Logs**: Track administrative actions and changes
- **Data Export**: Export resident and billing data for reporting

## 🛠️ Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: React Hooks + Context API
- **Authentication**: JWT-based authentication
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for analytics visualization
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin-specific routes
│   ├── billing/           # Billing management pages
│   ├── dashboard/         # Main dashboard
│   ├── login/             # Authentication pages
│   └── users/             # User management pages
├── components/            # Reusable UI components
│   ├── alerts/           # Alert management components
│   ├── billing/          # Billing-related components
│   ├── dashboard/        # Dashboard layout components
│   ├── layout/           # App layout components
│   ├── shared/           # Shared utility components
│   ├── ui/               # Base UI components (shadcn/ui)
│   └── users/            # User management components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries and API clients
│   └── api/              # API interface modules
└── types/                # TypeScript type definitions
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm/yarn/pnpm
- Running backend API server

### Installation

1. **Install dependencies**:
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env.local
```

Configure the following variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_NAME=Society Ease Admin
```

3. **Run the development server**:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. **Open the application**:
Navigate to [http://localhost:3001](http://localhost:3001) in your browser.

## 🔐 Authentication

The admin dashboard uses JWT-based authentication:
- **Login**: Email and password authentication
- **Session Management**: Automatic token refresh
- **Role-based Access**: Different permissions for different admin roles
- **Secure Logout**: Token invalidation on logout

## 📱 Key Pages

### Dashboard (`/dashboard`)
- Overview of key metrics and statistics
- Quick access to recent activities
- System health indicators

### User Management (`/users`)
- User list with search and filtering
- User registration approval workflow
- User profile editing and management

### Billing Management (`/billing`)
- Bulk bill generation interface
- Payment tracking and analytics
- Revenue reporting dashboard

### Alert Management (`/admin/alerts`)
- Create and manage system alerts
- Alert statistics and engagement metrics
- Scheduled notification management

## 🎨 UI/UX Features

- **Responsive Design**: Optimized for desktop and tablet devices
- **Dark/Light Mode**: Theme switching capability
- **Accessible Components**: WCAG 2.1 AA compliance
- **Modern Design**: Clean, professional interface
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages

## 🔧 Development

### Available Scripts

```bash
# Development server
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

### Code Quality

- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Pre-commit Hooks**: Automated code quality checks

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Environment Variables for Production

```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_APP_NAME=Society Ease Admin
NODE_ENV=production
```

## 📋 Admin Workflows

### User Approval Process
1. New user registration appears in pending users list
2. Admin reviews user information
3. Admin approves or rejects registration
4. User receives email notification of decision

### Bill Generation Process
1. Admin navigates to billing section
2. Sets billing period and amount
3. Generates bills for all active residents
4. System sends email notifications to residents

### Alert Management Process
1. Admin creates new alert with priority level
2. Selects target audience (all residents/specific groups)
3. Schedules immediate or future delivery
4. Monitors alert engagement and responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of the Society Ease ecosystem. See the main repository for license information.

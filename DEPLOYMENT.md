# 🚀 Deployment Guide

This guide provides detailed instructions for deploying Society Ease to various platforms.

## 📋 Table of Contents

- [GitHub Pages (Frontend Only)](#github-pages-frontend-only)
- [Full-Stack Deployment Options](#full-stack-deployment-options)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)

## 🌐 GitHub Pages (Frontend Only)

The frontend is automatically deployed to GitHub Pages using GitHub Actions.

### ✅ What's Included
- Resident portal interface
- Responsive design showcase
- Static pages and components
- PWA capabilities

### ❌ What's Not Included
- Backend API functionality
- User authentication
- Database operations
- Real-time features

### 🔄 Automatic Deployment

1. **Push to Main Branch**: Any changes to `frontend/` folder trigger deployment
2. **GitHub Actions**: Builds and deploys automatically
3. **Live URL**: https://aayush412.github.io/society-ease/

### 🛠️ Manual Setup

If you want to set up GitHub Pages for your fork:

1. **Fork the Repository**
   ```bash
   # Fork on GitHub, then clone
   git clone https://github.com/YOUR_USERNAME/society-ease.git
   cd society-ease
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings
   - Navigate to Pages section
   - Select "GitHub Actions" as source

3. **Update Configuration**
   Update `next.config.ts` with your repository name:
   ```typescript
   basePath: process.env.NODE_ENV === 'production' ? '/YOUR_REPO_NAME' : '',
   assetPrefix: process.env.NODE_ENV === 'production' ? '/YOUR_REPO_NAME/' : '',
   ```

4. **Deploy**
   ```bash
   git add .
   git commit -m "Configure for GitHub Pages"
   git push origin main
   ```

## 🏗️ Full-Stack Deployment Options

### 1. Vercel (Recommended for Next.js)

**Frontend Deployment:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

**Backend Deployment:**
```bash
# Deploy backend as serverless functions
cd backend
vercel --prod
```

**Pros:**
- Zero configuration for Next.js
- Automatic HTTPS
- Global CDN
- Serverless functions support

### 2. Railway (Full-Stack)

**Prerequisites:**
- Railway account
- GitHub repository

**Steps:**
1. Connect your GitHub repository to Railway
2. Create separate services for frontend, backend, and database
3. Configure environment variables
4. Deploy with automatic builds

**Pros:**
- Integrated database hosting
- Easy scaling
- Built-in monitoring

### 3. DigitalOcean App Platform

**Configuration File** (`app.yaml`):
```yaml
name: society-ease
services:
- name: frontend
  source_dir: /frontend
  github:
    repo: YOUR_USERNAME/society-ease
    branch: main
  run_command: npm start
  build_command: npm run build
- name: backend
  source_dir: /backend
  github:
    repo: YOUR_USERNAME/society-ease
    branch: main
  run_command: npm start
databases:
- name: society-ease-db
  engine: MONGODB
```

### 4. Docker Deployment

**Multi-Stage Dockerfile** (create in root):
```dockerfile
# Frontend Build Stage
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Backend Build Stage
FROM node:18-alpine AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./

# Production Stage
FROM node:18-alpine AS production
WORKDIR /app

# Copy backend
COPY --from=backend-build /app/backend ./backend
WORKDIR /app/backend
EXPOSE 4000

# Copy frontend build
COPY --from=frontend-build /app/frontend/out ./frontend/out
EXPOSE 3000

CMD ["npm", "start"]
```

**Docker Compose** (`docker-compose.yml`):
```yaml
version: '3.8'
services:
  frontend:
    build:
      context: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:4000
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
    ports:
      - "4000:4000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/society-ease
      - JWT_SECRET=your-secret-key
    depends_on:
      - mongo

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## ⚙️ Environment Configuration

### Frontend Environment Variables

Create `frontend/.env.local`:
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-url.com

# GitHub Pages (if using custom domain)
NEXT_PUBLIC_BASE_PATH=/society-ease
```

### Backend Environment Variables

Create `backend/.env.local`:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/society-ease

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars
JWT_EXPIRES_IN=7d

# Email Configuration (Brevo/SendinBlue)
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-smtp-password
EMAIL_FROM=noreply@yourdomain.com

# File Upload (ImageKit)
IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-imagekit-id

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Server Configuration
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com
ADMIN_URL=https://your-admin-url.com
```

### Admin Environment Variables

Create `admin/.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## 🔧 Troubleshooting

### Common GitHub Pages Issues

**Issue**: Assets not loading
**Solution**: Ensure `basePath` and `assetPrefix` are correctly configured in `next.config.ts`

**Issue**: 404 on page refresh
**Solution**: GitHub Pages doesn't support client-side routing. Use `trailingSlash: true` in config.

**Issue**: Build fails
**Solution**: Check that all dependencies are properly installed and there are no TypeScript errors.

### Common Full-Stack Issues

**Issue**: CORS errors
**Solution**: Configure CORS in backend to allow your frontend domain:
```javascript
app.use(cors({
  origin: ['https://your-frontend-url.com'],
  credentials: true
}));
```

**Issue**: Database connection fails
**Solution**: Ensure MongoDB URI is correct and database is accessible from your hosting platform.

**Issue**: Environment variables not working
**Solution**: Verify that all required environment variables are set in your hosting platform's dashboard.

### Performance Optimization

1. **Enable Compression**
   ```javascript
   // In backend server.js
   app.use(compression());
   ```

2. **Optimize Images**
   - Use Next.js Image component
   - Configure ImageKit for automatic optimization

3. **Enable Caching**
   ```javascript
   // Cache static assets
   app.use(express.static('public', {
     maxAge: '1y',
     etag: false
   }));
   ```

4. **Database Indexing**
   ```javascript
   // Add indexes for better performance
   userSchema.index({ email: 1 });
   billSchema.index({ userId: 1, month: 1, year: 1 });
   ```

## 📊 Monitoring and Analytics

### Recommended Tools

- **Uptime Monitoring**: UptimeRobot, StatusPage
- **Error Tracking**: Sentry, LogRocket
- **Analytics**: Google Analytics, Vercel Analytics
- **Performance**: Lighthouse, Web Vitals

### Health Checks

Add health check endpoints:
```javascript
// Backend health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## 🔐 Security Considerations

1. **Environment Variables**: Never commit sensitive data
2. **HTTPS**: Always use HTTPS in production
3. **Rate Limiting**: Implement rate limiting for APIs
4. **Input Validation**: Validate all user inputs
5. **Authentication**: Secure JWT token handling
6. **Database**: Use connection encryption

## 📞 Support

If you encounter issues during deployment:

1. Check the [Issues](https://github.com/AAYUSH412/society-ease/issues) section
2. Review deployment logs for specific error messages
3. Ensure all environment variables are correctly configured
4. Test locally before deploying to production

For additional help, create an issue in the repository with:
- Deployment platform
- Error messages
- Steps to reproduce
- Environment details

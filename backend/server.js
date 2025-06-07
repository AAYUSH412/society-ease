import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import billingRoutes from './routes/billing.js';
import pdfRoutes from './routes/pdf.js';
import alertRoutes from './routes/alerts.js';
import parkingViolationRoutes from './routes/parkingViolations.js';
import adminParkingViolationRoutes from './routes/adminParkingViolations.js';
import violationCategoriesRoutes from './routes/violationCategories.js';

// Load environment variables
dotenv.config({ path: './.env.local' });

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/parking/violations', parkingViolationRoutes);
app.use('/api/admin/parking/violations', adminParkingViolationRoutes);
app.use('/api/violation-categories', violationCategoriesRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Society Ease API</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }
            
            .container {
                text-align: center;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 3rem 2rem;
                border: 1px solid rgba(255, 255, 255, 0.2);
                box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                max-width: 600px;
                margin: 2rem;
            }
            
            .logo {
                font-size: 3rem;
                margin-bottom: 1rem;
                background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                font-weight: bold;
            }
            
            h1 {
                font-size: 2.5rem;
                margin-bottom: 1rem;
                font-weight: 300;
            }
            
            .subtitle {
                font-size: 1.2rem;
                margin-bottom: 2rem;
                opacity: 0.9;
                font-weight: 300;
            }
            
            .status {
                display: inline-block;
                background: rgba(76, 175, 80, 0.2);
                color: #4caf50;
                padding: 0.5rem 1rem;
                border-radius: 25px;
                border: 1px solid rgba(76, 175, 80, 0.3);
                margin-bottom: 2rem;
                font-weight: 500;
            }
            
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 1rem;
                margin: 2rem 0;
            }
            
            .feature {
                background: rgba(255, 255, 255, 0.1);
                padding: 1.5rem;
                border-radius: 15px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                transition: transform 0.3s ease;
            }
            
            .feature:hover {
                transform: translateY(-5px);
                background: rgba(255, 255, 255, 0.15);
            }
            
            .feature-icon {
                font-size: 2rem;
                margin-bottom: 0.5rem;
            }
            
            .feature-title {
                font-size: 1rem;
                font-weight: 600;
                margin-bottom: 0.5rem;
            }
            
            .feature-desc {
                font-size: 0.9rem;
                opacity: 0.8;
            }
            
            .footer {
                margin-top: 2rem;
                font-size: 0.9rem;
                opacity: 0.7;
            }
            
            .endpoint {
                background: rgba(255, 255, 255, 0.1);
                padding: 0.5rem 1rem;
                border-radius: 8px;
                margin: 0.25rem;
                display: inline-block;
                font-family: 'Courier New', monospace;
                font-size: 0.9rem;
            }
            
            @media (max-width: 768px) {
                .container {
                    margin: 1rem;
                    padding: 2rem 1rem;
                }
                
                h1 {
                    font-size: 2rem;
                }
                
                .logo {
                    font-size: 2rem;
                }
                
                .features {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">🏠</div>
            <h1>Society Ease API</h1>
            <div class="subtitle">Modern Society Management System</div>
            <div class="status">🟢 Server Online</div>
            
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">🔐</div>
                    <div class="feature-title">Authentication</div>
                    <div class="feature-desc">Secure login & registration</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">👥</div>
                    <div class="feature-title">Admin Panel</div>
                    <div class="feature-desc">Resident management</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">💰</div>
                    <div class="feature-title">Billing</div>
                    <div class="feature-desc">Invoice & payment tracking</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">📄</div>
                    <div class="feature-title">PDF Generation</div>
                    <div class="feature-desc">Bills & receipts</div>
                </div>
                <div class="feature">
                    <div class="feature-icon">🚨</div>
                    <div class="feature-title">Alert System</div>
                    <div class="feature-desc">Maintenance alerts</div>
                </div>
            </div>
            
            <div style="margin: 2rem 0;">
                <h3 style="margin-bottom: 1rem; font-weight: 400;">API Endpoints</h3>
                <div class="endpoint">/api/auth</div>
                <div class="endpoint">/api/admin</div>
                <div class="endpoint">/api/billing</div>
                <div class="endpoint">/api/pdf</div>
                <div class="endpoint">/health</div>
                <div class="endpoint">/api/violation-categories</div>
            </div>
            
            <div class="footer">
                <p>Built with Express.js & MongoDB</p>
                <p>Powered by Puppeteer PDF Generation</p>
            </div>
        </div>
    </body>
    </html>
  `);
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors).map(val => val.message).join(', ');
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    statusCode = 400;
    const field = Object.keys(error.keyValue)[0];
    message = `${field} already exists`;
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
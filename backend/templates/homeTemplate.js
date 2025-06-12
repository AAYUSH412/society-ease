// filepath: /Users/aayushvaghela/Documents/project/society-ease/backend/templates/homeTemplate.js
export const homeTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Society Ease API - Modern Society Management Platform</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-color: #6366f1;
            --secondary-color: #8b5cf6;
            --accent-color: #06b6d4;
            --success-color: #10b981;
            --warning-color: #f59e0b;
            --error-color: #ef4444;
            --text-primary: #ffffff;
            --text-secondary: rgba(255, 255, 255, 0.8);
            --text-muted: rgba(255, 255, 255, 0.6);
            --glass-bg: rgba(255, 255, 255, 0.1);
            --glass-border: rgba(255, 255, 255, 0.2);
            --shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            --shadow-lg: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            --shadow-xl: 0 35px 60px -12px rgba(0, 0, 0, 0.3);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #0f0f23;
            color: var(--text-primary);
            line-height: 1.7;
            overflow-x: hidden;
            position: relative;
        }

        /* Animated Mesh Background */
        .mesh-background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -3;
            background: 
                radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%),
                linear-gradient(135deg, #0f0f23 0%, #1a1a3e 25%, #2d1b69 50%, #1e1b4b 75%, #0f0f23 100%);
            animation: meshAnimation 20s ease-in-out infinite;
        }

        @keyframes meshAnimation {
            0%, 100% { 
                background-size: 200% 200%;
                background-position: 0% 0%;
            }
            25% { 
                background-size: 250% 250%;
                background-position: 100% 0%;
            }
            50% { 
                background-size: 200% 200%;
                background-position: 100% 100%;
            }
            75% { 
                background-size: 150% 150%;
                background-position: 0% 100%;
            }
        }

        /* Floating Elements */
        .floating-elements {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -2;
            overflow: hidden;
            pointer-events: none;
        }

        .floating-orb {
            position: absolute;
            border-radius: 50%;
            background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
            filter: blur(40px);
            opacity: 0.4;
            animation: floatAnimation 20s infinite ease-in-out;
        }

        .floating-orb:nth-child(1) {
            width: 300px;
            height: 300px;
            top: 10%;
            left: -10%;
            animation-delay: 0s;
            animation-duration: 25s;
        }

        .floating-orb:nth-child(2) {
            width: 200px;
            height: 200px;
            top: 60%;
            right: -5%;
            animation-delay: -7s;
            animation-duration: 30s;
        }

        .floating-orb:nth-child(3) {
            width: 150px;
            height: 150px;
            bottom: 20%;
            left: 20%;
            animation-delay: -14s;
            animation-duration: 35s;
        }

        @keyframes floatAnimation {
            0%, 100% {
                transform: translateY(0px) translateX(0px) rotate(0deg);
            }
            25% {
                transform: translateY(-100px) translateX(50px) rotate(90deg);
            }
            50% {
                transform: translateY(50px) translateX(-30px) rotate(180deg);
            }
            75% {
                transform: translateY(-50px) translateX(-80px) rotate(270deg);
            }
        }

        /* Glass Morphism Header */
        .header {
            position: sticky;
            top: 0;
            z-index: 1000;
            backdrop-filter: blur(20px);
            background: rgba(15, 15, 35, 0.8);
            border-bottom: 1px solid var(--glass-border);
            padding: 1rem 0;
        }

        .nav-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 1rem;
            font-size: 1.8rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .logo-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.2rem;
            box-shadow: var(--shadow-md);
        }

        .nav-menu {
            display: flex;
            list-style: none;
            gap: 2rem;
            align-items: center;
        }

        .nav-link {
            color: var(--text-secondary);
            text-decoration: none;
            font-weight: 500;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            transition: all 0.3s ease;
            position: relative;
        }

        .nav-link:hover {
            color: var(--text-primary);
            background: var(--glass-bg);
            transform: translateY(-2px);
        }

        /* Modern Button Styles */
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            box-shadow: var(--shadow-md);
        }

        .btn-primary:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-xl);
        }

        .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s;
        }

        .btn:hover::before {
            left: 100%;
        }

        /* Container */
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 2rem;
        }

        /* Hero Section with Modern Cards */
        .hero {
            text-align: center;
            padding: 6rem 0;
            position: relative;
        }

        .hero-title {
            font-size: clamp(3rem, 8vw, 6rem);
            font-weight: 900;
            background: linear-gradient(135deg, #fff, #a78bfa, #06b6d4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 1.5rem;
            line-height: 1.1;
        }

        .hero-subtitle {
            font-size: clamp(1.2rem, 3vw, 1.8rem);
            color: var(--text-secondary);
            margin-bottom: 2rem;
            font-weight: 300;
        }

        /* Status Badge with Animation */
        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            padding: 1rem 2rem;
            border-radius: 50px;
            margin-bottom: 3rem;
            box-shadow: var(--shadow-lg);
        }

        .status-indicator {
            width: 12px;
            height: 12px;
            background: var(--success-color);
            border-radius: 50%;
            position: relative;
            animation: pulse 2s infinite;
        }

        .status-indicator::before {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            background: var(--success-color);
            border-radius: 50%;
            animation: ping 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        @keyframes ping {
            75%, 100% {
                transform: scale(2);
                opacity: 0;
            }
        }

        /* Statistics Cards */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin: 4rem 0;
        }

        .stat-card {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            padding: 2rem;
            text-align: center;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .stat-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }

        .stat-card:hover::before {
            transform: scaleX(1);
        }

        .stat-card:hover {
            transform: translateY(-10px);
            box-shadow: var(--shadow-xl);
        }

        .stat-number {
            font-size: 3rem;
            font-weight: 900;
            background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.5rem;
        }

        .stat-label {
            color: var(--text-secondary);
            font-weight: 500;
            font-size: 1.1rem;
        }

        /* Section Titles */
        .section-title {
            font-size: clamp(2.5rem, 5vw, 4rem);
            font-weight: 800;
            text-align: center;
            margin-bottom: 3rem;
            background: linear-gradient(135deg, var(--text-primary), var(--text-secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        /* Features Grid */
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
            margin: 4rem 0;
        }

        .feature-card {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: 24px;
            padding: 2.5rem;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            overflow: hidden;
            group: hover;
        }

        .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, var(--primary-color), var(--secondary-color), var(--accent-color));
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }

        .feature-card:hover::before {
            transform: scaleX(1);
        }

        .feature-card:hover {
            transform: translateY(-15px) scale(1.02);
            box-shadow: var(--shadow-xl);
            border-color: rgba(255, 255, 255, 0.3);
        }

        .feature-icon {
            width: 70px;
            height: 70px;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            color: white;
            margin-bottom: 1.5rem;
            box-shadow: var(--shadow-md);
            transition: all 0.3s ease;
        }

        .feature-card:hover .feature-icon {
            transform: rotateY(180deg) scale(1.1);
            box-shadow: var(--shadow-lg);
        }

        .feature-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .feature-description {
            color: var(--text-secondary);
            line-height: 1.6;
            font-size: 1rem;
        }

        /* API Section */
        .api-section {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: 32px;
            padding: 4rem;
            margin: 6rem 0;
            position: relative;
        }

        .api-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 2rem;
        }

        .api-category {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 2rem;
            transition: all 0.3s ease;
        }

        .api-category:hover {
            background: rgba(255, 255, 255, 0.08);
            transform: translateY(-5px);
        }

        .api-category-title {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 1.3rem;
            font-weight: 700;
            margin-bottom: 1.5rem;
            color: var(--primary-color);
        }

        .api-category-icon {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }

        .endpoint {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 0.75rem 1rem;
            margin: 0.75rem 0;
            font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }

        .endpoint::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.2), transparent);
            transition: left 0.3s ease;
        }

        .endpoint:hover::before {
            left: 100%;
        }

        .endpoint:hover {
            background: rgba(99, 102, 241, 0.2);
            border-color: var(--primary-color);
            transform: translateX(10px);
        }

        /* Tech Stack */
        .tech-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1.5rem;
            margin: 3rem 0;
        }

        .tech-item {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: 16px;
            padding: 1.5rem;
            text-align: center;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .tech-item:hover {
            transform: translateY(-10px) scale(1.05);
            box-shadow: var(--shadow-lg);
            background: rgba(255, 255, 255, 0.15);
        }

        .tech-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            transition: all 0.3s ease;
        }

        .tech-item:hover .tech-icon {
            transform: scale(1.2) rotateY(360deg);
        }

        .tech-name {
            font-weight: 600;
            color: var(--text-primary);
        }

        /* Footer */
        .footer {
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border-top: 1px solid var(--glass-border);
            padding: 4rem 0 2rem;
            margin-top: 6rem;
        }

        .footer-content {
            max-width: 1400px;
            margin: 0 auto;
            padding: 0 2rem;
            text-align: center;
        }

        .footer-links {
            display: flex;
            justify-content: center;
            gap: 3rem;
            margin-bottom: 2rem;
            flex-wrap: wrap;
        }

        .footer-link {
            color: var(--text-secondary);
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .footer-link:hover {
            color: var(--primary-color);
            transform: translateY(-2px);
        }

        .footer-bottom {
            border-top: 1px solid var(--glass-border);
            padding-top: 2rem;
            color: var(--text-muted);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .nav-container {
                flex-direction: column;
                gap: 1rem;
            }

            .nav-menu {
                gap: 1rem;
            }

            .hero {
                padding: 4rem 0;
            }

            .container {
                padding: 1rem;
            }

            .api-section {
                padding: 2rem;
            }

            .footer-links {
                flex-direction: column;
                gap: 1rem;
            }
        }

        /* Loading Animation for Interactive Elements */
        .loading {
            position: relative;
            overflow: hidden;
        }

        .loading::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            animation: loading 2s infinite;
        }

        @keyframes loading {
            0% { left: -100%; }
            100% { left: 100%; }
        }

        /* Scroll Reveal Animation */
        .reveal {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease;
        }

        .reveal.revealed {
            opacity: 1;
            transform: translateY(0);
        }
    </style>
</head>
<body>
    <div class="mesh-background"></div>
    <div class="floating-elements">
        <div class="floating-orb"></div>
        <div class="floating-orb"></div>
        <div class="floating-orb"></div>
    </div>

    <!-- Header -->
    <header class="header">
        <div class="nav-container">
            <div class="logo">
                <div class="logo-icon">
                    <i class="fas fa-building"></i>
                </div>
                Society Ease
            </div>
            <nav>
                <ul class="nav-menu">
                    <li><a href="#features" class="nav-link">Features</a></li>
                    <li><a href="#api" class="nav-link">API</a></li>
                    <li><a href="#tech" class="nav-link">Tech Stack</a></li>
                    <li><a href="/health" class="btn btn-primary">
                        <i class="fas fa-heartbeat"></i>
                        Health Check
                    </a></li>
                </ul>
            </nav>
        </div>
    </header>

    <div class="container">
        <!-- Hero Section -->
        <section class="hero reveal">
            <h1 class="hero-title">Society Ease API</h1>
            <p class="hero-subtitle">Next-Generation Society Management Platform</p>
            
            <div class="status-badge">
                <div class="status-indicator"></div>
                <span>Server Online & Ready</span>
            </div>

            <p style="color: var(--text-secondary); font-size: 1.2rem; max-width: 700px; margin: 0 auto;">
                Transforming residential communities through intelligent automation and seamless digital experiences. 
                Built with modern technologies for scalable, secure, and efficient society management.
            </p>
        </section>

        <!-- Statistics -->
        <section class="stats-grid reveal">
            <div class="stat-card">
                <div class="stat-number">40+</div>
                <div class="stat-label">API Endpoints</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">6</div>
                <div class="stat-label">Core Modules</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">JWT</div>
                <div class="stat-label">Secure Auth</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">24/7</div>
                <div class="stat-label">Uptime</div>
            </div>
        </section>

        <!-- Features Section -->
        <section class="features-section reveal" id="features">
            <h2 class="section-title">🚀 Core Features</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-shield-alt"></i>
                    </div>
                    <h3 class="feature-title">Secure Authentication</h3>
                    <p class="feature-description">
                        JWT-based authentication with role-based access control, HTTP-only cookies, 
                        and comprehensive security headers for enterprise-grade protection.
                    </p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-users-cog"></i>
                    </div>
                    <h3 class="feature-title">User Management</h3>
                    <p class="feature-description">
                        Complete resident lifecycle management with approval workflows, 
                        role assignments, and comprehensive profile management system.
                    </p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-file-invoice-dollar"></i>
                    </div>
                    <h3 class="feature-title">Billing System</h3>
                    <p class="feature-description">
                        Automated bill generation, payment tracking, Razorpay integration, 
                        and PDF receipt generation with analytics dashboard.
                    </p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-bell"></i>
                    </div>
                    <h3 class="feature-title">Alert System</h3>
                    <p class="feature-description">
                        Multi-priority alert broadcasting with email notifications, 
                        in-app messaging, and real-time communication channels.
                    </p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <h3 class="feature-title">PDF Generation</h3>
                    <p class="feature-description">
                        Automated PDF creation for bills, receipts, and violation notices 
                        using Puppeteer with customizable templates.
                    </p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-tags"></i>
                    </div>
                    <h3 class="feature-title">Violation Management</h3>
                    <p class="feature-description">
                        Customizable violation categories with fine management, 
                        photo evidence support, and automated enforcement workflows.
                    </p>
                </div>
            </div>
        </section>

        <!-- API Documentation -->
        <section class="api-section reveal" id="api">
            <h2 class="section-title">📚 API Documentation</h2>
            <div class="api-grid">
                <div class="api-category">
                    <div class="api-category-title">
                        <div class="api-category-icon">
                            <i class="fas fa-key"></i>
                        </div>
                        Authentication
                    </div>
                    <div class="endpoint">POST /api/auth/register</div>
                    <div class="endpoint">POST /api/auth/login</div>
                    <div class="endpoint">POST /api/auth/logout</div>
                    <div class="endpoint">GET /api/auth/me</div>
                    <div class="endpoint">POST /api/auth/verify-email</div>
                    <div class="endpoint">POST /api/auth/refresh-token</div>
                </div>

                <div class="api-category">
                    <div class="api-category-title">
                        <div class="api-category-icon">
                            <i class="fas fa-user-shield"></i>
                        </div>
                        Admin Management
                    </div>
                    <div class="endpoint">GET /api/admin/users</div>
                    <div class="endpoint">GET /api/admin/users/pending</div>
                    <div class="endpoint">POST /api/admin/users/create</div>
                    <div class="endpoint">PATCH /api/admin/users/:id/approve</div>
                    <div class="endpoint">GET /api/admin/users/stats</div>
                    <div class="endpoint">PUT /api/admin/users/:id</div>
                    <div class="endpoint">DELETE /api/admin/users/:id</div>
                </div>

                <div class="api-category">
                    <div class="api-category-title">
                        <div class="api-category-icon">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        Billing System
                    </div>
                    <div class="endpoint">POST /api/billing/admin/generate-bulk</div>
                    <div class="endpoint">GET /api/billing/resident/bills</div>
                    <div class="endpoint">GET /api/billing/bills/:id</div>
                    <div class="endpoint">POST /api/billing/payment/create-order</div>
                    <div class="endpoint">POST /api/billing/payment/verify</div>
                    <div class="endpoint">GET /api/billing/admin/analytics</div>
                    <div class="endpoint">POST /api/billing/admin/send-reminders</div>
                </div>

                <div class="api-category">
                    <div class="api-category-title">
                        <div class="api-category-icon">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        PDF Services
                    </div>
                    <div class="endpoint">GET /api/pdf/receipt/:id/download</div>
                    <div class="endpoint">GET /api/pdf/bill/:id/download</div>
                    <div class="endpoint">POST /api/pdf/receipt/:id/email</div>
                    <div class="endpoint">POST /api/pdf/receipt/:id/store</div>
                </div>

                <div class="api-category">
                    <div class="api-category-title">
                        <div class="api-category-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        Alert System
                    </div>
                    <div class="endpoint">GET /api/alerts</div>
                    <div class="endpoint">POST /api/alerts</div>
                    <div class="endpoint">GET /api/alerts/:id</div>
                    <div class="endpoint">POST /api/alerts/:id/resolve</div>
                    <div class="endpoint">GET /api/alerts/statistics</div>
                    <div class="endpoint">POST /api/alerts/:id/escalate</div>
                </div>

                <div class="api-category">
                    <div class="api-category-title">
                        <div class="api-category-icon">
                            <i class="fas fa-list"></i>
                        </div>
                        Violation Categories
                    </div>
                    <div class="endpoint">GET /api/violation-categories</div>
                    <div class="endpoint">POST /api/violation-categories</div>
                    <div class="endpoint">PUT /api/violation-categories/:id</div>
                    <div class="endpoint">DELETE /api/violation-categories/:id</div>
                    <div class="endpoint">GET /api/violation-categories/search</div>
                    <div class="endpoint">GET /api/violation-categories/stats/overview</div>
                </div>
            </div>
        </section>

        <!-- Tech Stack -->
        <section class="tech-section reveal" id="tech">
            <h2 class="section-title">🛠️ Tech Stack</h2>
            <div class="tech-grid">
                <div class="tech-item">
                    <div class="tech-icon">
                        <i class="fab fa-node-js"></i>
                    </div>
                    <div class="tech-name">Node.js</div>
                </div>
                <div class="tech-item">
                    <div class="tech-icon">
                        <i class="fas fa-server"></i>
                    </div>
                    <div class="tech-name">Express.js</div>
                </div>
                <div class="tech-item">
                    <div class="tech-icon">
                        <i class="fas fa-database"></i>
                    </div>
                    <div class="tech-name">MongoDB</div>
                </div>
                <div class="tech-item">
                    <div class="tech-icon">
                        <i class="fas fa-lock"></i>
                    </div>
                    <div class="tech-name">JWT Auth</div>
                </div>
                <div class="tech-item">
                    <div class="tech-icon">
                        <i class="fas fa-envelope"></i>
                    </div>
                    <div class="tech-name">Brevo SMTP</div>
                </div>
                <div class="tech-item">
                    <div class="tech-icon">
                        <i class="fas fa-credit-card"></i>
                    </div>
                    <div class="tech-name">Razorpay</div>
                </div>
                <div class="tech-item">
                    <div class="tech-icon">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <div class="tech-name">Puppeteer</div>
                </div>
                <div class="tech-item">
                    <div class="tech-icon">
                        <i class="fas fa-cloud"></i>
                    </div>
                    <div class="tech-name">ImageKit</div>
                </div>
            </div>
        </section>
    </div>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-content">
            <div class="footer-links">
                <a href="https://github.com/AAYUSH412/society-ease" target="_blank" class="footer-link">
                    <i class="fab fa-github"></i>
                    GitHub Repository
                </a>
                <a href="/health" class="footer-link">
                    <i class="fas fa-heartbeat"></i>
                    Health Check
                </a>
                <a href="mailto:aayushvaghela412@gmail.com" class="footer-link">
                    <i class="fas fa-envelope"></i>
                    Contact Developer
                </a>
                <a href="https://aayush412.github.io/society-ease/" target="_blank" class="footer-link">
                    <i class="fas fa-external-link-alt"></i>
                    Live Demo
                </a>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 Society Ease. Built with ❤️ by <strong>Aayush Vaghela</strong></p>
                <p>Transforming residential communities through intelligent automation</p>
            </div>
        </div>
    </footer>

    <script>
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Interactive endpoint clicking
        document.querySelectorAll('.endpoint').forEach(endpoint => {
            endpoint.addEventListener('click', function() {
                this.classList.add('loading');
                setTimeout(() => {
                    this.classList.remove('loading');
                    
                    // Create a temporary notification
                    const notification = document.createElement('div');
                    notification.style.cssText = \`
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                        color: white;
                        padding: 1rem 1.5rem;
                        border-radius: 12px;
                        box-shadow: var(--shadow-lg);
                        z-index: 1000;
                        transition: all 0.3s ease;
                        backdrop-filter: blur(20px);
                    \`;
                    notification.textContent = \`Endpoint: \${this.textContent}\`;
                    document.body.appendChild(notification);
                    
                    setTimeout(() => {
                        notification.style.transform = 'translateX(400px)';
                        notification.style.opacity = '0';
                        setTimeout(() => document.body.removeChild(notification), 300);
                    }, 2000);
                }, 1000);
            });
        });

        // Scroll reveal animation
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.reveal').forEach(el => {
            observer.observe(el);
        });

        // Header scroll effect
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', () => {
            const header = document.querySelector('.header');
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 100) {
                header.style.background = 'rgba(15, 15, 35, 0.95)';
                header.style.backdropFilter = 'blur(30px)';
            } else {
                header.style.background = 'rgba(15, 15, 35, 0.8)';
                header.style.backdropFilter = 'blur(20px)';
            }
            
            lastScrollY = currentScrollY;
        });

        // Add random floating particles
        function createParticle() {
            const particle = document.createElement('div');
            particle.style.cssText = \`
                position: fixed;
                width: 4px;
                height: 4px;
                background: linear-gradient(45deg, var(--primary-color), var(--accent-color));
                border-radius: 50%;
                pointer-events: none;
                z-index: -1;
                opacity: 0.6;
            \`;
            
            const startX = Math.random() * window.innerWidth;
            const startY = window.innerHeight + 10;
            particle.style.left = startX + 'px';
            particle.style.top = startY + 'px';
            
            document.body.appendChild(particle);
            
            const duration = 3000 + Math.random() * 2000;
            const endY = -10;
            const endX = startX + (Math.random() - 0.5) * 100;
            
            particle.animate([
                { transform: \`translate(0, 0) scale(0)\`, opacity: 0 },
                { transform: \`translate(0, -50px) scale(1)\`, opacity: 0.6, offset: 0.1 },
                { transform: \`translate(\${endX - startX}px, \${endY - startY}px) scale(0)\`, opacity: 0 }
            ], {
                duration: duration,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => {
                document.body.removeChild(particle);
            };
        }

        // Create particles periodically
        setInterval(createParticle, 500);

        // Tech item click effects
        document.querySelectorAll('.tech-item').forEach(item => {
            item.addEventListener('click', function() {
                this.style.transform = 'scale(1.1) rotateY(360deg)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 600);
            });
        });

        // Add ripple effect to buttons
        document.querySelectorAll('.btn, .feature-card, .stat-card').forEach(element => {
            element.addEventListener('click', function(e) {
                const rect = this.getBoundingClientRect();
                const ripple = document.createElement('span');
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = \`
                    position: absolute;
                    width: \${size}px;
                    height: \${size}px;
                    left: \${x}px;
                    top: \${y}px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s ease-out;
                    pointer-events: none;
                \`;
                
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                
                setTimeout(() => {
                    this.removeChild(ripple);
                }, 600);
            });
        });

        // CSS for ripple animation
        const style = document.createElement('style');
        style.textContent = \`
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        \`;
        document.head.appendChild(style);
    </script>
</body>
</html>
`;
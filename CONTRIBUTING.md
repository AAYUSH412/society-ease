# Contributing to Society Ease

Thank you for your interest in contributing to Society Ease! We welcome contributions from the community and are pleased to have you aboard.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Issue Guidelines](#issue-guidelines)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.0 or higher
- npm or yarn
- MongoDB
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/society-ease.git
   cd society-ease
   ```

2. **Install dependencies for all modules**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables**
   - Copy `.env.example` files in each directory (`backend`, `frontend`, `admin`)
   - Fill in the required environment variables

4. **Start the development servers**
   ```bash
   npm run dev
   ```

This will start:
- Backend API server on `http://localhost:5000`
- Frontend (Resident Portal) on `http://localhost:3000`
- Admin Portal on `http://localhost:3001`

## How to Contribute

### Types of Contributions

We welcome several types of contributions:

- 🐛 **Bug Reports**: Help us identify and fix bugs
- 🚀 **Feature Requests**: Suggest new features or improvements
- 📝 **Documentation**: Improve our documentation
- 💡 **Code Contributions**: Fix bugs or implement features
- 🎨 **UI/UX Improvements**: Enhance user experience
- 🧪 **Testing**: Add or improve tests

### Before You Start

1. Check existing [issues](https://github.com/aayushvaghela/society-ease/issues) and [pull requests](https://github.com/aayushvaghela/society-ease/pulls)
2. For major changes, please open an issue first to discuss your proposed changes
3. Make sure your contribution aligns with the project's goals

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-number
   ```

2. **Make your changes**
   - Write clear, concise commit messages
   - Follow our coding standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Test your changes**
   ```bash
   # Run tests for backend
   cd backend && npm test
   
   # Run linting for frontend
   cd frontend && npm run lint
   
   # Run linting for admin
   cd admin && npm run lint
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add user notification preferences"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Use a clear title and description
   - Reference any related issues
   - Include screenshots for UI changes
   - Ensure all checks pass

### Commit Message Guidelines

We follow [Conventional Commits](https://conventionalcommits.org/) specification:

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation changes
- `style:` formatting, missing semicolons, etc.
- `refactor:` code refactoring
- `test:` adding or updating tests
- `chore:` maintenance tasks

Examples:
```
feat(auth): add two-factor authentication
fix(billing): resolve payment gateway timeout issue
docs: update API documentation for alerts
```

## Coding Standards

### General Guidelines

- Write clean, readable, and maintainable code
- Follow existing code style and patterns
- Add comments for complex logic
- Use meaningful variable and function names
- Keep functions small and focused

### Backend (Node.js/Express)

- Use ES6+ features and async/await
- Follow RESTful API conventions
- Implement proper error handling
- Add input validation and sanitization
- Write comprehensive API documentation

### Frontend & Admin (Next.js/React)

- Use TypeScript for type safety
- Follow React best practices and hooks patterns
- Use Tailwind CSS for styling
- Implement responsive design
- Follow accessibility guidelines (WCAG)
- Use meaningful component names

### Database (MongoDB)

- Design efficient schemas
- Use appropriate indexes
- Implement data validation
- Follow naming conventions

## Issue Guidelines

### Bug Reports

When reporting bugs, please include:

- **Environment details** (OS, Node.js version, browser)
- **Steps to reproduce** the issue
- **Expected behavior** vs **actual behavior**
- **Screenshots** or error messages
- **Additional context** that might be helpful

### Feature Requests

For feature requests, please provide:

- **Clear description** of the proposed feature
- **Use case** and **motivation**
- **Possible implementation** approach
- **Alternative solutions** considered

### Labels

We use the following labels to categorize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to docs
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed
- `priority: high` - High priority items
- `priority: low` - Low priority items

## Project Structure

```
society-ease/
├── backend/          # Node.js API server
├── frontend/         # Next.js resident portal
├── admin/           # Next.js admin dashboard
├── docs/            # Project documentation
└── .github/         # GitHub templates and workflows
```

### Key Technologies

- **Backend**: Node.js, Express.js, MongoDB, JWT
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Admin**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with role-based access
- **File Upload**: ImageKit
- **Payment**: Razorpay

## Testing

- Write unit tests for utility functions
- Add integration tests for API endpoints
- Include component tests for React components
- Test user flows end-to-end when possible

## Documentation

- Update README.md if your changes affect setup or usage
- Add inline code comments for complex logic
- Update API documentation for backend changes
- Include TypeScript type definitions

## Community

### Getting Help

- 📫 **Email**: aayushvaghela@society-ease.com
- 💬 **Discussions**: Use GitHub Discussions for questions
- 🐛 **Issues**: Report bugs using GitHub Issues

### Recognition

We appreciate all contributions! Contributors will be:

- Added to our README contributors section
- Mentioned in release notes for significant contributions
- Eligible for special recognition badges

## Development Tips

1. **Use the development environment** - Don't test on production data
2. **Keep PRs focused** - One feature or fix per PR
3. **Ask questions** - Don't hesitate to ask if you're unsure about something
4. **Be patient** - Reviews take time, and we appreciate your understanding

## Release Process

1. Features and fixes are merged into `develop` branch
2. Release candidates are created for testing
3. Stable releases are merged into `main` branch
4. Semantic versioning is used for releases

## License

By contributing to Society Ease, you agree that your contributions will be licensed under the same [MIT License](LICENSE) that covers the project.

---

Thank you for contributing to Society Ease! Together, we're building a better society management platform. 🏢✨
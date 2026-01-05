# 🛍️ Node Market - Enterprise E-Commerce Platform

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)

**A modern, secure, and scalable e-commerce platform built with enterprise-grade architecture**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Security](#-security) • [Roadmap](#-roadmap)

</div>

---

## 📖 Overview

Node Market is a full-stack e-commerce solution designed with security, scalability, and developer experience in mind. Built from the ground up with TypeScript, it provides a robust foundation for online retail operations with comprehensive admin controls and seamless customer experiences.

> 🚧 **Active Development**: Frontend UI/UX is currently being enhanced to create a complete, production-ready system.

---

## ✨ Features

### 🛒 **Customer Experience**
- **Product Browsing**: Advanced filtering, search, and categorization
- **Shopping Cart**: Real-time cart management with quantity controls
- **Wishlist**: Save products for later
- **Order Tracking**: Real-time order status with carrier tracking integration
- **Secure Checkout**: Stripe payment integration with PCI compliance
- **Email Verification**: Account security with email confirmation
- **Order History**: Complete purchase history with detailed views

### 👨‍💼 **Admin Dashboard**
- **Product Management**: CRUD operations with image uploads, SKU generation
- **Category & Brand Management**: Hierarchical organization system
- **Order Management**: Status updates, shipping labels, tracking numbers
- **Carrier Management**: Dynamic shipping provider configuration
- **Customer Management**: User oversight and support tools
- **Refund Processing**: Automated refund workflows
- **Dispute Resolution**: Built-in dispute management system
- **Analytics Dashboard**: Real-time sales, revenue, and performance metrics
- **Audit Logs**: Complete activity tracking for compliance

### 🔐 **Security Features**
- **CSRF Protection**: Token-based request validation
- **Rate Limiting**: 500 requests per 15 minutes per IP
- **Helmet.js Integration**: HTTP header security
- **Session Management**: Secure, encrypted session storage
- **Input Validation**: Zod schema validation on all endpoints
- **SQL Injection Prevention**: Prisma ORM with parameterized queries
- **XSS Protection**: Input sanitization and output encoding
- **Authentication**: Better-auth with password reset flows

---

## 🚀 Tech Stack

### **Backend**
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript 5.0
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Better-auth
- **Validation**: Zod
- **Security**: csrf-csrf, helmet, express-rate-limit

### **Frontend**
- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui, Radix UI
- **Forms**: React Hook Form + Zod
- **State Management**: React Hooks
- **Charts**: Recharts
- **Notifications**: Sonner

### **Payments & Infrastructure**
- **Payment Gateway**: Stripe
- **Email Service**: (Configurable)
- **File Storage**: Local/S3 (Configurable)

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn package manager

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/node-market.git
cd node-market
```

### 2️⃣ Backend Setup
```bash
cd node-market

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure your .env file with:
# - DATABASE_URL
# - CSRF_SECRET
# - SESSION_SECRET
# - STRIPE_SECRET_KEY
# - EMAIL credentials

# Run database migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Start development server
npm run dev
```

**Backend runs on**: `http://localhost:3003`

### 3️⃣ Frontend Setup
```bash
cd web

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Configure your .env.local with:
# - NEXT_PUBLIC_API_URL=http://localhost:3003

# Start development server
npm run dev
```

**Frontend runs on**: `http://localhost:3000`

---

## 🗄️ Database Schema

The platform includes comprehensive models:

- **Users**: Customer accounts with role-based access (ADMIN, CUSTOMER, MERCHANT)
- **Products**: With SKU generation, variants, stock management
- **Categories**: Hierarchical structure with SEO metadata
- **Brands**: Vendor management with unique codes
- **Orders**: Complete order lifecycle with status tracking
- **Payments**: Multi-provider support (Stripe, PayPal, Square)
- **Carriers**: Dynamic shipping provider management
- **Refunds**: Automated refund processing
- **Disputes**: Customer dispute resolution system
- **Audit Logs**: Full activity tracking for compliance
- **Cart & Wishlist**: Real-time shopping features

### Generate Database Diagram
```bash
npx prisma studio
```

---

## 🔒 Security

### Implementation Highlights

| Feature | Implementation | Status |
|---------|---------------|--------|
| **CSRF Protection** | Token-based validation on all mutations | ✅ |
| **Rate Limiting** | 500 req/15min per IP | ✅ |
| **Input Validation** | Zod schemas on all endpoints | ✅ |
| **SQL Injection** | Prisma ORM with prepared statements | ✅ |
| **XSS Prevention** | Input sanitization + CSP headers | ✅ |
| **Session Security** | Encrypted, HTTP-only cookies | ✅ |
| **Password Security** | Bcrypt hashing with salt | ✅ |
| **HTTPS Enforcement** | Production ready with Helmet | ✅ |

### Security Best Practices
- All secrets stored in environment variables
- `.gitignore` configured to prevent credential leaks
- Regular dependency updates for vulnerability patches
- Comprehensive error handling without information leakage

---

## 📊 API Documentation

### Authentication Endpoints
```
POST   /api/auth/sign-up          - User registration
POST   /api/auth/sign-in          - User login
POST   /api/auth/sign-out         - User logout
POST   /api/auth/forgot-password  - Password reset request
POST   /api/auth/reset-password   - Password reset confirmation
```

### Product Endpoints
```
GET    /api/products              - List all products
GET    /api/products/:id          - Get product details
POST   /api/products              - Create product (Admin)
PUT    /api/products/:id          - Update product (Admin)
DELETE /api/products/:id          - Delete product (Admin)
```

### Order Endpoints
```
GET    /api/orders                - List orders (Admin/User's own)
GET    /api/orders/:id            - Order details
POST   /api/orders                - Create order
PUT    /api/orders/:id/status     - Update status (Admin)
PUT    /api/orders/:id/shipping   - Add tracking info (Admin)
```

### Carrier Endpoints
```
GET    /api/carriers              - List all carriers (Admin)
GET    /api/carriers/active       - Active carriers (Public)
POST   /api/carriers              - Create carrier (Admin)
PUT    /api/carriers/:id          - Update carrier (Admin)
DELETE /api/carriers/:id          - Delete carrier (Admin)
PATCH  /api/carriers/:id/toggle   - Toggle status (Admin)
```

*Full API documentation available in `/docs` (Coming Soon)*

---

## 🎯 Roadmap

### ✅ **Completed**
- [x] Core backend API with Express + Prisma
- [x] Admin dashboard with full CRUD operations
- [x] User authentication and authorization
- [x] Product, category, and brand management
- [x] Shopping cart and wishlist functionality
- [x] Order processing and tracking
- [x] Payment integration (Stripe)
- [x] Carrier management system
- [x] Refund processing
- [x] Analytics and reporting
- [x] Audit logging system
- [x] Security hardening (CSRF, rate limiting, validation)

### 🚧 **In Progress**
- [ ] Enhanced frontend UI/UX design
- [ ] Mobile responsive improvements
- [ ] Advanced product filtering
- [ ] Customer reviews and ratings
- [ ] Email notification system
- [ ] Invoice generation

### 📋 **Planned**
- [ ] Multi-vendor marketplace support
- [ ] Advanced inventory management
- [ ] Loyalty program and coupons
- [ ] Multi-language support (i18n)
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Real-time notifications (WebSockets)
- [ ] AI-powered product recommendations
- [ ] Automated tax calculation
- [ ] Multi-currency support
- [ ] Social media integration
- [ ] Live chat support

---

## 🤝 Contributing

Contributions are welcome! This project will be open-source once the frontend is production-ready.

### Development Guidelines
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Run `npm run lint` before committing

---

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/nodemarket"
CSRF_SECRET="your-csrf-secret-key"
SESSION_SECRET="your-session-secret"
NODE_ENV="development"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (Optional)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:3003"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Stripe](https://stripe.com/) - Payment processing
- [Better-auth](https://github.com/better-auth/better-auth) - Authentication solution

---

<div align="center">

**⭐ Star this repo if you find it useful!**

Made with ❤️ and TypeScript

</div>

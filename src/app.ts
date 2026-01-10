import express from 'express';
import orderRoutes from './modules/orders/orders.route';
import categoryRoutes from './modules/categories/cat.route';
import productRoutes from './modules/products/product.route';
import brandRoutes from './modules/brands/brand.route';
import wishlistRoutes from './modules/wishlist/wishlist.route';
import cartRoutes from './modules/cart/cart.route';
import stripeWebhookRoutes from './modules/webhooks/stripe.route';
import analyticsRoutes from './modules/analytics/analytics.route';
import reviewRoutes from './modules/reviews/review.route';
import cookieParser from 'cookie-parser';
import { auth } from './auth';
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { doubleCsrf } from "csrf-csrf";
import session from "express-session";
import { isMobileRequest } from "./lib/mobile-helper";
import rateLimit from 'express-rate-limit'
import cors from 'cors';
import helmet from "helmet";
import userRoute from './modules/users/user.route';
import logsRoute from './modules/audit-logs/logs.route';
import disputeRoute from './modules/dispute/dispute.route';
import refundsRoute from './modules/refunds/refunds.route';
import carrierRoute from './modules/carrier/carrier.route';
import shippingRoute from './modules/shipping/shipping.route';
import addressRoutes from './modules/addresses/address.route';
import invoiceRoutes from './modules/invoices/invoice.route';
import settingsRoutes from './modules/settings/settings.route';
import backupRoutes from './modules/backup/backup.route';
import uploadRoutes from './modules/upload/upload.route';
import cachingRoutes from './modules/caching/caching.route';
import securityRoutes from './modules/security/security.route';
import returnsRoutes from './modules/returns/returns.route';
import { SecurityService } from './modules/security/security.service';


const app = express();

// app.set('trust proxy', 1); // trust first proxy

// const allowedOrigins = ['http://localhost:3000'];
app.use(
  cors({
    origin: true,// Replace with your frontend's origin
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);

// CSRF & Session middleware
app.use(cookieParser());

// Session middleware
app.use(
  session({
    secret: process.env.CSRF_SECRET!, // Validated in index.ts
    resave: false,
    saveUninitialized: true, // Required for CSRF (session must exist before token generation)
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true, // Prevents client-side JS access
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // strict in production, lax for dev (different ports)
      domain: process.env.NODE_ENV === "production" ? '.yourdomain.com' : 'localhost', // Set for subdomain sharing in production

    },
  })
);

// Initialize double CSRF protection
const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET!, // Validated in index.ts
  cookieName: process.env.NODE_ENV === "production" ? "__Host-psifi.x-csrf-token" : "psifi.x-csrf-token",
  cookieOptions: {
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // Must match session cookie
    path: "/",
    secure: process.env.NODE_ENV === "production",
  },
  size: 64,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  getCsrfTokenFromRequest: (req: express.Request) => req.headers["x-csrf-token"] as string,
  getSessionIdentifier: (req: express.Request) => { // Use session ID from express-session
    // Ensure session exists before accessing it
    if (!req.session || !req.sessionID) {
      // Force session creation if it doesn't exist
      req.session.regenerate((err) => {
        if (err) console.error("Session regeneration error:", err);
      });
    }
    return req.sessionID || req.session?.id || "fallback-session-id";
  }
}) as any;

// CSRF exempt paths - endpoints that don't need CSRF protection
const csrfExemptPaths = [
  '/api/webhooks',           // Webhooks use signature verification (Stripe, etc.)
  '/api/auth',               // Auth routes handled by better-auth
  '/api/csrf-token',         // Token generation endpoint
];

// CSRF token endpoint - Ensure session exists first
app.get("/api/csrf-token", (req, res) => {
  // Ensure session is initialized
  if (!req.session) {
    return res.status(500).json({ error: "Session not initialized" });
  }
  
  const csrfToken = generateCsrfToken(req, res);
  return res.json({ csrfToken });
});


// Auth routes After cors middleware
app.all("/api/auth/*splat", toNodeHandler(auth));

// Webhook routes
app.use('/api/webhooks', stripeWebhookRoutes);

// app.use(express.json()); // to support JSON-encoded bodies not secure against DOS
app.use(express.json({ limit: '10kb' })); // to support JSON-encoded bodies secure against DOS

// Apply CSRF protection with exemptions
app.use((req, res, next) => {
  // Skip CSRF for exempt paths
  if (csrfExemptPaths.some(path => req.path.startsWith(path))) {
    return next();
  }
  
  // Skip CSRF for mobile and track endpoint
  if (isMobileRequest(req) || req.path === '/api/track') {
    return next();
  }
  
  // Apply CSRF for web requests
  return doubleCsrfProtection(req, res, next);
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // For inline styles
      scriptSrc: ["'self'", "https://js.stripe.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["https://js.stripe.com", "https://hooks.stripe.com"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'same-origin' },
}));


// rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500 // limit each IP to 500 requests per windowMs (increased for admin dashboard)
})
app.use(limiter)



// auth routes
app.get('/api/me', async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
    
  });
  return res.json(session)
});

if (process.env.NODE_ENV === 'development') {
  // app.use(morgan('dev'));
}

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.header('host')}${req.url}`);
    }
    next();
  });
}


// Order routes
app.use('/api/orders', orderRoutes);

// Refund routes
app.use("/api/refunds", refundsRoute);

// Carrier routes
app.use("/api/carriers", carrierRoute);

// Shipping routes
app.use("/api/shipping", shippingRoute);

// Category routes
app.use('/api/categories', categoryRoutes);

// Product routes
app.use('/api/products', productRoutes);

// users routes
app.use("/api/users", userRoute);

// Address routes
app.use("/api/addresses", addressRoutes);

// Invoice routes
app.use("/api/invoices", invoiceRoutes);

// Settings routes (Admin only)
app.use("/api/settings", settingsRoutes);

// Backup routes (Admin only)
app.use("/api/admin/backup", backupRoutes);

// Upload routes (Admin only)
app.use("/api/upload", uploadRoutes);

// Caching routes (Admin only)
app.use("/api/caching", cachingRoutes);

// Security routes (Admin only)
app.use("/api/security", securityRoutes);

// Returns/Exchange routes (Admin only)
app.use("/api/returns", returnsRoutes);

// dispute routes
app.use("/api/disputes", disputeRoute);

// Brand routes
app.use('/api/brands', brandRoutes);

// audit logs routes
app.use("/api/audit-logs", logsRoute);

// Wishlist routes
app.use('/api/wishlist', wishlistRoutes);

// Cart routes
app.use('/api/cart', cartRoutes);

// Analytics routes
app.use('/api/analytics', analyticsRoutes);

// Review routes
app.use('/api/reviews', reviewRoutes);



app.get('/', (req, res) => {
  res.send('Welcome to the Node Market API');
});



// Global Error Handler
app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

app.use(async (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Global Error Handler:", err);
  
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  // Check debug mode setting
  const debugMode = await SecurityService.getDebugMode();
  
  res.status(500).json({
    error: debugMode.enabled 
      ? err.message || "Internal Server Error"
      : "Internal Server Error",
    ...(debugMode.enabled && { stack: err.stack })
  });
});


export default app;
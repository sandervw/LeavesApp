import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { NODE_ENV } from '../constants/env';

// Global rate limiter
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: NODE_ENV === 'production' ? 200 : 1000, // Limit each IP to 200 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Auth-specific rate limiter
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: NODE_ENV === 'production' ? 5 : 100, // 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.'
});

// Helmet configuration
export const helmetConfig = helmet({
  contentSecurityPolicy: { // Allow-list of what external resources the frontend can load
    directives: {
      defaultSrc: ["'self'"], // Default policy: only allow resources from same origin
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for simplicity
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],  // Allow images from self, data URIs, and HTTPS
    },
  },
  hsts: { // HTTP Strict (HTTPS) Transport Security
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true, // All first-time visitors will be forced to use HTTPS
  },
});
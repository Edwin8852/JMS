const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./shared/middleware/error.middleware');
const routes = require('./routes'); // Centralized router
require('dotenv').config();

const app = express();

// Global Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow cross-origin images/resources if needed
})); 
const ALLOWED_ORIGIN_PATTERNS = [
  /\.vercel\.app$/,
  /\.onrender\.com$/,
  /localhost/,
  /127\.0\.0\.1/,
  /^http:\/\/192\.168\.\d+\.\d+/,
];

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (process.env.FRONTEND_URL && origin.replace(/\/+$/, '') === process.env.FRONTEND_URL.replace(/\/+$/, '')) {
    return true;
  }
  return ALLOWED_ORIGIN_PATTERNS.some(pattern => pattern.test(origin));
};

// Global Preflight & CORS Headers Middleware (Guarantees preflight never 404s)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else {
    // Permissive in production to prevent unexpected locks
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, x-api-key, Cache-Control, Pragma, Expires, Surrogate-Control, Accept, X-Requested-With'
  );

  // Directly respond 200 OK to all OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-api-key',
    'Cache-Control',
    'Pragma',
    'Expires',
    'Surrogate-Control',
    'Accept',
    'X-Requested-With',
  ],
  optionsSuccessStatus: 200,
}));
app.use(morgan('dev')); 
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SDRS Gold Finance & Jewelry ERP API' });
});

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Mount All API Routes (both /api and root / to prevent 404s)
app.use('/api', routes);
app.use('/', routes);

// --- START ROUTE LOGGER ---
const fs = require('fs');

const logRoutes = () => {
  console.log('\n🚀 Registered API Routes:');
  try {
    const routeFile = fs.readFileSync(path.join(__dirname, 'routes/index.js'), 'utf8');
    const matches = [...routeFile.matchAll(/router\.use\(['"]([^'"]+)['"]/g)];
    matches.forEach(m => console.log(`  ✓ /api${m[1]}`));
  } catch(e) {
    console.log('  (Could not read routes file)');
  }
  console.log('--------------------------------------------------\n');
};

if (process.env.NODE_ENV !== 'production') {
  setTimeout(logRoutes, 100);
}
// --- END ROUTE LOGGER ---

// Error Handling Middleware (Should be last)
app.use(errorHandler);

module.exports = app;

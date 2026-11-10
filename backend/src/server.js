import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import pool from './shared/database/index.js';
import { apiLimiter } from './shared/middleware/rateLimiter.js';
import { notFoundHandler } from './shared/middleware/notFoundHandler.js';
import { errorHandler } from './shared/middleware/errorHandler.js';
import { sendSuccess } from './shared/utils/apiResponse.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5001;

// 1. Core Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Global Rate Limiting on API endpoints
app.use('/api', apiLimiter);

// 3. Health Check & Diagnostic Endpoint
app.get('/api/health', async (_req, res, next) => {
  try {
    const result = await pool.query('SELECT NOW() AS server_time, current_database() as database');
    return sendSuccess(
      res,
      {
        service: 'krav-inventory-api',
        database: 'connected',
        databaseName: result.rows[0].database,
        timestamp: result.rows[0].server_time,
      },
      'Krāv Inventory Backend is healthy and connected to PostgreSQL.'
    );
  } catch (error) {
    next(error);
  }
});

// 4. API Modules Entry Point (Modules mount here: e.g. /api/auth, /api/inventory, etc.)
// app.use('/api/auth', authRoutes);
// app.use('/api/inventory', inventoryRoutes);

// 5. 404 & Centralized Error Handling Middlewares (Must be last)
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`☕ Krāv Cafe Inventory API running on http://localhost:${port}`);
  console.log(`🛡️  Security middlewares (Helmet, CORS, Rate Limit) active`);
});

export default app;

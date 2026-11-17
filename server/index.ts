import express from 'express';
import cors from 'cors';
import { config } from './config';
import { connectDatabase, isDbConnected } from './db/connection';
import { seedDatabase } from './db/seed';

import authRoutes from './routes/auth';
import leadsRoutes from './routes/leads';
import dealsRoutes from './routes/deals';
import contactsRoutes from './routes/contacts';
import companiesRoutes from './routes/companies';
import tasksRoutes from './routes/tasks';
import activitiesRoutes from './routes/activities';
import { authenticateToken, requireRole } from './middleware/auth';

const app = express();

// Global Middleware
app.use(
  cors({
    origin: [config.clientOrigin, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// System Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NexusCRM API Server',
    database: isDbConnected() ? 'MongoDB Connected' : 'Fallback Local JSON Store',
    timestamp: new Date().toISOString(),
  });
});

// Mount CRM API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/deals', dealsRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/activities', activitiesRoutes);

// Admin Database Re-seed Endpoint
app.post(
  '/api/admin/seed',
  authenticateToken,
  requireRole('Super Admin', 'Admin'),
  async (req, res) => {
    try {
      await seedDatabase(true);
      res.json({
        success: true,
        message: 'Database successfully re-seeded with fresh dummy data.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// Fallback 404 for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Start Server & Connect MongoDB
async function startServer() {
  const connected = await connectDatabase();
  if (connected) {
    await seedDatabase(false);
  }

  if (process.env.NODE_ENV !== 'test') {
    app.listen(config.port, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 NexusCRM Server running on http://localhost:${config.port}`);
      console.log(`🍃 Database Status: ${connected ? 'MongoDB Connected' : 'Local Fallback'}`);
      console.log(`🛡️ Validation: Zod Strict Schemas + Mongoose Regex Checks`);
      console.log(`📦 Seed Engine: Ready (Use 'npm run db:seed' to re-seed)`);
      console.log(`======================================================\n`);
    });
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;

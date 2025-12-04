import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers-multi-tenant";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { tenantMiddleware } from "../tenant-middleware";
import newsRouter from "../routes/news.js";
import eventsRouter from "../routes/events.js";
import departmentsRouter from '../routes/departments.js';
import attractionsRouter from '../routes/attractions.js';
import wasteRouter from '../routes/waste.js';
import clubsRouter from '../routes/clubs.js';
import educationRouter from '../routes/education.js';
import dogRegistrationRouter from '../routes/dog-registration.js';
import contactRequestRouter from '../routes/contact-request.js';
import neighborhoodHelpRouter from '../routes/neighborhood-help.js';
import neighborhoodChatRouter from '../routes/neighborhood-chat.js';
import { setupCronJobs } from '../cron-jobs.js';

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Health check endpoint MUST be first - before any middleware
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });
  
  // Root endpoint for basic connectivity test
  app.get('/ping', (req, res) => {
    res.send('pong');
  });
  
  // Add request logging middleware
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
  
  // Diagnostic endpoint
  app.get('/api/diagnostic', (req, res) => {
    res.status(200).json({
      status: 'ok',
      env: process.env.NODE_ENV,
      port: process.env.PORT,
      hasDatabase: !!process.env.DATABASE_URL,
      timestamp: new Date().toISOString()
    });
  });
  
  // Debug endpoint to check tenants in DB
  app.get('/api/debug/tenants', async (req, res) => {
    try {
      const pg = await import('pg');
      const { Client } = pg.default;
      const client = new Client({ connectionString: process.env.DATABASE_URL });
      await client.connect();
      const result = await client.query('SELECT * FROM tenants');
      await client.end();
      res.json({
        count: result.rows.length,
        tenants: result.rows
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // Tenant middleware - MUST be before tRPC
  app.use('/api/trpc', tenantMiddleware);
  
  // News API route
  app.use('/api/news', newsRouter);
  
  // Events API route
  app.use('/api/events', eventsRouter);
  
  // Departments API route
  app.use('/api/departments', departmentsRouter);
  
  // Attractions API route
  app.use('/api/attractions', attractionsRouter);
  
  // Waste API route
  app.use('/api/waste', wasteRouter);
  
  // Clubs API route
  app.use('/api/clubs', clubsRouter);
  
  // Education API route
  app.use('/api/education', educationRouter);
  
  // Dog Registration API route
  app.use('/api/dog-registration', dogRegistrationRouter);
  app.use('/api/dog-registrations', dogRegistrationRouter);
  
  // Contact Request API route
  app.use('/api/contact-request', contactRequestRouter);
  app.use('/api/contact-requests', contactRequestRouter);
  
  // Neighborhood Help API route
  app.use('/api/neighborhood-help', tenantMiddleware, neighborhoodHelpRouter);
  
  // Neighborhood Chat API route
  app.use('/api/neighborhood-chat', tenantMiddleware, neighborhoodChatRouter);
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  // Default to production mode if NODE_ENV is not set
  const isDevelopment = process.env.NODE_ENV === "development";
  
  if (isDevelopment) {
    console.log('[Server] Running in DEVELOPMENT mode with Vite');
    await setupVite(app, server);
  } else {
    console.log('[Server] Running in PRODUCTION mode with static files');
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "3000");

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`PORT: ${process.env.PORT}`);
    console.log(`Server is ready to accept connections`);
    
    // Setup cron jobs for automatic scraping
    setupCronJobs();
  });
  
  server.on('error', (error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}

startServer().catch(console.error);

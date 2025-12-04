import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  console.log('[Vite] Middlewares registered');
  
  // Debug middleware to log all requests
  app.use((req, res, next) => {
    console.log('[Express] Incoming request:', req.method, req.url);
    next();
  });
  
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    console.log('[Vite] Handling request:', url);

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // In production, the built files are in dist/public
  // import.meta.dirname will be /app/dist in production on Railway
  const distPath = path.join(import.meta.dirname, "public");
  
  console.log('[Static] import.meta.dirname:', import.meta.dirname);
  console.log('[Static] Resolved distPath:', distPath);
  
  console.log('[Static] Serving from:', distPath);
  console.log('[Static] Directory exists:', fs.existsSync(distPath));
  
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    const indexPath = path.join(distPath, "index.html");
    console.log('[Static] Sending index.html from:', indexPath);
    res.sendFile(indexPath);
  });
}


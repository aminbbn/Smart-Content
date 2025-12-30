import 'dotenv/config';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { api } from './api/routes';

const app = new Hono();

// Request logging middleware
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`[${c.req.method}] ${c.req.url} - ${c.res.status} (${ms}ms)`);
});

// 1. Mount API Routes
// Note: We mount at root because api routes already include /api/ prefix
app.route('/', api);

// 2. Serve Frontend (Dist)
app.use('/*', serveStatic({ root: './dist' }));

// 3. Fallback for SPA routing
// This ensures that 404s on API routes don't return HTML, only non-API routes do
app.get('*', (c) => {
  if (c.req.path.startsWith('/api/')) {
    return c.json({ error: 'Not Found', path: c.req.path }, 404);
  }
  return serveStatic({ path: './dist/index.html' })(c, async () => {});
});

console.log('🚀 Server running on http://localhost:3000');

serve({
  fetch: app.fetch,
  port: 3000
});
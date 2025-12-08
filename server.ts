import 'dotenv/config';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { api } from './api/routes';

const app = new Hono();

// 1. Mount API Routes
app.route('/', api);

// 2. Serve Frontend (Dist)
app.use('/*', serveStatic({ root: './dist' }));

// 3. Fallback for SPA routing
app.get('*', serveStatic({ path: './dist/index.html' }));

console.log('🚀 Server running on http://localhost:3000');

serve({
  fetch: app.fetch,
  port: 3000
});
import fs from 'node:fs/promises';
import express, { Request, Response, NextFunction } from 'express';
import compression from 'compression';
import sirv from 'sirv';
import analyzeRouter from './api/analyze.js';
// Note: When running with tsx/node in ESM mode, we keep .js extensions for imports 
// or configure tsconfig to handle resolution. Since we are using tsx, it handles .ts files 
// but local imports might still need careful handling. 
// However, prompts.ts is imported in analyze.ts. 
// Let's ensure extensions are correct for the environment.
// With tsx, importing .js usually works if the file is .ts on disk.

// Constants
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 5173;
const base = process.env.BASE || '/';

// Cached production assets
const templateHtml = isProduction
  ? await fs.readFile('./dist/client/index.html', 'utf-8')
  : '';

// Create http server
const app = express();
app.use(express.json({ limit: '10mb' }));

// API Routes
app.use('/api', analyzeRouter);

// Add Vite or respective production middlewares
let vite: any;

if (!isProduction) {
  const { createServer } = await import('vite');
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  });
  app.use(vite.middlewares);
} else {
  app.use(compression());
  app.use(base, sirv('./dist/client', { extensions: [] }));
}

// Serve HTML
app.use('*all', async (req: Request, res: Response, next: NextFunction) => {
  // If request matches API, skip this handler (though Express handles route matching sequentially)
  // The API route is defined above, so it should be fine.
  
  try {
    const url = req.originalUrl.replace(base, '');

    let template: string;
    let render: (url: string) => Promise<{ head?: string; html?: string }>;

    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile('./index.html', 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render;
    } else {
      template = templateHtml;
      // @ts-ignore
      render = (await import('./dist/server/entry-server.js')).render;
    }

    const rendered = await render(url);

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? '')
      .replace(`<!--app-html-->`, rendered.html ?? '');

    res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
  } catch (e: any) {
    vite?.ssrFixStacktrace(e);
    console.log(e.stack);
    res.status(500).end(e.stack);
  }
});

// Start http server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});


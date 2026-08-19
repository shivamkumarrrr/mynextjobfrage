import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/**
 * `quizzes/` and `assets/` deliberately stay at the repo root rather than moving
 * into `public/`: adding a client means dropping one JSON into `quizzes/`, and
 * that path is documented product behaviour. This plugin serves them verbatim in
 * dev (no JSON→ESM transform) and copies them into `dist/` on build.
 */
function rootStaticDirs(dirs: string[]): Plugin {
  const mime: Record<string, string> = {
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };

  const copyDir = (from: string, to: string) => {
    if (!fs.existsSync(from)) return;
    fs.mkdirSync(to, { recursive: true });
    for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
      const src = path.join(from, entry.name);
      const dest = path.join(to, entry.name);
      if (entry.isDirectory()) copyDir(src, dest);
      else fs.copyFileSync(src, dest);
    }
  };

  return {
    name: 'root-static-dirs',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0];
        const match = dirs.find((d) => url.startsWith(`/${d}/`));
        if (!match) return next();
        const rel = decodeURIComponent(url.slice(1));
        const file = path.join(rootDir, rel);
        if (!file.startsWith(path.join(rootDir, match)) || !fs.existsSync(file)) return next();
        res.setHeader('Content-Type', mime[path.extname(file).toLowerCase()] || 'application/octet-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.end(fs.readFileSync(file));
      });
    },
    closeBundle() {
      const outDir = path.join(rootDir, 'dist');
      for (const dir of dirs) copyDir(path.join(rootDir, dir), path.join(outDir, dir));
    },
  };
}

/**
 * Clean URLs, locally, exactly as the hosts do them.
 *
 * The deploy targets serve `/app` and 301 `/app.html` → `/app`, and that
 * redirect drops the query string — which is how the quiz link broke once
 * before. So every internal link uses `app?q=…`, and dev/preview must resolve
 * that path the same way production does, query intact.
 */
function cleanUrls(pages: string[]): Plugin {
  const rewrite = (req: { url?: string }) => {
    const [pathname, query] = (req.url || '').split('?');
    if (!pages.includes(pathname.replace(/^\//, ''))) return;
    req.url = `/${pathname.replace(/^\//, '')}.html${query ? `?${query}` : ''}`;
  };

  return {
    name: 'clean-urls',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewrite(req);
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        rewrite(req);
        next();
      });
    },
  };
}

export default defineConfig({
  // 'mpa' keeps unknown paths from falling back to index.html, which would
  // silently serve the job ad in place of the quiz.
  appType: 'mpa',
  plugins: [react(), cleanUrls(['app']), rootStaticDirs(['quizzes', 'assets'])],
  resolve: {
    alias: { '@': path.resolve(rootDir, 'src') },
  },
  build: {
    // Bundles land in dist/static/ so they never collide with the repo's own
    // runtime-fetched /assets/ directory.
    assetsDir: 'static',
    rollupOptions: {
      input: {
        index: path.resolve(rootDir, 'index.html'),
        app: path.resolve(rootDir, 'app.html'),
      },
    },
  },
  server: { port: 3000 },
  preview: { port: 4173 },
});

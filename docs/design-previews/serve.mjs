// Local server for the internal design previews. No dependencies.
// Usage (from the repository root): node docs/design-previews/serve.mjs
// Then open http://localhost:4400/
//
// Serves ONLY docs/design-previews/ and public/ (for the real brand assets,
// fonts, portrait, and project screenshots). Every other path is refused, so
// the repository's source, .env, and other files are never exposed.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const allowed = [path.join(root, 'docs', 'design-previews'), path.join(root, 'public')];
const port = Number(process.env.PREVIEW_PORT || 4400);
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8',
};

http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }
  if (pathname === '/') pathname = '/docs/design-previews/index.html';
  const file = path.normalize(path.join(root, pathname));
  const inside = allowed.some((dir) => file === dir || file.startsWith(dir + path.sep));
  if (req.method !== 'GET' || !inside || path.basename(file).startsWith('.')) {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
    return;
  }
  fs.readFile(file, (error, data) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': types[path.extname(file).toLowerCase()] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}).listen(port, '127.0.0.1', () => {
  console.log(`Design previews: http://localhost:${port}/`);
});

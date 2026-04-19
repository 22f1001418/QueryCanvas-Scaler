import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distDir = path.join(__dirname, 'dist');
const indexHtml = path.join(distDir, 'index.html');

// Fail loudly at boot if the build is missing — previously this would
// only surface on the first request, with confusing behaviour.
if (!fs.existsSync(indexHtml)) {
  console.error(`[server] Build output not found at ${indexHtml}`);
  console.error(`[server] Run "npm run build" before "npm start".`);
  process.exit(1);
}

// Serve built assets (JS, CSS, WASM, favicon, etc.).
app.use(express.static(distDir));

// SPA fallback: any unmatched path returns index.html so the client
// router can handle it. Using a regex instead of '*' keeps this
// compatible with both Express 4 and Express 5 (Express 5 removed
// implicit wildcard support for plain '*').
app.get(/.*/, (_req, res) => {
  res.sendFile(indexHtml);
});

app.listen(PORT, () => {
  console.log(`[server] QueryCanvas serving ${distDir} on port ${PORT}`);
});

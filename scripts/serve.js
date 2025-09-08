// /root/scripts/serve.js  (ESM: "type": "module")
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute project paths
const projectRoot = path.resolve(__dirname, ".."); // -> /root
const publicDir = path.join(projectRoot, "public"); // -> /root/public
const srcDir = path.join(projectRoot, "src"); // -> /root/src

const port = process.env.PORT || 5173;

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".ico": "image/x-icon",
};

function safeServe(root, urlPath, res) {
  // Join + normalize, then ensure we stay within root
  let filePath = path.normalize(path.join(root, urlPath));
  if (!filePath.startsWith(root)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  // Directory -> index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const type = mime[ext] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  try {
    let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);

    // Map /src/* to the real /root/src/*
    if (urlPath === "/") urlPath = "/index.html";
    if (urlPath.startsWith("/src/")) {
      const srcPath = urlPath.replace(/^\/src\//, "/"); // keep relative structure
      return safeServe(srcDir, srcPath, res);
    }

    // Everything else from /public
    return safeServe(publicDir, urlPath, res);
  } catch {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Internal Server Error");
  }
});

server.listen(port, () => {
  console.log(`Serving:
  - ${publicDir} at http://localhost:${port}
  - ${srcDir}    mounted at http://localhost:${port}/src/`);
});

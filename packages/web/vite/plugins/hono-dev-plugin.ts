import type { Plugin, ViteDevServer } from "vite";
import fs from "node:fs";
import path from "node:path";

// Static section folders that live in public/ and must be served as raw HTML
// instead of being intercepted by Vite's SPA index.html fallback.
const STATIC_SECTIONS = [
  "research",
  "training",
  "interactive-flow",
  "instruction-manual",
  "journal",
];

export default function honoDevPlugin(): Plugin {
  return {
    name: "hono-dev-server",
    configureServer(server) {
      const publicDir = server.config.publicDir;

      // Serve static section HTML files before Vite's SPA fallback.
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        const urlPath = req.url.split("?")[0];
        const firstSeg = urlPath.split("/").filter(Boolean)[0];
        if (!firstSeg || !STATIC_SECTIONS.includes(firstSeg)) return next();

        // Resolve to a file inside public/
        let rel = decodeURIComponent(urlPath);
        if (rel.endsWith("/")) rel += "index.html";
        let filePath = path.join(publicDir, rel);

        // If path has no extension and isn't a file, try /index.html
        if (!path.extname(filePath)) {
          const asDir = path.join(filePath, "index.html");
          if (fs.existsSync(asDir)) filePath = asDir;
        }

        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const ext = path.extname(filePath);
          const type =
            ext === ".html"
              ? "text/html"
              : ext === ".css"
                ? "text/css"
                : ext === ".js"
                  ? "text/javascript"
                  : ext === ".png"
                    ? "image/png"
                    : "application/octet-stream";
          res.setHeader("Content-Type", type);
          res.end(fs.readFileSync(filePath));
          return;
        }
        return next();
      });

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api")) return next();

        try {
          const request = await toWebRequest(req);
          const app = await loadApp(server);
          const response = await app.fetch(request);

          res.statusCode = response.status;
          response.headers.forEach((value: string, key: string) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (err) {
          server.ssrFixStacktrace(err as Error);
          console.error("[hono-dev]", err);
          res.statusCode = 500;
          res.end("Internal Server Error");
        }
      });
    },
  };
}

async function loadApp(server: ViteDevServer) {
  const mod = await server.ssrLoadModule("/src/api/index.ts");
  return mod.default;
}

function toWebRequest(req: import("http").IncomingMessage): Request {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const headers = new Headers();
  for (const [key, val] of Object.entries(req.headers)) {
    if (val) headers.set(key, Array.isArray(val) ? val.join(", ") : val);
  }

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  return new Request(url, {
    method: req.method,
    headers,
    body: hasBody ? (req as unknown as ReadableStream) : undefined,
    // @ts-expect-error duplex needed for streaming request bodies
    duplex: hasBody ? "half" : undefined,
  });
}

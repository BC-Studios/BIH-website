import app from "./api";

const port = Number(process.env.PORT ?? 3000);
const hostname = process.env.HOST ?? "127.0.0.1";
const distDir = `${import.meta.dir}/../dist`;
const indexPath = `${distDir}/index.html`;

const server = Bun.serve({
  port,
  hostname,
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api")) {
      return app.fetch(request);
    }

    const file = await getStaticFile(url.pathname);

    if (file) {
      return new Response(file);
    }

    const index = Bun.file(indexPath);
    if (await index.exists()) {
      return new Response(index, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return new Response("Build output not found. Run `bun run build` first.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  },
});

console.log(`Web server listening on http://${server.hostname}:${server.port}`);

async function getStaticFile(pathname: string) {
  const cleanPath = decodeURIComponent(pathname)
    .replace(/^\/+/, "")
    .replaceAll("..", "");

  if (!cleanPath) {
    return Bun.file(indexPath);
  }

  const exactFile = Bun.file(`${distDir}/${cleanPath}`);
  if (await exactFile.exists()) {
    return exactFile;
  }

  const directoryIndex = Bun.file(`${distDir}/${cleanPath.replace(/\/$/, "")}/index.html`);
  if (await directoryIndex.exists()) {
    return directoryIndex;
  }

  return null;
}

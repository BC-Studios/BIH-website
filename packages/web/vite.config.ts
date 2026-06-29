import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite"
import fs from "fs";
import path from "path";
import runableAnalyticsPlugin from "./vite/plugins/runable-analytics-plugin";
import honoDevPlugin from "./vite/plugins/hono-dev-plugin";

const root = path.resolve(__dirname, "../..");

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, root, '');
		Object.assign(process.env, env);

	return {
		plugins: [staticDirectoryIndexPlugin(), honoDevPlugin(), react(), runableAnalyticsPlugin(), tailwind()],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src/web"),
			},
		},
		server: {
			allowedHosts: true,
			hmr: { overlay: false, },
			cors: false
		}
	};
});

function staticDirectoryIndexPlugin() {
	const publicDir = path.resolve(__dirname, "public");

	return {
		name: "static-directory-index",
		configureServer(server) {
			server.middlewares.use((request, response, next) => {
				const requestUrl = request.url?.split("?")[0];

				if (!requestUrl || requestUrl === "/" || !["GET", "HEAD"].includes(request.method ?? "")) {
					next();
					return;
				}

				const cleanPath = decodeURIComponent(requestUrl)
					.replace(/^\/+/, "")
					.replaceAll("..", "");
				const indexPath = path.join(publicDir, cleanPath.replace(/\/$/, ""), "index.html");

				if (!fs.existsSync(indexPath)) {
					next();
					return;
				}

				response.setHeader("Content-Type", "text/html; charset=utf-8");
				if (request.method === "HEAD") {
					response.end();
					return;
				}

				fs.createReadStream(indexPath).pipe(response);
			});
		},
	};
}

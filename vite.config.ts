import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")

  const gateway =
    env.VITE_PROXY_TARGET ||
    env.VITE_GATEWAY ||
    "http://localhost:8080"

  console.log("[VITE MODE]", mode)
  console.log("[VITE PROXY TARGET]", gateway)

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: gateway,
          changeOrigin: true,
          secure: false,
        },
        "/uploads": {
          target: gateway,
          changeOrigin: true,
          secure: false,
        },
        "/files": {
          target: gateway,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
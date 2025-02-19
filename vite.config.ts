import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

import removeConsole from 'vite-plugin-remove-console'; 


export default defineConfig({
  plugins: [
    react(),
    // 移除console.log语句
    removeConsole(),
  ],
  server: {
    hmr: {
      overlay: false, // 禁用 HMR 报错覆盖
    },
    proxy: {
      "/api": {
        target: "http://218.199.69.63:39600/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  base: '/',
  build: {
    // build目录名称，默认为"dist"
    outDir: 'dist',
    // 静态资源存放目录名称，默认为"assets"
    assetsDir: 'static',
  },
})



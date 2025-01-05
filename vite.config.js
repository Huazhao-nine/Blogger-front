import { fileURLToPath, URL } from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import {VitePWA} from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    }),
    VitePWA({
      registerType: 'autoUpdate', // 自动更新 Service Worker
      injectRegister: 'auto',
      manifest: {
        name: '花朝九日',
        short_name: '花朝',
        description: '花朝九日的博客',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone', // 使应用独立运行，无浏览器 UI
        start_url: '/',
        icons: [
          {
            src: '/avatar.jpg',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/avatar.jpg',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  server: {
    port: 8181,
    host: true,
    open: true,
    hot: true,
    proxy: {
      '/api': {
        target: 'http://localhost:80/', //跨域地址
        changeOrigin: true, //支持跨域
        rewrite: (path) => path.replace(/^\/api/, '') //重写路径,替换/api
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})

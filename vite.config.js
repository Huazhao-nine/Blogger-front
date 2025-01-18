import {fileURLToPath, URL} from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
import {defineConfig} from 'vite'
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
            sizes: '640x640',
            type: 'image/jpg',
          }
        ],
      },
    }),
  ],
  // 自定义 Service Worker 配置
  workbox: {
    // 选择适合的缓存策略
    runtimeCaching: [
      {
        urlPattern: /\/assets\/.*\.(?:js|css|png|jpg|woff2|eot|ttf|svg)/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'assets-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 缓存有效期为 30 天
          },
        },
      },
      {
        urlPattern: /.*\.(?:html|json)/,
        handler: 'NetworkFirst', // 对于页面内容使用 NetworkFirst 策略
        options: {
          cacheName: 'html-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24, // 缓存有效期为 1 天
          },
        },
      },
    ],
    // 启用 Service Worker 自清理功能
    skipWaiting: true, // 强制立即激活新版本的 SW
    clientsClaim: true, // 确保新 SW 能立即控制页面
  },
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

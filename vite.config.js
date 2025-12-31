import {fileURLToPath, URL} from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {VitePWA} from "vite-plugin-pwa";
import viteCompression from 'vite-plugin-compression';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // 添加压缩插件
    viteCompression({
      verbose: true, // 控制台输出压缩结果
      disable: false,
      threshold: 10240, // 体积大于 10kb 才压缩
      algorithm: 'gzip', // 也可以用 'brotliCompress'
      ext: '.gz',
    }),
    // 新增 Brotli 压缩 (需要服务器支持)
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    }),
    VitePWA({
      // 自定义 Service Worker 配置
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        cacheId: 'HuaZhao-pwa-cache-v1.2.1',
        // 选择适合的缓存策略
        runtimeCaching: [
          {
            urlPattern: /\/assets\/.*\.(?:js|css|png|jpg|woff2|eot|ttf|svg)/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60, // 缓存有效期为 1 天
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
          {
            urlPattern: /https:\/\/www\.bing\.com\/th\?id=[^&]+/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'wallpaper-images',
              expiration: {
                maxEntries: 1,  // 只保留一个壁纸
                maxAgeSeconds: 24 * 60 * 60,  // 缓存 1 天
              },
            },
          },

        ],
        // 启用 Service Worker 自清理功能
        skipWaiting: true, // 强制立即激活新版本的 SW
        clientsClaim: true, // 确保新 SW 能立即控制页面
        // 启用清理旧缓存的功能
        cleanupOutdatedCaches: true,
      },
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

  server: {
    port: 8181,
    // port: 8189,
    host: true,
    open: true,
    hot: true,
    proxy: {
      '/api': {
        // target: 'http://localhost:8182/', //跨域地址
        target: 'http://192.168.0.118:8182/', //跨域地址
        // target: 'http://localhost:8088/', //跨域地址
        changeOrigin: true, //支持跨域
        rewrite: (path) => path.replace(/^\/api/, '') //重写路径,替换/api
      },
      '/qqLogin': {
        target: 'https://graph.qq.com/oauth2.0/', //跨域地址
        changeOrigin: true, //支持跨域
        rewrite: (path) => path.replace(/^\/qqLogin/, '') //重写路径,替换/api
      },
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia', 'axios'], // 核心框架
          'element-plus': ['element-plus', '@element-plus/icons-vue'], // UI库及图标
          'three-lib': ['three'], // 3D库
          'markdown-lib': ['marked', 'highlight.js', 'katex'], // Markdown库
          // lodash-es 支持 tree-shaking，通常不需要单独打包，除非到处都在用
        }
      }
    }
  }
})


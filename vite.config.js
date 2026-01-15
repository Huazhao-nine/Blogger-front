import {fileURLToPath, URL} from 'node:url'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {VitePWA} from "vite-plugin-pwa";
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    vue(),
    // Gzip 压缩
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Brotli 压缩
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

    // 👇👇👇 PWA 配置优化版 👇👇👇
    VitePWA({
      // 1. 设置为提示模式 (必须)
      registerType: 'prompt',

      // 2. 自动注入注册脚本
      injectRegister: 'auto',

      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,

        // ❌ 修改点1：去掉时间戳，使用固定版本号
        // 只有当你即使文件没变也想强制用户重新缓存时，才修改这个字符串
        cacheId: 'HuaZhao-pwa-v1.2.1.1',

        // ❌ 修改点2：删除 skipWaiting 和 clientsClaim
        // 让 App.vue 里的 updateServiceWorker() 来决定何时 skipWaiting
        // skipWaiting: true,
        // clientsClaim: true,

        cleanupOutdatedCaches: true, // 清理旧版本缓存

        // 运行时缓存策略
        runtimeCaching: [
          {
            // 静态资源：优先走缓存，找不到再网络
            urlPattern: /\/assets\/.*\.(?:js|css|png|jpg|woff2|eot|ttf|svg)/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-runtime-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 静态资源可以缓存久一点（30天）
              },
            },
          },
          {
            // API 数据或外部 JSON：优先走网络，网络挂了走缓存
            urlPattern: /.*\.(?:json)/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'data-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60,
              },
            },
          },
          {
            // Bing 壁纸：只存一张，每天更新
            urlPattern: /https:\/\/www\.bing\.com\/th\?id=[^&]+/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'wallpaper-images',
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 24 * 60 * 60,
              },
            },
          },
        ],
      },
      manifest: {
        name: '花朝九日',
        short_name: '花朝',
        description: '花朝九日的博客',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/avatar.jpg',
            sizes: '640x640', // 建议再加一个 192x192 和 512x512 的标准图标
            type: 'image/jpg',
          }
        ],
      },
    }),
  ],

  // ... server 和 build 部分保持你原来的不变 ...
  server: {
    port: 8181,
    // port: 8185,
    host: true,
    open: true,
    hot: true,
    proxy: {
      '/api': {
        // target: 'http://192.168.0.118:8182/',
        target: 'http://localhost:8182/',

        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/qqLogin': {
        target: 'https://graph.qq.com/oauth2.0/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/qqLogin/, '')
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
          'vue-vendor': ['vue', 'vue-router', 'pinia', 'axios'],
          'element-plus': ['element-plus', '@element-plus/icons-vue'],
          'three-lib': ['three'],
          'markdown-lib': ['marked', 'highlight.js', 'katex'],
        }
      }
    }
  }
})
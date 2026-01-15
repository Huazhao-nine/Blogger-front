<template>
  <div class="home-pc">
    <div class="background-blur"></div>
    
    <div class="glass-container">
      <header class="glass-header">
        <div class="header-left">
          <h1 class="site-title">花朝九日's Blogger</h1>
        </div>
        <nav class="glass-nav">
          <router-link to="/pc" class="nav-item">首页</router-link>
          <router-link to="/Category" class="nav-item">分类</router-link>
          <router-link to="/About" class="nav-item">关于</router-link>
          <router-link to="/Edit" class="nav-item">写文章</router-link>
        </nav>
      </header>

      <main class="glass-main">
        <aside class="sidebar">
          <ProfileWidget />
          <RuntimeWidget />
          <CalendarWidget />
          <!-- <SystemWidget /> -->
        </aside>

        <section class="content-area">
          <div class="articles-list">
            <el-skeleton :rows="5" animated v-if="articlesLoading" />
            <div 
              class="article-card" 
              v-for="article in articles" 
              :key="article.id"
              @click="getArticlesDetail(article.id, auth.token)"
            >
              <div v-if="article.isPinned" class="pinned-badge">
                🔒置顶中
              </div>
              <div class="article-content">
                <div class="article-meta">
                  <span class="article-category">{{ article.categoryName || '未分类' }}</span>
                  <span class="article-date">{{ formatDate(article.createTime || article.updatedAt || article.date) }}</span>
                </div>
                <h3 class="article-title">{{ article.title }}</h3>
                <p class="article-summary">{{ article.summary }}</p>
                <div class="article-footer">
                  <div class="article-stats">
                    <span class="stat">
                      <el-icon :size="14"><View /></el-icon>
                      {{ article.viewCount || 0 }}
                    </span>
                  </div>
                  <button class="read-more">阅读更多 →</button>
                </div>
              </div>
            </div>
          </div>

          <div class="pagination" v-if="!articlesLoading && articles.length > 0">
            <button 
              class="page-btn prev" 
              @click="handlePageChange(currentPage - 1)"
              :disabled="currentPage === 1"
            >
              上一页
            </button>
            <button 
              v-for="page in displayPages" 
              :key="page"
              class="page-btn" 
              :class="{ active: currentPage === page }"
              @click="handlePageChange(page)"
            >
              {{ page }}
            </button>
            <button 
              class="page-btn next" 
              @click="handlePageChange(currentPage + 1)"
              :disabled="currentPage === totalPages"
            >
              下一页
            </button>
          </div>
        </section>
      </main>

      <footer class="glass-footer">
        <div class="footer-content">
          <p>&copy; 2024-2025 花朝九日|FlowerInFire. All rights reserved.</p>
          <p>
            <span class="footer-link" @click="goToBeian">鄂ICP备2025092180号</span> | 
            <span class="footer-link" @click="goToBeian2">
              <img src="/src/assets/备案图标.png" class="beian-icon" alt="备案图标" />
              鄂公网安备42122102000232号
            </span>
          </p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRouter } from 'vue-router';
import { View } from '@element-plus/icons-vue';
import ProfileWidget from '@/components/ProfileWidget.vue';
import CalendarWidget from '@/components/CalendarWidget.vue';
import RuntimeWidget from '@/components/RuntimeWidget.vue';
import { getTheArticlesForHome, getArticlesDetail } from '@/api/ArticleService.js';
import { useAuthStore } from '@/stores/auth.js';
import { HomeArticlesForPC } from '@/api/globals.js';
const router = useRouter();
const auth = useAuthStore();

const articles = ref([]);
const articlesLoading = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);

const displayPages = computed(() => {
  const pages = [];
  const maxDisplay = 5;
  const start = Math.max(1, currentPage.value - Math.floor(maxDisplay / 2));
  const end = Math.min(totalPages.value, start + maxDisplay - 1);
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getArticleList = async () => {
  articlesLoading.value = true;
  try {
    const res = await getTheArticlesForHome(currentPage.value, HomeArticlesForPC.value);
    console.log('后端返回数据:', res);
    if (res.code === 200) {
      // 后端现在返回 {data: [...], total: ...} 结构
      articles.value = res.data.data || [];
      const total = res.data.total || 0;
      totalPages.value = Math.max(1, Math.ceil(total / HomeArticlesForPC.value));
      console.log('当前页:', currentPage.value, '总页数:', totalPages.value, '总数:', total);
    } else {
      articles.value = [];
      totalPages.value = 1;
    }
  } catch (error) {
    console.error('获取文章列表失败:', error);
    articles.value = [];
    totalPages.value = 1;
  } finally {
    articlesLoading.value = false;
  }
};

const goToBeian = () => {
  window.open('https://beian.miit.gov.cn/', '_blank');
};

const goToBeian2 = () => {
  window.open('https://beian.mps.gov.cn/#/query/webSearch?code=42122102000232', '_blank');
};

const handlePageChange = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    getArticleList();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

onMounted(() => {
  getArticleList();
  console.log('PC端页面已加载');
});
</script>

<style scoped>
.home-pc {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.background-blur {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.3) 0%, transparent 50%);
  z-index: 0;
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

.glass-container {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.glass-header {
  position: sticky;
  top: 20px;
  margin: 0 auto;
  width: 95%;
  max-width: 1600px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  padding: 14px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
  transition: all 0.3s ease;
  min-height: 60px;
}

.glass-header:hover {
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.header-left {
  flex: 0 0 auto;
  min-width: 200px;
}

.site-title {
  font-size: 22px;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
}

.glass-nav {
  display: flex;
  gap: 6px;
  flex: 1;
  justify-content: center;
  min-width: 0;
}

.nav-item {
  color: white;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 18px;
  transition: all 0.3s ease;
  position: relative;
  white-space: nowrap;
}

.nav-item:hover,
.nav-item.router-link-active {
  background: rgba(255, 255, 255, 0.2);
}

.glass-main {
  flex: 1;
  padding: 40px 30px;
  max-width: 1600px;
  margin: 0 auto;
  width: 95%;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 100px;
  height: fit-content;
}

.content-area {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.articles-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  align-items: start;
}

.article-card {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  position: relative;
}

.pinned-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: linear-gradient(135deg, #ff6b6b, #ff4747);
  color: white;
  padding: 6px 14px;
  font-size: 12px;
  border-radius: 20px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(255, 71, 71, 0.3);
  z-index: 10;
  letter-spacing: 0.5px;
}

.article-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
}

.article-content {
  flex: 1;
  padding: 28px;
  display: flex;
  flex-direction: column;
}

.article-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.article-category {
  padding: 6px 14px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15));
  border-radius: 16px;
  font-size: 12px;
  color: white;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.article-date {
  padding: 6px 14px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
}

.article-title {
  margin: 0 0 14px;
  font-size: 20px;
  font-weight: 700;
  color: white;
  line-height: 1.4;
  letter-spacing: 0.3px;
}

.article-summary {
  margin: 0 0 24px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.7;
  flex: 1;
  letter-spacing: 0.2px;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}

.article-stats {
  display: flex;
  gap: 16px;
}

.stat {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.read-more {
  padding: 10px 24px;
  border: none;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15));
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.3px;
}

.read-more:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.25));
  transform: translateX(5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pagination {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 20px;
}

.page-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover,
.page-btn.active {
  background: rgba(255, 255, 255, 0.3);
}

.page-btn.prev,
.page-btn.next {
  padding: 8px 20px;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.glass-footer {
  text-align: center;
  padding: 30px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.footer-content p {
  margin: 8px 0;
}

.footer-link {
  cursor: pointer;
  transition: all 0.3s ease;
}

.footer-link:hover {
  color: white;
  text-decoration: underline;
}

.beian-icon {
  height: 12px;
  vertical-align: middle;
}

@media (max-width: 1400px) {
  .glass-main {
    grid-template-columns: 280px 1fr;
    gap: 24px;
  }
  
  .articles-list {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

@media (max-width: 1024px) {
  .glass-header {
    flex-direction: column;
    gap: 16px;
    padding: 16px 24px;
  }
  
  .glass-nav {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .header-right {
    width: 100%;
  }
  
  .search-box {
    width: 100%;
  }
  
  .glass-main {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }
  
  .articles-list {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .glass-header {
    width: 98%;
    padding: 12px 16px;
  }
  
  .site-title {
    font-size: 20px;
  }
  
  .nav-item {
    font-size: 13px;
    padding: 8px 12px;
  }
  
  .articles-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .articles-filter {
    flex-wrap: wrap;
  }
  
  .article-content {
    padding: 16px;
  }
  
  .article-title {
    font-size: 18px;
  }
  
  .article-summary {
    font-size: 14px;
  }
  
  .articles-list {
    grid-template-columns: 1fr;
  }
}
</style>

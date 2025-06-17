<template>
  <div class="ios-app">
    <!-- 顶部导航栏 -->
    <header class="ios-header">
      <h1 class="logo">MelodyCraft</h1>
      <button class="ios-button contact-btn" @click="showContact = true">联系</button>
    </header>

    <!-- 主要内容区 -->
    <main class="ios-content">
      <!-- 欢迎横幅 -->
      <section class="welcome-banner">
        <div class="banner-content">
          <h2>专业编曲服务</h2>
          <p>为您的音乐梦想量身定制</p>
          <button class="ios-button primary" @click="scrollToServices">了解服务</button>
        </div>
      </section>

      <!-- 服务项目 -->
      <section class="services-section" ref="servicesSection">
        <h3 class="section-title">服务项目</h3>
        <div class="service-cards">
          <div
              v-for="service in services"
              :key="service.id"
              class="service-card"
              :class="{ 'highlight': highlightedService === service.id }"
              @mouseenter="highlightedService = service.id"
              @mouseleave="highlightedService = null"
          >
<!--            <div class="service-icon">-->
<!--              <span :class="service.icon"></span>-->
<!--            </div>-->
            <h4>{{ service.title }}</h4>
            <p>{{ service.description }}</p>
            <div class="price-tag">¥{{ service.price }}</div>
          </div>
        </div>
      </section>

      <!-- 作品展示 -->
      <section class="portfolio-section">
        <h3 class="section-title">作品展示</h3>
        <div class="portfolio-grid">
          <div
              v-for="(item, index) in portfolio"
              :key="index"
              class="portfolio-item"
              @click="playDemo(item)"
          >
            <div class="portfolio-cover">
              <img :src="item.cover" :alt="item.title">
              <div class="play-overlay">
                <span class="play-icon">▶</span>
              </div>
            </div>
            <h5>{{ item.title }}</h5>
            <p>{{ item.genre }}</p>
          </div>
        </div>
      </section>

      <!-- 客户评价 -->
      <section class="testimonials-section">
        <h3 class="section-title">客户评价</h3>
        <div class="testimonial-carousel">
          <div
              v-for="(testimonial, index) in testimonials"
              :key="index"
              class="testimonial-card"
              :style="{ transform: `translateX(-${currentTestimonial * 100}%)` }"
          >
            <div class="quote-icon">"</div>
            <p>{{ testimonial.content }}</p>
            <div class="client-info">
              <img :src="testimonial.avatar" :alt="testimonial.name">
              <div>
                <strong>{{ testimonial.name }}</strong>
                <span>{{ testimonial.role }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="carousel-indicators">
          <span
              v-for="(item, index) in testimonials"
              :key="index"
              :class="{ active: currentTestimonial === index }"
              @click="currentTestimonial = index"
          ></span>
        </div>
      </section>

      <!-- 购买流程 -->
      <section class="process-section">
        <h3 class="section-title">购买流程</h3>
        <div class="process-steps">
          <div class="process-step" v-for="(step, index) in processSteps" :key="index">
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-content">
              <h5>{{ step.title }}</h5>
              <p>{{ step.description }}</p>
            </div>
          </div>
        </div>
        <button class="ios-button primary large" @click="showOrderForm = true">立即订购</button>
      </section>
    </main>

    <!-- 底部导航 -->
    <footer class="ios-footer">
      <p>© 2023 MelodyCraft 专业编曲服务</p>
    </footer>

    <!-- 联系弹窗 -->
    <div class="ios-modal" v-if="showContact" @click.self="showContact = false">
      <div class="modal-content">
        <h3>联系我们</h3>
        <p>邮箱: huazhaojiuri@qq.com</p>
        <p>微信: FlowerInFire</p>
        <button class="ios-button" @click="showContact = false">关闭</button>
      </div>
    </div>

    <!-- 订单表单弹窗 -->
    <div class="ios-modal" v-if="showOrderForm" @click.self="showOrderForm = false">
      <div class="modal-content">
        <h3>填写订单</h3>
        <form @submit.prevent="submitOrder">
          <div class="form-group">
            <label for="service">选择服务</label>
            <select id="service" v-model="order.service" class="ios-input">
              <option v-for="service in services" :value="service.id" :key="service.id">
                {{ service.title }} - ¥{{ service.price }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="name">您的姓名</label>
            <input id="name" v-model="order.name" type="text" class="ios-input" required>
          </div>
          <div class="form-group">
            <label for="email">电子邮箱</label>
            <input id="email" v-model="order.email" type="email" class="ios-input" required>
          </div>
          <div class="form-group">
            <label for="details">项目详情</label>
            <textarea id="details" v-model="order.details" class="ios-input" rows="4" required></textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="ios-button" @click="showOrderForm = false">取消</button>
            <button type="submit" class="ios-button primary">提交订单</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 音频播放器 -->
    <div class="audio-player" v-if="currentAudio">
      <div class="player-content">
        <h4>{{ currentAudio.title }}</h4>
        <audio ref="audioElement" :src="currentAudio.demo" controls></audio>
        <button class="ios-button" @click="currentAudio = null">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 响应式数据
const services = ref([
  { id: 1, title: '基础编曲', description: '简单的编曲制作，适合demo或小型项目', price: 500, icon: 'icon-music' },
  { id: 2, title: '标准编曲', description: '完整的编曲制作，适合大多数音乐项目', price: 1200, icon: 'icon-headphones' },
  { id: 3, title: '高级编曲', description: '专业级编曲，含复杂编排和精细混音', price: 2500, icon: 'icon-studio' },
  { id: 4, title: '定制编曲', description: '完全定制，根据您的需求一对一服务', price: 4000, icon: 'icon-star' }
])

const portfolio = ref([
  { title: '希忘Hope', genre: '流行', cover: 'https://n.sinaimg.cn/sinakd20221220s/96/w2048h2048/20221220/676c-0c9551274647d808faa3a377da269f87.jpg', demo: 'demo1.mp3' },
  { title: '好想爱这个世界啊', genre: '轻音乐', cover: 'https://n.sinaimg.cn/sinacn20121/560/w1080h1080/20191207/474f-iknhexh3484812.jpg', demo: 'demo2.mp3' },
  { title: '量变临界点', genre: '电子', cover: 'https://img1.mydrivers.com/img/20221220/6b5bb127-9022-4b58-afb6-d4fe7dffe27b.jpg', demo: 'demo3.mp3' },
  { title: '希忘Hope', genre: '摇滚', cover: 'https://n.sinaimg.cn/sinakd20221220s/96/w2048h2048/20221220/676c-0c9551274647d808faa3a377da269f87.jpg', demo: 'demo4.mp3' }
])

const testimonials = ref([
  {
    name: '张艺',
    role: '独立音乐人',
    content: 'MelodyCraft的编曲让我的作品提升到了专业水准，非常满意他们的服务！',
    avatar: 'https://n.sinaimg.cn/sinakd20221220s/96/w2048h2048/20221220/676c-0c9551274647d808faa3a377da269f87.jpg'
  },
  {
    name: '李娜',
    role: '广告制作人',
    content: '快速响应，专业水准，完美符合我们广告片的音乐需求，强烈推荐！',
    avatar: 'https://n.sinaimg.cn/sinakd20221220s/96/w2048h2048/20221220/676c-0c9551274647d808faa3a377da269f87.jpg'
  },
  {
    name: '王浩',
    role: '游戏开发者',
    content: '为我们的游戏提供了完美的背景音乐，玩家反馈非常好，下次还会合作。',
    avatar: 'https://n.sinaimg.cn/sinakd20221220s/96/w2048h2048/20221220/676c-0c9551274647d808faa3a377da269f87.jpg'
  }
])

const processSteps = ref([
  { title: '咨询沟通', description: '告诉我们您的需求和想法' },
  { title: '确认订单', description: '选择适合的服务并支付定金' },
  { title: '制作阶段', description: '我们开始为您创作音乐' },
  { title: '修改调整', description: '根据您的反馈进行修改' },
  { title: '完成交付', description: '支付尾款并获得最终作品' }
])

// UI状态
const showContact = ref(false)
const showOrderForm = ref(false)
const currentTestimonial = ref(0)
const highlightedService = ref(null)
const currentAudio = ref(null)
const servicesSection = ref(null)

// 订单表单数据
const order = ref({
  service: 2,
  name: '',
  email: '',
  details: ''
})

// 方法
const scrollToServices = () => {
  servicesSection.value.scrollIntoView({ behavior: 'smooth' })
}

const playDemo = (item) => {
  currentAudio.value = item
}

const submitOrder = () => {
  alert(`订单已提交！我们将尽快联系您。\n服务: ${services.value.find(s => s.id === order.value.service).title}\n姓名: ${order.value.name}`)
  showOrderForm.value = false
  // 重置表单
  order.value = {
    service: 2,
    name: '',
    email: '',
    details: ''
  }
}

// 自动轮播
onMounted(() => {
  setInterval(() => {
    currentTestimonial.value = (currentTestimonial.value + 1) % testimonials.value.length
  }, 5000)
})
</script>

<style scoped>
/* iOS风格基础样式 */
.ios-app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  max-width: 100vw;
  min-height: 100vh;
  margin: 0 auto;
  background-color: #f2f2f7;
  color: #1c1c1e;
  overflow-x: hidden;
}

/* 头部样式 */
.ios-header {
  position: sticky;
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: rgba(242, 242, 247, 0.8);
  backdrop-filter: blur(10px);
  z-index: 100;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.logo {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #007aff;
}

/* iOS按钮样式 */
.ios-button {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  background-color: #e5e5ea;
  color: #007aff;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.ios-button.primary {
  background-color: #007aff;
  color: white;
}

.ios-button.large {
  padding: 12px 24px;
  font-size: 16px;
}

.ios-button:hover {
  opacity: 0.9;
}

.ios-button:active {
  transform: scale(0.98);
}

/* 内容区域 */
.ios-content {
  padding: 0 16px 60px;
}

/* 欢迎横幅 */
.welcome-banner {
  background: linear-gradient(135deg, #007aff, #34c759);
  border-radius: 12px;
  padding: 40px 20px;
  margin: 20px 0;
  color: white;
  text-align: center;
}

.welcome-banner h2 {
  font-size: 24px;
  margin: 0 0 8px;
}

.welcome-banner p {
  font-size: 16px;
  margin: 0 0 20px;
  opacity: 0.9;
}

/* 服务卡片 */
.services-section {
  margin: 40px 0;
}

.section-title {
  font-size: 20px;
  margin: 0 0 20px;
  font-weight: 600;
}

.service-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.service-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.service-card.highlight {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.service-card h4 {
  margin: 12px 0 8px;
  font-size: 16px;
}

.service-card p {
  font-size: 14px;
  color: #636366;
  margin: 0 0 12px;
}

.service-icon {
  width: 40px;
  height: 40px;
  background-color: #007aff10;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #007aff;
  font-size: 20px;
}

.price-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: #007aff;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

/* 作品展示 */
.portfolio-section {
  margin: 40px 0;
}

.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.portfolio-item {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.portfolio-cover {
  position: relative;
  aspect-ratio: 1/1;
}

.portfolio-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.play-icon {
  color: white;
  font-size: 24px;
  background-color: rgba(0, 122, 255, 0.8);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.portfolio-item:hover .play-overlay {
  opacity: 1;
}

.portfolio-item h5 {
  font-size: 14px;
  margin: 8px 12px 4px;
}

.portfolio-item p {
  font-size: 12px;
  color: #636366;
  margin: 0 12px 12px;
}

/* 客户评价 */
.testimonials-section {
  margin: 40px 0;
}

.testimonial-carousel {
  display: flex;
  overflow: hidden;
  width: 100%;
  scroll-snap-type: x mandatory;
}

.testimonial-card {
  min-width: 100%;
  scroll-snap-align: start;
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.5s ease;
}

.quote-icon {
  font-size: 32px;
  color: #007aff;
  opacity: 0.2;
  line-height: 0;
  margin-bottom: -10px;
}

.testimonial-card p {
  font-size: 15px;
  line-height: 1.5;
  margin: 16px 0;
}

.client-info {
  display: flex;
  align-items: center;
}

.client-info img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
}

.client-info div {
  display: flex;
  flex-direction: column;
}

.client-info strong {
  font-size: 14px;
}

.client-info span {
  font-size: 12px;
  color: #636366;
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  margin-top: 16px;
  gap: 8px;
}

.carousel-indicators span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #c7c7cc;
  cursor: pointer;
}

.carousel-indicators span.active {
  background-color: #007aff;
}

/* 购买流程 */
.process-section {
  margin: 40px 0;
  text-align: center;
}

.process-steps {
  margin: 24px 0;
}

.process-step {
  display: flex;
  align-items: flex-start;
  margin-bottom: 20px;
  text-align: left;
}

.step-number {
  width: 28px;
  height: 28px;
  background-color: #007aff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  margin-right: 16px;
  flex-shrink: 0;
}

.step-content h5 {
  margin: 0 0 4px;
  font-size: 16px;
}

.step-content p {
  margin: 0;
  font-size: 14px;
  color: #636366;
}

/* 底部样式 */
.ios-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  background-color: white;
  text-align: center;
  font-size: 12px;
  color: #8e8e93;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

/* 模态框样式 */
.ios-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background-color: white;
  border-radius: 14px;
  width: 90%;
  max-width: 400px;
  padding: 24px;
  animation: modalAppear 0.3s ease;
}

.modal-content h3 {
  margin: 0 0 20px;
  font-size: 20px;
  text-align: center;
}

.modal-content p {
  margin: 0 0 16px;
  font-size: 16px;
}

/* 表单样式 */
.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
}

.ios-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #c7c7cc;
  border-radius: 8px;
  font-size: 16px;
  background-color: white;
}

.ios-input:focus {
  outline: none;
  border-color: #007aff;
}

textarea.ios-input {
  min-height: 80px;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* 音频播放器 */
.audio-player {
  position: fixed;
  bottom: 60px;
  left: 0;
  right: 0;
  background-color: white;
  padding: 16px;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.player-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.player-content h4 {
  margin: 0 0 12px;
  font-size: 16px;
}

.player-content audio {
  width: 100%;
  margin-bottom: 12px;
}

/* 动画 */
@keyframes modalAppear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media (max-width: 480px) {
  .service-cards {
    grid-template-columns: 1fr;
  }

  .portfolio-grid {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 85%;
  }
}
</style>
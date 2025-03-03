<template>
  <div class="app">
    <!-- 左侧：参数配置面板 -->
    <div class="left-panel">
      <!-- 基本参数 -->
      <div class="step">
        <h3>基本参数</h3>
        <div class="input-group">
          <div>
            <label for="N">S盒大小(N)</label>
            <input
                id="N"
                type="number"
                v-model="N"
                min="1"
            />
          </div>
          <div>
            <label for="populationSize">种群规模</label>
            <input
                id="populationSize"
                type="number"
                v-model="populationSize"
                min="1"
            />
          </div>
        </div>

        <div class="input-group">
          <div>
            <label for="mutationRate">变异概率</label>
            <input
                id="mutationRate"
                type="number"
                step="0.01"
                v-model="mutationRate"
            />
          </div>
          <div>
            <label for="elitismRate">精英保留比例</label>
            <input
                id="elitismRate"
                type="number"
                step="0.01"
                v-model="elitismRate"
            />
          </div>
          <div>
            <label for="maxGenerations">最大进化代数</label>
            <input
                id="maxGenerations"
                type="number"
                v-model="maxGenerations"
                min="1"
            />
          </div>
        </div>
      </div>

      <!-- 目标指标 -->
      <div class="step">
        <h3>密码学指标</h3>
        <div class="input-group">
          <div>
            <label for="targetNonlinearity">非线性度(nonlin)</label>
            <input
                id="targetNonlinearity"
                type="number"
                step="0.1"
                v-model="targetNonlinearity"
            />
          </div>
          <div>
            <label for="targetDiffUniformity">差分均匀性(diff)</label>
            <input
                id="targetDiffUniformity"
                type="number"
                v-model="targetDiffUniformity"
            />
          </div>
        </div>

        <div class="input-group">
          <div>
            <label for="targetLinearApprox">线性逼近(linear)</label>
            <input
                id="targetLinearApprox"
                type="number"
                step="0.001"
                v-model="targetLinearApprox"
            />
          </div>
          <div>
            <label for="targetAlgebraicDegree">代数次数(degree)</label>
            <input
                id="targetAlgebraicDegree"
                type="number"
                v-model="targetAlgebraicDegree"
            />
          </div>
        </div>

        <div class="input-group">
          <div>
            <label for="targetTermsNumber">代数项数(terms)</label>
            <input
                id="targetTermsNumber"
                type="number"
                v-model="targetTermsNumber"
            />
          </div>
          <div>
            <label for="targetFixedPoints">不动点(fixed)</label>
            <input
                id="targetFixedPoints"
                type="number"
                v-model="targetFixedPoints"
            />
          </div>
        </div>

        <div class="input-group">
          <div>
            <label for="targetDSAC">DSAC</label>
            <input
                id="targetDSAC"
                type="number"
                step="0.01"
                v-model="targetDSAC"
            />
          </div>
        </div>
      </div>

      <!-- 其他参数 -->
      <div class="step">
        <h3>其他配置</h3>
        <div class="input-group">
          <div>
            <label for="desiredSBoxCount">生成S盒数量</label>
            <input
                id="desiredSBoxCount"
                type="number"
                min="1"
                v-model="desiredSBoxCount"
            />
          </div>
<!--          <div>-->
<!--            <label for="logInterval">日志输出间隔</label>-->
<!--            <input-->
<!--                id="logInterval"-->
<!--                type="number"-->
<!--                min="1"-->
<!--                v-model="logInterval"-->
<!--            />-->
<!--          </div>-->
        </div>
      </div>

      <!-- 惩罚权重 -->
      <div class="step">
        <h3>指标权重</h3>
        <!-- 每个权重占一行，你也可用 input-group 并排显示 -->
        <div
            v-for="(value, key) in penaltyWeights"
            :key="key"
            class="input-group"
            style="align-items: center;"
        >
          <div style="flex: 1;">
            <label :for="key" style="margin-right: 10px;">{{ key }}</label>
          </div>
          <div style="flex: 1;">
            <input
                :id="key"
                type="number"
                step="0.1"
                v-model="penaltyWeights[key]"
            />
          </div>
        </div>
      </div>

      <!-- 开始按钮 -->
      <div class="step">
        <button @click="startGeneration" :disabled="loading">
          {{ loading ? "生成中..." : "开始进化" }}
        </button>
      </div>
    </div>

    <!-- 右侧：生成结果展示面板 -->
    <div class="right-panel">
      <div class="step">
        <h3>生成结果</h3>
        <!-- 加载中提示 -->
        <div v-if="loading">
          <p>正在生成，请稍候...</p>
          <el-progress
              :percentage="progress"
              :indeterminate="true"
              color="#4CAF50"
          />
        </div>
        <!-- 有结果时 -->
        <div v-else-if="generationResults.length">
          <ul>
            <li v-for="(item, index) in generationResults" :key="index">
              <!-- 这里使用 v-html 可以直接插入包含 HTML 标签的字符串 -->
              <div v-html="item"></div>
            </li>
          </ul>
        </div>
        <!-- 无结果时 -->
        <div v-else>暂无结果</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onUnmounted, watch} from 'vue'
// 如果你使用了 axios 或自定义封装的 request，请在此处导入
import request from '@/api/request.js' // 根据实际路径调整

// 1. 定义表单绑定的参数
const N = ref(256)
const populationSize = ref(1000)
const mutationRate = ref(0.5)
const elitismRate = ref(0.2)
const maxGenerations = ref(1000)

const targetNonlinearity = ref(112.0)
const targetDiffUniformity = ref(4)
const targetLinearApprox = ref(0.0625)
const targetAlgebraicDegree = ref(7)
const targetTermsNumber = ref(110)
const targetFixedPoints = ref(0)
const targetDSAC = ref(0.7)

const desiredSBoxCount = ref(5)
const logInterval = ref(1)

// 适应度惩罚权重
const penaltyWeights = reactive({
  nonlin: 40.0,
  diff: 30.0,
  linear: 20.0,
  degree: 15.0,
  terms: 10.0,
  fixed: 5.0,
  dsac: 5.0
})

// 2. 定义结果与状态
const loading = ref(false)
const generationResults = ref([])
// 进度条百分比
const progress = ref(0)
let timer = null

// 当 loading 为 true 时启动定时器，随机增加 progress；加载完成时清除定时器，进度条消失
watch(loading, (val) => {
  if (val) {
    progress.value = 0
    timer = setInterval(() => {
      // 随机增加 1~10 的整数
      const inc = Math.floor(Math.random()) + 1
      progress.value += inc
      if (progress.value >= 99) {
        progress.value = 99
      }
    }, 300)
  } else {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    // 可选择直接将 progress 重置（本例不显示进度条时无效）
    progress.value = 0
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
// 3. 生成按钮点击事件
const startGeneration = async () => {
  // 重置结果
  generationResults.value = []
  loading.value = true

  // 组装请求数据
  const payload = {
    N: N.value,
    populationSize: populationSize.value,
    mutationRate: mutationRate.value,
    elitismRate: elitismRate.value,
    maxGenerations: maxGenerations.value,

    targetNonlinearity: targetNonlinearity.value,
    targetDiffUniformity: targetDiffUniformity.value,
    targetLinearApprox: targetLinearApprox.value,
    targetAlgebraicDegree: targetAlgebraicDegree.value,
    targetTermsNumber: targetTermsNumber.value,
    targetFixedPoints: targetFixedPoints.value,
    targetDSAC: targetDSAC.value,

    desiredSBoxCount: desiredSBoxCount.value,
    logInterval: logInterval.value,
    penaltyWeights: penaltyWeights
  }
  const response = await request.post('/geneticSboxGenerator', payload);
  if (response.data.code === 200) {
    const sboxData = response.data.data;
    console.log(sboxData)
    sboxData.forEach((item, idx) => {
      // 拼接第一行，各指标显示
      const statsLine = `diff=${item.targetDiffUniformity}, nonlin=${item.targetNonlinearity}, linear=${Number(item.targetLinearApprox).toFixed(3)}, degree=${item.targetAlgebraicDegree}, terms=${item.targetTermsNumber}, fixed=${item.targetFixedPoints}, dsac=${Number(item.targetDSAC).toFixed(2)}`;
      // 拼接第二行，显示 S盒数组
      const sboxLine = `SBox #${idx + 1} = ${JSON.stringify(item.sbox)}`;
      // 将两行内容合并，用 <br> 换行
      const resultHtml = `<p>${sboxLine}<br>${statsLine}</p>`;
      generationResults.value.push(resultHtml);
    });
    loading.value = false
  }
}
</script>

<style scoped>
.app {
  display: flex;
  gap: 20px;
  padding: 5px;
  justify-content: space-between;
}

.left-panel,
.right-panel {
  flex: 1;
  padding: 25px;
  border-radius: 25px;
  background-color: #FFFFFE;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.step {
  margin-bottom: 5px;
}

.step h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.step label {
  font-size: 1rem;
  color: #666;
  margin-bottom: 5px;
  display: inline-block;
}

.radio-group,
.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.checkbox-column {
  display: flex;
  flex-direction: column;
  width: 48%; /* Ensure each column takes up roughly half the space */
}

.checkbox-column h4 {
  font-size: 1rem;
  color: #333;
  margin-bottom: 10px;
}

input[type="checkbox"] {
  margin: 5px 0;
}

input[type="number"],
textarea {
  width: 100%;
  padding: 10px;
  border-radius: 25px;
  border: 1px solid #ccc;
  font-size: 1rem;
  box-sizing: border-box;
}

textarea {
  min-height: 120px;
  resize: vertical;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

button:active {
  background-color: #388e3c;
}

.right-panel {
  background-color: #FFFFFE;
  border-radius: 25px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.right-panel ul {
  list-style-type: disc;
  padding-left: 20px;
}

.right-panel div {
  font-size: 1rem;
  color: #555;
}

.right-panel h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

/* 单行中排布多个输入框 */
.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.input-group > div {
  flex: 1;
  display: flex;
  flex-direction: column;
}
</style>

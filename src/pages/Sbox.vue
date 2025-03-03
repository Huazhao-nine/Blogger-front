<template>
  <div class="app">
    <!-- Left Panel -->
    <div class="left-panel">
      <div class="step">
        <h3>S盒规格(m,n)</h3>
        <div class="input-group">
          <input type="number" v-model="inputSize" placeholder="输入大小" />
          <input type="number" v-model="outputSize" placeholder="输出大小" />
        </div>
      </div>

      <div class="step">
        <h3>输入Sbox</h3>
        <textarea v-model="sboxContent" placeholder="请输入Sbox内容"></textarea>
      </div>

      <div class="step">
        <h3>选择评估指标</h3>
        <div class="checkbox-group">
          <!-- 基本特性 -->
          <div class="checkbox-column">
            <h4>基本特性</h4>
            <label>
              <input type="checkbox" v-model="selectedIndicators" value="getNonlinearity" />
              非线性度
            </label>
            <label>
              <input type="checkbox" v-model="selectedIndicators" value="getDiffUniformity" />
              差分均匀性
            </label>
            <label>
              <input type="checkbox" v-model="selectedIndicators" value="getDSAC" />
              雪崩效应
            </label>
          </div>

          <!-- 代数特性 -->
          <div class="checkbox-column">
            <h4>代数特性</h4>
            <label>
              <input type="checkbox" v-model="selectedIndicators" value="getAlgebraicDegree" />
              代数次数
            </label>
            <label>
              <input type="checkbox" v-model="selectedIndicators" value="getANF" />
              代数正规形
            </label>
            <label>
              <input type="checkbox" v-model="selectedIndicators" value="getNumberOfTerms" />
              代数项数分布
            </label>
          </div>

          <!-- 扩散与固定点 -->
          <div class="checkbox-column">
            <h4>扩散与固定点</h4>
            <label>
              <input type="checkbox" v-model="selectedIndicators" value="getHammingDistance" />
              扩散特性（汉明距离）
            </label>
            <label>
              <input type="checkbox" v-model="selectedIndicators" value="getFixedPoints" />
              不动点个数
            </label>
          </div>

          <!-- 其他特性 -->
          <div class="checkbox-column">
            <h4>其他特性</h4>
            <label>
              <input type="checkbox" v-model="selectedIndicators" value="getBestLinearApproximationAdvantage" />
              最佳线性逼近优势
            </label>
            <label>
              <input type="checkbox" v-model="selectedIndicators" value="getSelfInverseProperty" />
              自对合性
            </label>
          </div>
        </div>
      </div>

      <div class="step">
        <button @click="startEvaluation">开始评估</button>
      </div>
    </div>

    <!-- Right Panel -->
    <div class="right-panel">
      <div class="step">
        <h3>评估结果</h3>
        <div v-if="evaluationResults.length">
          <ul>
            <li v-for="(result, index) in evaluationResults" :key="index">
              <!-- 这里使用v-html来渲染包含HTML的内容，比如表格 -->
              <div v-html="result"></div>
            </li>
          </ul>
        </div>
        <div v-else>暂无评估结果</div>
      </div>
    </div>

  </div>
</template>

<script setup>
import {ref} from 'vue';
import axios from "axios";
import request from "@/api/request.js";

const inputSize = ref(8);
const outputSize = ref(8);
const sboxContent = ref('38, 36, 199, 220, 222, 248, 55, 63, 30, 34, 198, 54, 211, 48, 247, 26, 92, 83, 93, 124, 27, 223, 217, 130, 95, 137, 214, 136, 10, 60, 28, 210, 175, 35, 24, 89, 249, 131, 47, 235, 173, 90, 127, 91, 129, 138, 8, 242, 106, 71, 192, 141, 159, 46, 116, 171, 240, 230, 225, 56, 19, 105, 197, 9, 111, 88, 45, 65, 50, 49, 121, 21, 69, 195, 134, 11, 115, 70, 232, 4, 100, 224, 62, 208, 153, 101, 133, 167, 23, 229, 74, 252, 13, 174, 152, 179, 189, 213, 6, 226, 185, 246, 227, 253, 188, 238, 250, 1, 190, 178, 98, 239, 234, 59, 166, 75, 39, 177, 53, 180, 144, 161, 172, 140, 68, 243, 164, 81, 112, 0, 40, 135, 107, 145, 231, 94, 80, 147, 128, 168, 122, 110, 196, 143, 126, 254, 52, 150, 186, 170, 77, 33, 117, 79, 157, 255, 73, 31, 207, 20, 233, 42, 216, 37, 176, 5, 67, 221, 64, 191, 86, 204, 82, 169, 205, 154, 183, 58, 165, 206, 156, 14, 237, 193, 57, 251, 51, 244, 7, 66, 17, 114, 139, 201, 142, 119, 84, 18, 108, 125, 182, 163, 245, 78, 219, 2, 158, 162, 151, 109, 215, 212, 97, 87, 149, 120, 32, 123, 22, 3, 241, 99, 43, 160, 202, 61, 155, 96, 113, 85, 25, 12, 194, 41, 103, 29, 148, 236, 200, 209, 104, 76, 16, 15, 146, 132, 181, 44, 102, 187, 118, 184, 228, 72, 218, 203');
// 选中的评估指标
const selectedIndicators = ref([
  "getNonlinearity",
  "getDiffUniformity",
  "getDSAC",
  "getAlgebraicDegree",
  "getNumberOfTerms",
  "getHammingDistance",
  "getFixedPoints",
  "getBestLinearApproximationAdvantage",
  "getSelfInverseProperty"
]);
const evaluationResults = ref([]);

// 请求发送的基本配置

// 发送请求并获取数据
const sendRequest = async (indicator) => {
  let box = {
    m: inputSize.value,
    n: outputSize.value,
    value : sboxContent.value.split(',').map(item => parseInt(item.trim())),
  }
  try {
    const response = await request.post('/' + indicator, box);
    // console.log("response", response.data.data)
    return response;
  } catch (error) {
    console.error(`请求 ${indicator} 失败:`, error);
    return `${indicator} 请求失败`;
  }
};

const startEvaluation = async () => {
  evaluationResults.value = [];
  // 循环遍历用户选中的评估指标
  for (let indicator of selectedIndicators.value) {
    const res = await sendRequest(indicator);

    // 对指标进行友好命名
    let displayIndicator = indicator;
    if (indicator === 'getNonlinearity') displayIndicator = '非线性度';
    if (indicator === 'getDiffUniformity') displayIndicator = '差分均匀性';
    if (indicator === 'getBestLinearApproximationAdvantage') displayIndicator = '最佳线性逼近优势';
    if (indicator === 'getAlgebraicDegree') displayIndicator = '代数次数';
    if (indicator === 'getNumberOfTerms') displayIndicator = '代数项数';
    if (indicator === 'getANF') displayIndicator = '代数正规形';
    if (indicator === 'getFixedPoints') displayIndicator = '不动点';
    if (indicator === 'getHammingDistance') displayIndicator = '扩散特性（汉明距离）(平均，最小，最大)';
    if (indicator === 'getDSAC') displayIndicator = '雪崩特性';
    if (indicator === 'getSelfInverseProperty') displayIndicator = '自对合性';
    let resultText = `${displayIndicator} : `
    // 处理ANF数组（代数正规形）
    if (indicator === 'getANF' && Array.isArray(res.data.data)) {
      resultText = `${displayIndicator}: <br>`;  // 确保第一行有换行
      // 去除空值并格式化ANF项
      const anfFormatted = res.data.data.filter(item => item != null) // 去除空值
          .map((item, index) => `ANF-${index}: ${item.trim().replace(/\s+/g, ' ')}`) // 去除多余空格
          .join("<br>"); // 使用 <br> 标签来替代换行符，每个ANF项占一行
      resultText += anfFormatted ? anfFormatted : "无有效结果";
    }
    // 处理雪崩特性（二维数组）
    else if (indicator === 'getDSAC' && Array.isArray(res.data.data) && Array.isArray(res.data.data[0])) {
      // 构造HTML表格
      const matrix = res.data.data.map((row, rowIndex) => {
        // 忽略第一行空行
        if (rowIndex === 0 && row.every(cell => cell === null || cell === '')) {
          return ''; // 返回空字符串表示跳过这一行
        }

        const rowHtml = row.map(cell => {
          return `<td>${cell.toFixed(6)}</td>`;  // 保留6位小数
        }).join('');
        return `<tr>${rowHtml}</tr>`; // 每行用<tr>包裹
      }).filter(row => row !== '').join(''); // 过滤掉空行

      resultText += `<table><thead><tr>${new Array(res.data.data[0].length).fill('<th></th>').join('')}</tr></thead><tbody>${matrix}</tbody></table>`;
    } else {
      // 默认处理为JSON格式输出
      console.log(res.data)
      resultText += JSON.stringify(res.data.data) || "无有效结果";
    }

    // 将处理后的结果推送到评估结果
    evaluationResults.value.push(resultText);
  }
};







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

/* Flex layout for input group to align input fields on a single row */
.input-group {
  display: flex;
  gap: 10px; /* Space between inputs */
}

.input-group input {
  flex: 1; /* Ensure both inputs take equal space */
}
</style>

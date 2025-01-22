<template>
  <div>
    <!-- 用户复制文字后生成书签 -->
    <div class="bookmark-container">
      <h2>生成你的书签</h2>
      <p>谁是我们的敌人？谁是我们的朋友？这个问题是革命的首要问题。中国过去一切革命斗争成效甚少，其基本原因就是因为不能团结真正的朋友，以攻击真正的敌人。革命党是群众的向导，在革命中未有革命党领错了路而革命不失败的。我们的革命要有不领错路和一定成功的把握，不可不注意团结我们的真正的朋友，以攻击我们的真正的敌人。</p>
      <p>2131321312312afdfdfdsfadfadsf</p>
      <button @click="generateBookmark">生成书签</button>
      <svg ref="svgRef" xmlns="http://www.w3.org/2000/svg" width="500" height="300" style="border: 1px solid #d3d3d3;">
        <!-- 这里是动态生成的文本 -->
      </svg>
      <button v-if="imageUrl" @click="downloadImage">下载书签</button>
      <img v-if="imageUrl" :src="imageUrl" alt="生成的书签" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const svgRef = ref(null);
const imageUrl = ref(null);

const generateBookmark = () => {
  const text = window.getSelection().toString();  // 获取选中的文本
  if (!text) {
    alert("请先选择一些文本!");
    return;
  }

  // 确保字体已加载
  const font = new FontFace("LXGW WenKai", "url(/fonts/LXGWWenKai-Medium.ttf)");
  font.load().then(() => {
    document.fonts.add(font);
    const svg = svgRef.value;

    // 清空SVG之前的内容
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // 设置字体和文本
    const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textElement.setAttribute("font-family", "'LXGW WenKai', sans-serif");  // 使用网站的字体
    textElement.setAttribute("font-size", "20");
    textElement.setAttribute("fill", "black");
    textElement.setAttribute("x", "10"); // 设置文字从左侧开始
    textElement.setAttribute("y", "50%");
    textElement.setAttribute("text-anchor", "start"); // 从左往右排列

    // 设置画布宽度和字体的最大宽度
    const canvasWidth = 500;
    const lineHeight = 30;
    const maxWidth = 450;  // 设置最大宽度，防止文字超出画布

    // 将文本分割成行
    const words = text.split('');  // 分割成单个字符
    let lines = [];
    let currentLine = "";

    // 根据最大宽度计算换行
    words.forEach(word => {
      const testLine = currentLine + word;
      const testWidth = getTextWidth(testLine, "20px 'LXGW WenKai', sans-serif");

      if (testWidth > maxWidth) {
        lines.push(currentLine);  // 当前行添加到行数组
        currentLine = word;  // 新的一行
      } else {
        currentLine = testLine;  // 当前行继续添加单词
      }
    });

    // 添加最后一行
    if (currentLine) {
      lines.push(currentLine);
    }

    // 在SVG中绘制每行文本
    let yOffset = 50;
    lines.forEach((line, index) => {
      const lineElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
      lineElement.setAttribute("x", "10"); // 从左侧开始
      lineElement.setAttribute("y", yOffset);
      lineElement.setAttribute("text-anchor", "start"); // 左对齐
      lineElement.setAttribute("font-size", "20");
      lineElement.setAttribute("fill", "black");
      lineElement.textContent = line;

      svg.appendChild(lineElement);
      yOffset += lineHeight;  // 更新y坐标
    });

    // 生成图片URL
    const svgString = new XMLSerializer().serializeToString(svg);

    // 使用TextEncoder对非拉丁字符进行编码，避免btoa报错
    const encodedSvg = new TextEncoder().encode(svgString);
    const base64Svg = btoa(String.fromCharCode.apply(null, encodedSvg));

    // 显示生成的书签
    imageUrl.value = `data:image/svg+xml;base64,${base64Svg}`;
  }).catch((error) => {
    console.error("字体加载失败:", error);
  });
};


const downloadImage = () => {
  const link = document.createElement("a");
  link.href = imageUrl.value;
  link.download = "bookmark.svg";  // 文件下载名称
  link.click();
};

// 获取文本的宽度
function getTextWidth(text, font) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font = font;
  return context.measureText(text).width;
}
</script>

<style scoped>
@font-face {
  font-family: "LXGW WenKai"; /* 你可以给这个字体起个名字 */
  src: url("/fonts/LXGWWenKai-Medium.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}

body {
  font-family: "LXGW WenKai", sans-serif; /* 使用你定义的字体 */
}

.bookmark-container {
  text-align: center;
  padding: 20px;
}

.bookmark-container h2 {
  font-size: 24px;
  margin-bottom: 10px;
}

.bookmark-container button {
  margin: 10px;
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
}

img {
  margin-top: 20px;
  max-width: 100%;
}
</style>

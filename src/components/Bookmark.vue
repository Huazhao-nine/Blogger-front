<template>
    <canvas ref="bookmarkCanvas" style="display: none;"></canvas>
    <div class="preview-container">
      <img :src="previewUrl" alt="书签预览" />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import QRCode from "qrcode";
import {useRoute, useRouter} from "vue-router";
import {WEB_URL} from "@/api/globals.js";
const props = defineProps({
  article: {
    type: Object,
  },
  selection: {
    type: String,
  }
});
const route = useRoute();
const router = useRouter()
// 引用 Canvas 元素
const bookmarkCanvas = ref(null);
const previewUrl = ref(""); // 预览图片的 URL
// 获取当前日期
const getCurrentDate = () => {
  const now = new Date();
  return `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
};
const getCssHeight = (text, context, maxWidth, lineHeight) => {
  const words = text.split(""); // 按字分割，适应中文
  let line = "";
  let totalHeight = 0; // 初始高度

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i];
    const metrics = context.measureText(testLine);
    const testWidth = metrics.width;

    if (testWidth > maxWidth && line !== "") {
      line = words[i]; // 换行
      totalHeight += lineHeight;
    } else {
      line = testLine;
    }
  }
  // 最后一行高度
  totalHeight += lineHeight;

  // 加上固定内容的高度
  return totalHeight;
};
// 生成书签功能
const generateBookmark = async () => {
  const selection = props.selection
  // 复制选中文字到剪贴板
  const canvas = bookmarkCanvas.value;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.resetTransform();
  ctx.font = '25px "LXGW Bright Medium", sans-serif';
  ctx.textAlign = "start";
  ctx.textBaseline = "top";
  // 设置 CSS 和高分辨率
  // 文本绘制配置
  const cssWidth = 600;
  const lineHeight = 36; // 每行文字的高度
  const padding = 20; // 左侧和顶部的边距
  const maxWidth = cssWidth - 2 * padding; // 最大行宽
  let currentY = padding;
  const title = "- " + props.article.title;
  const author = "- 花朝九日's blogger";
  // console.log('router',route);
  const url = WEB_URL + route.path;
  // const url = router.currentRoute.value.fullpath;
  const additionalHeight = getCssHeight(title + author + url, ctx, maxWidth, lineHeight) + 240; // 固定内容高度 (摘录于、分割线、标题等)
  console.log(additionalHeight)
  const cssHeight = getCssHeight(selection, ctx, maxWidth, lineHeight) + additionalHeight;
  const devicePixelRatio = window.devicePixelRatio || 1;
  canvas.width = cssWidth * devicePixelRatio;
  canvas.height = cssHeight * devicePixelRatio;
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;
  // 缩放内容
  ctx.scale(devicePixelRatio, devicePixelRatio);
  // 绘制背景
  ctx.fillStyle = "#000"; // 黑色背景
  ctx.fillRect(0, 0, cssWidth, cssHeight);
  ctx.font = '25px "LXGW Bright Medium", sans-serif'; // 字体大小
  ctx.fillStyle = "#FFFFFE"; // 白色文字
  ctx.textAlign = "start"; // 从左到右显示
  ctx.textBaseline = "top"; // 从顶部开始绘制
  // 绘制 "摘录于" 和日期
  const currentDate = getCurrentDate();
  currentY += lineHeight / 2; // 空一点距离
  ctx.fillText(`摘录于 ${currentDate}`, padding, currentY);
  // 生成二维码
  const qrCodeCanvas = document.createElement("canvas");
  await QRCode.toCanvas(qrCodeCanvas, url, {width: 200, margin: 0});
  // 将二维码绘制到右上角
  ctx.drawImage(qrCodeCanvas, cssWidth - 120, padding, 100, 100);
  currentY += lineHeight * 2.4; // 空一行
  // 自动换行函数
  const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
    const words = text.split(""); // 按字分割，适应中文
    let line = "";
    let totalHeight = y; // 初始高度
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i];
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && line !== "") {
        context.fillText(line, x, totalHeight);
        line = words[i];
        totalHeight += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, totalHeight);
    return totalHeight + lineHeight; // 返回总高度
  };
  // 绘制选中文字
  currentY = wrapText(ctx, selection, padding, currentY, maxWidth, lineHeight);
  // 绘制虚线分割线
  currentY += lineHeight / 4; // 空一点距离
  ctx.strokeStyle = "#fff";
  ctx.setLineDash([10, 5]); // 虚线样式
  ctx.beginPath();
  ctx.moveTo(padding, currentY);
  ctx.lineTo(cssWidth - padding, currentY);
  ctx.stroke();
  ctx.setLineDash([]); // 清除虚线样式
  currentY += padding; // 分割线下面留空间
  // 绘制标题、作者和网址
  ctx.fillText(title, padding, currentY);
  currentY += lineHeight;
  ctx.fillText(author, padding, currentY);
  currentY += lineHeight;
  currentY = wrapText(ctx, "- "+ url, padding, currentY, maxWidth, lineHeight);

  // 导出图片 URL
  const imageURL = canvas.toDataURL("image/png");
  previewUrl.value = imageURL; // 设置为预览图片地址
};


// 组件挂载时添加监听
onMounted(() => {
  generateBookmark()
});

// 组件卸载时移除监听
onUnmounted(() => {
});
</script>

<style scoped>
body {
  font-family: "LXGW Bright Medium", sans-serif;
}

.preview-container {
  margin-top: 20px;
  text-align: center;
}

.preview-container img {
  max-width: 100%;
  height: auto;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

html {
  font-size: 1.0rem;
  line-height: 2;
}
</style>

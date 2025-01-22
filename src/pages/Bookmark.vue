<template>
  <div id="bookmark-container"  v-if="!previewUrl" >
    <p>燕子去了，有再來的時候；楊柳枯了，有再青的時候；桃花謝了，有再開的時候。但是，聰明的，你告訴我，我們的日子爲什麼一去不復返呢？——是有人偷了他們罷：那是誰？又藏在何處呢？是他們自己逃走了罷：現在又到了哪裏呢？<br>　　我不知道他們給了我多少日子；但我的手確乎是漸漸空虛了。在默默裏算着，八千多日子已經從我手中溜去；像針尖上一滴水滴在大海裏，我的日子滴在時間的流裏，沒有聲音，也沒有影子。我不禁頭涔涔而淚潸潸了。<br>　　去的盡管去了，來的盡管來着；去來的中間，又怎樣地匆匆呢？早上我起來的時候，小屋裏射進兩三方斜斜的太陽。太陽他有腳啊，輕輕悄悄地挪移了；我也茫茫然跟着旋轉。於是——洗手的時候，日子從水盆裏過去；喫飯的時候，日子從飯碗裏過去；默默時，便從凝然的雙眼前過去。我覺察他去的匆匆了，伸出手遮挽時，他又從遮挽着的手邊過去，天黑時，我躺在牀上，他便伶伶俐俐地從我身上跨過，從我腳邊飛去了。等我睜開眼和太陽再見，這算又溜走了一日。我掩着面嘆息。但是新來的日子的影兒又開始在嘆息裏閃過了。<br>　　在逃去如飛的日子裏，在千門萬戶的世界裏的我能做些什麼呢？只有徘徊罷了，只有匆匆罷了；在八千多日的匆匆裏，除徘徊外，又剩些什麼呢？過去的日子如輕煙，被微風吹散了，如薄霧，被初陽蒸融了；我留着些什麼痕跡呢？我何曾留着像遊絲樣的痕跡呢？我赤裸裸來到這世界，轉眼間也將赤裸裸的回去罷？但不能平的，爲什麼偏要白白走這一遭啊？<br>　　你聰明的，告訴我，我們的日子爲什麼一去不復返呢？</p>
    <button @click="generateBookmark">生成书签</button>
    <canvas ref="bookmarkCanvas" style="display: none;"></canvas>
  </div>
    <div class="preview-container" v-else>
      <h3 @click = "previewUrl = ''">书签预览(点我关闭)</h3>
      <img :src="previewUrl" alt="书签预览" />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import QRCode from "qrcode";
// 引用 Canvas 元素
const bookmarkCanvas = ref(null);
const previewUrl = ref(""); // 预览图片的 URL
// 获取当前日期
const getCurrentDate = () => {
  const now = new Date();
  return `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}`;
};
const getCssHeight = (text, context, maxWidth, lineHeight, additionalHeight) => {
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
  return totalHeight + additionalHeight;
};
// 生成书签功能
const generateBookmark = async () => {
  if (!navigator.clipboard || !navigator.clipboard.readText) {
    ElMessage.error("剪贴板 API 不受支持！");
    return;
  }

  ElMessage.success("2132132")
  const selection = await navigator.clipboard.readText();
  ElMessage.success("AAAAA")

  // 复制选中文字到剪贴板
  const canvas = bookmarkCanvas.value;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.resetTransform();
  ctx.font = '25px "LXGW WenKai TC Medium", sans-serif';
  ctx.textAlign = "start";
  ctx.textBaseline = "top";
  // 设置 CSS 和高分辨率
  // 文本绘制配置
  const cssWidth = 600;
  const lineHeight = 36; // 每行文字的高度
  const padding = 20; // 左侧和顶部的边距
  const maxWidth = cssWidth - 2 * padding; // 最大行宽
  let currentY = padding;
  const additionalHeight = 300; // 固定内容高度 (摘录于、分割线、标题等)
  const cssHeight = getCssHeight(selection, ctx, maxWidth, lineHeight, additionalHeight);
  console.log(cssHeight)
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
  ctx.font = '25px "LXGW WenKai TC Medium", sans-serif'; // 字体大小
  ctx.fillStyle = "#fff"; // 白色文字
  ctx.textAlign = "start"; // 从左到右显示
  ctx.textBaseline = "top"; // 从顶部开始绘制
  // 绘制 "摘录于" 和日期
  const currentDate = getCurrentDate();
  currentY += lineHeight / 2; // 空一点距离
  ctx.fillText(`摘录于 ${currentDate}`, padding, currentY);
  // 生成二维码
  const url = "https://hzjr.top/Article/40/cong-cong";
  const qrCodeCanvas = document.createElement("canvas");
  await QRCode.toCanvas(qrCodeCanvas, url, {width: 80, margin: 0});
  // 将二维码绘制到右上角
  ctx.drawImage(qrCodeCanvas, cssWidth - 100, padding, 80, 80);
  currentY += lineHeight * 2; // 空一行
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
  currentY += lineHeight / 2; // 空一点距离
  ctx.strokeStyle = "#fff";
  ctx.setLineDash([10, 10]); // 虚线样式
  ctx.beginPath();
  ctx.moveTo(padding, currentY);
  ctx.lineTo(cssWidth - padding, currentY);
  ctx.stroke();
  ctx.setLineDash([]); // 清除虚线样式
  currentY += lineHeight; // 分割线下面留空间
  // 绘制标题、作者和网址
  const title = "- 匆匆";
  const author = "- 花朝九日's blogger";
  ctx.fillText(title, padding, currentY);
  currentY += lineHeight;
  ctx.fillText(author, padding, currentY);
  currentY += lineHeight;
  ctx.fillText("- "+ url, padding, currentY);
  // 导出图片 URL
  const imageURL = canvas.toDataURL("image/png");
  previewUrl.value = imageURL; // 设置为预览图片地址
};


// 监听用户复制事件
const onCopy = () => {
  ElMessage.success("复制成功,正在生成书签")
  generateBookmark()

};

// 组件挂载时添加监听
onMounted(() => {
  document.addEventListener("copy", onCopy);
});

// 组件卸载时移除监听
onUnmounted(() => {
  document.removeEventListener("copy", onCopy);
});
</script>

<style scoped>
/* 引入本地或 CDN 字体 */
@import 'lxgw-wenkai-tc-web/style.css';

body {
  font-family: "LXGW WenKai TC Medium", sans-serif;
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

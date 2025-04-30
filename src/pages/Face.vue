<script setup lang="ts">

import FaceSlider from "../components/FaceSlider.vue";

const maxUnhappyCount = 500;
const animationSpeed = 0.1;
const normalFace = { happiness: 0.9, derp: 1, px: 0.5, py: 0.5 };
const normalIUi = {
  btnHappyText: "爱我",
  btnUnhappyText: "不爱",
  titleText: "你爱我吗？",
  subtitleText: "宝宝爱我"
};
</script>

<template>
  <div class="center-container">
    <FaceSlider :maxUnhappyCount="maxUnhappyCount" :animationSpeed="animationSpeed" :normalFace="normalFace"
                :normalIUi="normalIUi" />
  </div>
</template>

<style scoped>
.center-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
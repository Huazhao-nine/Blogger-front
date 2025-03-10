<script setup>
import { onMounted, ref } from 'vue';
import * as THREE from 'three';

const container = ref(null);
const visible = ref(true);

onMounted(() => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({alpha: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.value.appendChild(renderer.domElement);

  // 创建立方体
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial({color: 0x44aa88});
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // 添加光源
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1).normalize();
  scene.add(light);

  camera.position.z = 2;

  function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }

  animate();
});

const handleClick = () => {
  visible.value = false;
};
</script>

<template>
  <div v-if="visible" class="overlay" @click="handleClick">
    <div ref="container" class="three-container"></div>
    <div class="enter-text">点击进入</div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: black;
  z-index: 9999;
  transition: opacity 0.5s ease-in-out;
}

.three-container {
  width: 100vw;
  height: 100vh;
}

.enter-text {
  position: absolute;
  bottom: 10%;
  color: white;
  font-size: 20px;
  cursor: pointer;
}
</style>

import {createApp} from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from "@/router/index.js";
// 引入 Pinia
import {createPinia} from 'pinia'

//注册组件


const app = createApp(App)

app.use(ElementPlus)
app.use(router);
app.use(createPinia())
app.mount('#app')

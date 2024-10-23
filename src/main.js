import { createApp } from 'vue'
import ElmentPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'
import router from './router'


const app = createApp(App)
app.use(router)
app.use(ElmentPlus)
app.mount('#app')


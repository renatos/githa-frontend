import { createApp } from 'vue'
import './assets/base.css'
import './assets/forms.css'
import App from './App.vue'
import router from './router'
import { configService } from './services/configService'

const app = createApp(App)

app.use(router)

configService.loadConfig().then(() => {
    app.mount('#app')
})

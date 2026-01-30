import { createApp } from 'vue'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import Material from '@primevue/themes/material';
import ToastService from 'primevue/toastservice';
import './assets/base.css'
import './assets/forms.css'
import './assets/modal.css'
import App from './App.vue'
import router from './router'
import { configService } from './services/configService'

const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: Material
    }
});
app.use(ToastService);

configService.loadConfig().then(() => {
    app.mount('#app')
})

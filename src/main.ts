import { VueQueryPlugin, type VueQueryPluginOptions } from '@tanstack/vue-query';
import { createPinia } from 'pinia';
import { createApp } from 'vue';

import '@/assets/styles/main.css';

import App from './App.vue';
import router from './router';

import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';

import Aura from '@primevue/themes/aura';
import 'primeicons/primeicons.css';
import PrimeVue from 'primevue/config';

const vueQueryPluginOptions: VueQueryPluginOptions = {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retryOnMount: false,
        retry: false
      }
    }
  }
};

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(VueQueryPlugin, vueQueryPluginOptions);
app.use(ElementPlus);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: false || 'none'
    }
  }
});
app.mount('#app');

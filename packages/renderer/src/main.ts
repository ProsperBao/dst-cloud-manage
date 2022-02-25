import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { setupLayouts } from 'virtual:generated-layouts'
import App from './App.vue'

import generatedRoutes from '~pages'

const app = createApp(App)

// create router instance
const router = createRouter({
  history: createWebHistory(),
  routes: setupLayouts(generatedRoutes),
})
app.use(router)

// register modules
Promise.all(Object.values(import.meta.globEager('./modules/*.ts')).map(i => i.install?.({ app, router })))

app.mount('#app')
  .$nextTick(window.removeLoading)

import { createApp } from 'vue'
import App from './App.vue'

import { createRouter, createWebHistory } from "vue-router";
import routes from "~pages";


const app = createApp(App)

// create router instance
app.use(createRouter({
  history: createWebHistory(),
  routes,
}))
  
// register modules
Object.values(import.meta.globEager('./modules/*.ts')).map(i => i.install?.({app}))

app.mount('#app')
.$nextTick(window.removeLoading)

// console.log('fs', window.fs)
// console.log('ipcRenderer', window.ipcRenderer)

// Usage of ipcRenderer.on
window.ipcRenderer.on('main-process-message', (_event, ...args) => {
  console.log('[Receive Main-process message]:', ...args)
})

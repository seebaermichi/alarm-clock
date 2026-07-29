import { createApp } from 'vue'
import '@/styles/themes.scss'
import '@/styles/base.scss'
import App from '@/ui/App.vue'
import { createWebPlatform } from '@/platform/web.js'

createApp(App).provide('platform', createWebPlatform()).mount('#app')

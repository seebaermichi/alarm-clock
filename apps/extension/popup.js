import { createApp } from 'vue'
import '@/styles/themes.scss'
import '@/styles/base.scss'
import '@/styles/popup.scss'
import App from '@/ui/App.vue'
import { createExtensionPlatform } from '@/platform/extension.js'

createApp(App).provide('platform', createExtensionPlatform()).mount('#app')

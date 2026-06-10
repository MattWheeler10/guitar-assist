import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

import HomeView from './views/HomeView.vue'
import SongView from './views/SongView.vue'
import ChordChallengeView from './views/ChordChallengeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/song/:id', component: SongView },
    { path: '/chord-challenge', component: ChordChallengeView },
  ],
})

createApp(App).use(router).mount('#app')

<template>
  <div class="min-h-screen">
    <nav class="border-b border-stone-200 bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2.5 group cursor-pointer">
          <div class="w-8 h-8 rounded-xl bg-amber-400 flex items-center justify-center shadow-sm group-hover:bg-amber-500 transition-colors">
            <svg class="w-4.5 h-4.5 fill-white" viewBox="0 0 24 24">
              <path d="M19.3 4.7a7 7 0 0 0-9.9 0L3 11.1a7 7 0 0 0 9.9 9.9l6.4-6.4a7 7 0 0 0 0-9.9zM12.5 19.6a5 5 0 0 1-7.1-7.1l1.4-1.4 7.1 7.1-1.4 1.4zm5-5L11.4 8.5l1.4-1.4a5 5 0 0 1 7.1 7.1l-2.4 2.4z"/>
            </svg>
          </div>
          <span class="font-bold text-xl text-stone-800 tracking-tight group-hover:text-amber-600 transition-colors" style="font-family:'Fredoka',sans-serif">
            GuitarAssist
          </span>
        </router-link>
        <div class="text-xs text-stone-400 font-medium bg-stone-100 px-3 py-1 rounded-full">
          {{ songCount }} songs
        </div>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSongs } from './composables/useSongs'

const { songs } = useSongs()
const songCount = computed(() => songs.value.length)
</script>

<template>
  <div class="min-h-screen">
    <nav class="border-b border-stone-200 bg-white/90 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2.5 group cursor-pointer">
          <div class="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center shadow-sm group-hover:bg-amber-500 transition-colors">
            <svg class="w-6 h-6" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <!-- Neck -->
              <rect x="14" y="2" width="4" height="17" rx="1.5" fill="white" opacity="0.95"/>
              <!-- Headstock -->
              <rect x="12" y="1" width="8" height="4" rx="1.5" fill="white" opacity="0.95"/>
              <!-- Tuning pegs (left) -->
              <circle cx="12" cy="2.5" r="1.3" fill="white" opacity="0.7"/>
              <circle cx="12" cy="4.5" r="1.3" fill="white" opacity="0.7"/>
              <!-- Tuning pegs (right) -->
              <circle cx="20" cy="2.5" r="1.3" fill="white" opacity="0.7"/>
              <circle cx="20" cy="4.5" r="1.3" fill="white" opacity="0.7"/>
              <!-- Nut -->
              <rect x="13.5" y="5.5" width="5" height="1" rx="0.5" fill="rgba(255,255,255,0.5)"/>
              <!-- Guitar body — figure-8 shape via two overlapping ellipses with a waist -->
              <!-- Upper bout -->
              <ellipse cx="16" cy="22" rx="7" ry="6" fill="white" opacity="0.95"/>
              <!-- Lower bout -->
              <ellipse cx="16" cy="30" rx="9" ry="8" fill="white" opacity="0.95"/>
              <!-- Soundhole -->
              <circle cx="16" cy="28" r="3" fill="#F59E0B"/>
              <circle cx="16" cy="28" r="2" fill="white" opacity="0.15"/>
              <!-- Bridge -->
              <rect x="12.5" y="33" width="7" height="1.5" rx="0.75" fill="#F59E0B"/>
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

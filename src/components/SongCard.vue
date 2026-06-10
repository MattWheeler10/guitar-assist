<template>
  <div class="relative group">
    <router-link
      :to="`/song/${song.id}`"
      class="block rounded-2xl border border-stone-200 bg-white hover:border-amber-300 hover:shadow-lg hover:shadow-amber-100/60 transition-all duration-200 p-4 cursor-grab active:cursor-grabbing select-none shadow-sm"
      draggable="true"
      @dragstart.stop="onDragStart"
      @dragend.stop="onDragEnd"
      @click.prevent="navigate"
    >
      <div class="flex items-start justify-between gap-2 mb-3">
        <div class="flex-1 min-w-0">
          <h3 class="font-bold text-stone-800 text-sm leading-tight truncate group-hover:text-amber-600 transition-colors" style="font-family:'Fredoka',sans-serif">
            {{ song.title }}
          </h3>
          <p class="text-xs text-stone-500 mt-0.5 truncate">{{ song.artist }}</p>
        </div>
        <span class="shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold capitalize" :class="difficultyClass">
          {{ song.difficulty }}
        </span>
      </div>

      <div class="flex items-center gap-2 mt-2">
        <div class="flex items-center gap-1.5 text-xs text-stone-400 font-mono bg-stone-50 rounded-lg px-2 py-1">
          <span>Key {{ song.key }}</span>
          <span v-if="song.capo" class="text-stone-300">· Capo {{ song.capo }}</span>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <div v-if="song.youtubeUrl" class="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center" title="Has tutorial">
            <svg class="w-2.5 h-2.5 fill-red-500" viewBox="0 0 24 24"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.8 15.5V8.5l6.2 3.5-6.2 3.5z"/></svg>
          </div>
          <div class="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center opacity-40 group-hover:opacity-70 transition-opacity">
            <svg class="w-3 h-3 fill-stone-400" viewBox="0 0 24 24"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>
          </div>
        </div>
      </div>
    </router-link>

    <!-- Action buttons — shown on hover -->
    <div class="absolute top-2.5 right-2.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
      <button
        @click.stop="$emit('edit')"
        class="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-400 hover:text-amber-600 hover:border-amber-300 transition-all shadow-sm cursor-pointer"
        title="Edit song"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2.414a2 2 0 01.586-1.414z"/>
        </svg>
      </button>
      <button
        @click.stop="$emit('delete-request')"
        class="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-300 transition-all shadow-sm cursor-pointer"
        title="Delete song"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Song, SongStatus } from '../data/songs'

const props = defineProps<{ song: Song; status: SongStatus }>()
const emit = defineEmits<{
  dragstart: [e: DragEvent]
  dragend: [e: DragEvent]
  edit: []
  'delete-request': []
}>()

const router = useRouter()
let isDragging = false

function onDragStart(e: DragEvent) {
  isDragging = true
  emit('dragstart', e)
}

function onDragEnd(e: DragEvent) {
  emit('dragend', e)
  setTimeout(() => { isDragging = false }, 0)
}

function navigate() {
  if (!isDragging) router.push(`/song/${props.song.id}`)
}

const difficultyClass = computed(() => ({
  'bg-emerald-100 text-emerald-700': props.song.difficulty === 'easy',
  'bg-amber-100 text-amber-700':     props.song.difficulty === 'medium',
  'bg-red-100 text-red-600':         props.song.difficulty === 'hard',
}))
</script>

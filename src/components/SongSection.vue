<template>
  <section>
    <div class="flex items-center gap-3 mb-4">
      <!-- Icon -->
      <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" :class="iconBgClass">
        <svg v-if="icon === 'know'" class="w-5 h-5" :class="iconColorClass" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <svg v-else-if="icon === 'learning'" class="w-5 h-5" :class="iconColorClass" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
        </svg>
        <svg v-else class="w-5 h-5" :class="iconColorClass" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
        </svg>
      </div>
      <div>
        <h2 class="text-base font-bold text-stone-800" style="font-family:'Fredoka',sans-serif">{{ title }}</h2>
        <p class="text-xs text-stone-400">{{ subtitle }}</p>
      </div>
      <span class="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full" :class="badgeClass">
        {{ songs.length }} song{{ songs.length !== 1 ? 's' : '' }}
      </span>
    </div>

    <div
      class="rounded-2xl border p-4 min-h-24 transition-all duration-150 relative"
      :class="[accentClass, isDragOver ? 'ring-2 ring-amber-400/60 scale-[1.005]' : '']"
      @dragover.prevent="isDragOver = true"
      @dragleave="isDragOver = false"
      @drop.prevent="onDrop"
    >
      <div v-if="isDragOver && songs.length === 0" class="flex items-center justify-center h-20 text-amber-500 text-sm pointer-events-none font-medium">
        Drop here
      </div>
      <div v-else-if="songs.length === 0" class="flex items-center justify-center h-20 text-stone-400 text-sm">
        No songs here yet — drag one in or add a new song
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div v-if="isDragOver" class="absolute inset-0 rounded-2xl bg-amber-400/10 pointer-events-none z-10 flex items-center justify-center border-2 border-dashed border-amber-400/40">
          <span class="text-amber-600 text-sm font-semibold bg-white/90 px-4 py-1.5 rounded-full shadow-sm">Move here</span>
        </div>
        <SongCard
          v-for="song in songs"
          :key="song.id"
          :song="song"
          :status="status"
          @dragstart="onDragStart(song.id, $event)"
          @dragend="isDragOver = false"
          @edit="editingSong = song"
          @delete-request="deletingSong = song"
        />
      </div>
    </div>

    <AddSongModal
      v-if="editingSong"
      :song="editingSong"
      @close="editingSong = null"
      @saved="editingSong = null"
    />

    <ConfirmDeleteModal
      v-if="deletingSong"
      :title="deletingSong.title"
      :artist="deletingSong.artist"
      @confirm="confirmDelete"
      @cancel="deletingSong = null"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Song, SongStatus } from '../data/songs'
import { useSongs } from '../composables/useSongs'
import SongCard from './SongCard.vue'
import AddSongModal from './AddSongModal.vue'
import ConfirmDeleteModal from './ConfirmDeleteModal.vue'

const props = defineProps<{
  title: string
  subtitle: string
  icon: string
  status: SongStatus
  songs: Song[]
  accentClass: string
  badgeClass: string
}>()

const { moveSong, removeSong } = useSongs()
const isDragOver = ref(false)
const editingSong = ref<Song | null>(null)
const deletingSong = ref<Song | null>(null)

const iconBgClass = computed(() => ({
  'bg-emerald-100': props.icon === 'know',
  'bg-amber-100':   props.icon === 'learning',
  'bg-sky-100':     props.icon === 'future',
}))

const iconColorClass = computed(() => ({
  'text-emerald-600': props.icon === 'know',
  'text-amber-600':   props.icon === 'learning',
  'text-sky-600':     props.icon === 'future',
}))

function confirmDelete() {
  if (deletingSong.value) removeSong(deletingSong.value.id)
  deletingSong.value = null
}

function onDragStart(id: string, e: DragEvent) {
  e.dataTransfer!.setData('songId', id)
  e.dataTransfer!.effectAllowed = 'move'
}

function onDrop(e: DragEvent) {
  isDragOver.value = false
  const id = e.dataTransfer?.getData('songId')
  if (id) moveSong(id, props.status)
}
</script>

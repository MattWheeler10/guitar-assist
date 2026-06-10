<template>
  <main class="max-w-6xl mx-auto px-6 py-10">
    <!-- Hero -->
    <div class="mb-10">
      <div class="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p class="text-xs font-semibold tracking-widest uppercase text-amber-500 mb-2">Your Songbook</p>
          <h1 class="text-4xl font-bold text-stone-900 leading-tight" style="font-family:'Fredoka',sans-serif">
            Track your guitar journey
          </h1>
          <p class="text-stone-500 text-sm mt-2">Know it, learning it, or dreaming about it — all in one place.</p>
        </div>
        <div class="flex items-center gap-3 flex-wrap justify-end">
          <button
            @click="showRandom = true"
            :disabled="!allSongs.length"
            class="flex items-center gap-2 border border-stone-300 text-stone-600 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
            title="Pick a random song to play"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke-linejoin="round"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/>
              <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/>
              <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
              <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" stroke="none"/>
              <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" stroke="none"/>
            </svg>
            Surprise Me
          </button>
          <router-link
            to="/chord-challenge"
            class="flex items-center gap-2 border border-stone-300 text-stone-600 hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50 font-semibold text-sm px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
            title="Practice your major chords"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <line x1="4" y1="5" x2="20" y2="5" stroke-width="3" stroke-linecap="round"/>
              <line x1="7" y1="5" x2="7" y2="21" stroke-linecap="round"/>
              <line x1="11" y1="5" x2="11" y2="21" stroke-linecap="round"/>
              <line x1="15" y1="5" x2="15" y2="21" stroke-linecap="round"/>
              <line x1="19" y1="5" x2="19" y2="21" stroke-linecap="round"/>
              <line x1="4" y1="9" x2="20" y2="9"/>
              <line x1="4" y1="13" x2="20" y2="13"/>
              <line x1="4" y1="17" x2="20" y2="17"/>
              <circle cx="11" cy="7" r="2" fill="currentColor" stroke="none"/>
              <circle cx="15" cy="11" r="2" fill="currentColor" stroke="none"/>
              <circle cx="7" cy="15" r="2" fill="currentColor" stroke="none"/>
            </svg>
            Chord Practice
          </router-link>
          <button
            @click="showModal = true"
            class="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-colors shadow-md shadow-amber-200 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Add Song
          </button>
        </div>
      </div>

      <!-- Drag hint -->
      <p class="text-xs text-stone-400 mt-4">
        Tip: drag any song card between sections to update its status
      </p>
    </div>

    <!-- Three Sections -->
    <div class="grid grid-cols-1 gap-8">
      <SongSection
        title="Songs I Know"
        subtitle="Ready to play anytime"
        icon="know"
        status="know"
        :songs="knownSongs"
        accent-class="border-emerald-200 bg-emerald-50/60"
        badge-class="bg-emerald-100 text-emerald-700"
      />
      <SongSection
        title="Currently Learning"
        subtitle="Work in progress — keep at it"
        icon="learning"
        status="learning"
        :songs="learningSongs"
        accent-class="border-amber-200 bg-amber-50/60"
        badge-class="bg-amber-100 text-amber-700"
      />
      <SongSection
        title="Future Goals"
        subtitle="Songs to tackle next"
        icon="future"
        status="future"
        :songs="futureSongs"
        accent-class="border-sky-200 bg-sky-50/60"
        badge-class="bg-sky-100 text-sky-700"
      />
    </div>

    <!-- Songbook backup -->
    <div class="mt-10 pt-8 border-t border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <p class="text-sm font-semibold text-stone-700">Backup your songbook</p>
        <p class="text-xs text-stone-400 mt-0.5">Export to save your songs, import to restore them on another device.</p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button
          @click="exportSongs"
          :disabled="!allSongs.length"
          class="flex items-center gap-2 border border-stone-300 text-stone-600 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-sm px-4 py-2 rounded-xl transition-all cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"/>
          </svg>
          Export
        </button>
        <button
          @click="triggerImport"
          class="flex items-center gap-2 border border-stone-300 text-stone-600 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 font-semibold text-sm px-4 py-2 rounded-xl transition-all cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 14l5-5m0 0l5 5m-5-5v12"/>
          </svg>
          Import
        </button>
        <input ref="importInput" type="file" accept=".json" class="hidden" @change="importSongs" />
      </div>
    </div>
    <p v-if="importError" class="mt-2 text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      {{ importError }}
    </p>

    <!-- Add Song Modal -->
    <AddSongModal v-if="showModal" @close="showModal = false" />

    <!-- Random Song Picker -->
    <RandomSongModal
      v-if="showRandom"
      :all-songs="allSongs"
      :known-songs="knownSongs"
      @close="showRandom = false"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSongs } from '../composables/useSongs'
import type { Song } from '../data/songs'
import SongSection from '../components/SongSection.vue'
import AddSongModal from '../components/AddSongModal.vue'
import RandomSongModal from '../components/RandomSongModal.vue'

const { songs, getSongsByStatus } = useSongs()
const showModal = ref(false)
const showRandom = ref(false)
const importInput = ref<HTMLInputElement | null>(null)
const importError = ref<string | null>(null)

const knownSongs = computed(() => getSongsByStatus('know'))
const learningSongs = computed(() => getSongsByStatus('learning'))
const futureSongs = computed(() => getSongsByStatus('future'))
const allSongs = computed(() => songs.value)

function exportSongs() {
  const json = JSON.stringify(songs.value, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `guitar-assist-songs-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function triggerImport() {
  importError.value = null
  importInput.value?.click()
}

function importSongs(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result as string) as unknown
      if (!Array.isArray(parsed)) throw new Error('File does not contain a song list.')
      // Basic shape check on first item
      const first = parsed[0] as Record<string, unknown>
      if (parsed.length > 0 && (!first.id || !first.title || !first.artist)) {
        throw new Error('File does not look like a GuitarAssist export.')
      }
      songs.value = parsed as Song[]
    } catch (err) {
      importError.value = err instanceof Error ? err.message : 'Could not read file.'
    } finally {
      // Reset so the same file can be re-selected if needed
      if (importInput.value) importInput.value.value = ''
    }
  }
  reader.readAsText(file)
}
</script>

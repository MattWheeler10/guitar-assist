<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" @click="phase !== 'picking' && $emit('close')" />

      <div class="relative w-full max-w-sm rounded-2xl border border-stone-200 bg-white shadow-2xl p-8 text-center">
        <!-- Choose pool -->
        <template v-if="phase === 'choose'">
          <div class="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-5">
            <svg class="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.83m2.55-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
            </svg>
          </div>
          <h2 class="font-bold text-stone-900 text-xl mb-1" style="font-family:'Fredoka',sans-serif">Surprise Me</h2>
          <p class="text-sm text-stone-500 mb-6">What should I pick from?</p>

          <div class="space-y-3">
            <button
              @click="start('all')"
              :disabled="!allSongs.length"
              class="w-full flex items-center justify-between gap-2 rounded-xl border border-stone-200 text-stone-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-3 text-sm font-medium transition-all cursor-pointer"
            >
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"/>
                </svg>
                All songs
              </div>
              <span class="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">{{ allSongs.length }}</span>
            </button>
            <button
              @click="start('know')"
              :disabled="!knownSongs.length"
              class="w-full flex items-center justify-between gap-2 rounded-xl border border-stone-200 text-stone-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-3 text-sm font-medium transition-all cursor-pointer"
            >
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Songs I know
              </div>
              <span class="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">{{ knownSongs.length }}</span>
            </button>
          </div>

          <button
            @click="$emit('close')"
            class="mt-6 px-4 py-2 text-sm text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </template>

        <!-- Spinning / reveal -->
        <template v-else>
          <div class="text-7xl mb-6 inline-block" :class="{ 'animate-dice-spin': phase === 'picking' }">
            {{ diceFace }}
          </div>

          <div class="h-12 flex items-center justify-center">
            <p
              v-if="displaySong"
              class="font-bold text-lg transition-colors"
              :class="phase === 'picking' ? 'text-stone-300' : 'text-stone-800'"
              style="font-family:'Fredoka',sans-serif"
            >
              {{ displaySong.title }}
            </p>
          </div>
          <p class="text-xs text-stone-400 mt-1 h-4">
            <span v-if="displaySong && phase === 'done'">{{ displaySong.artist }}</span>
          </p>

          <p class="text-sm text-stone-500 mt-6">
            {{ phase === 'picking' ? 'Picking your next song…' : 'Get your guitar ready!' }}
          </p>

          <button
            v-if="phase === 'done'"
            @click="$emit('close')"
            class="mt-6 px-4 py-2 text-sm text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import type { Song } from '../data/songs'

const props = defineProps<{ allSongs: Song[]; knownSongs: Song[] }>()
const emit = defineEmits<{ close: [] }>()

const router = useRouter()
const DICE = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

const phase = ref<'choose' | 'picking' | 'done'>('choose')
const diceFace = ref('⚀')
const displaySong = ref<Song | null>(null)

let pool: Song[] = []
let cycleTimer: ReturnType<typeof setInterval> | null = null
let stopTimer: ReturnType<typeof setTimeout> | null = null

function randomSong(): Song {
  return pool[Math.floor(Math.random() * pool.length)]!
}

function randomDice(): string {
  return DICE[Math.floor(Math.random() * DICE.length)]!
}

function start(which: 'all' | 'know') {
  pool = which === 'know' ? props.knownSongs : props.allSongs
  if (!pool.length) return
  phase.value = 'picking'

  cycleTimer = setInterval(() => {
    diceFace.value = randomDice()
    displaySong.value = randomSong()
  }, 90)

  stopTimer = setTimeout(() => {
    if (cycleTimer) clearInterval(cycleTimer)
    const chosen = randomSong()
    displaySong.value = chosen
    diceFace.value = randomDice()
    phase.value = 'done'

    stopTimer = setTimeout(() => {
      router.push(`/song/${chosen.id}`)
      emit('close')
    }, 2000)
  }, 2200)
}

onUnmounted(() => {
  if (cycleTimer) clearInterval(cycleTimer)
  if (stopTimer) clearTimeout(stopTimer)
})
</script>

<style scoped>
@keyframes dice-spin {
  0%   { transform: rotate(0deg)   scale(1);   }
  50%  { transform: rotate(180deg) scale(1.2); }
  100% { transform: rotate(360deg) scale(1);   }
}
.animate-dice-spin {
  animation: dice-spin 0.45s linear infinite;
}
</style>

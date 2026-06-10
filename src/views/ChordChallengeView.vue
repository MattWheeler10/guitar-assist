<template>
  <main class="min-h-screen bg-stone-50">
    <div class="max-w-sm mx-auto px-6 py-5 flex flex-col min-h-screen">
      <!-- Nav -->
      <router-link to="/" class="text-sm text-stone-400 hover:text-stone-600 transition-colors mb-5 self-start">
        ← Home
      </router-link>

      <!-- IDLE -->
      <div v-if="phase === 'idle'" class="flex flex-col gap-5">
        <!-- Header -->
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
            <svg class="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
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
          </div>
          <div>
            <h1 class="text-2xl font-bold text-stone-900" style="font-family:'Fredoka',sans-serif">Chord Practice</h1>
            <p class="text-stone-500 text-sm leading-snug">Play each chord before time runs out — mic detects automatically.</p>
          </div>
        </div>

        <!-- Settings card -->
        <div class="rounded-2xl border border-stone-200 bg-white shadow-sm p-5 space-y-5">
          <!-- Rounds -->
          <div>
            <p class="text-xs font-semibold tracking-wide uppercase text-stone-400 mb-2">Rounds</p>
            <div class="flex gap-2">
              <button
                v-for="n in ROUND_OPTIONS" :key="n"
                @click="settingRounds = n"
                class="flex-1 py-2 rounded-lg border text-sm font-semibold transition-all cursor-pointer"
                :class="settingRounds === n
                  ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                  : 'border-stone-200 text-stone-600 hover:border-amber-300 hover:text-amber-600'"
              >{{ n }}</button>
            </div>
          </div>

          <!-- Timer -->
          <div>
            <p class="text-xs font-semibold tracking-wide uppercase text-stone-400 mb-2">Countdown</p>
            <div class="flex gap-2">
              <button
                v-for="s in TIMER_OPTIONS" :key="s"
                @click="settingTimer = s"
                class="flex-1 py-2 rounded-lg border text-sm font-semibold transition-all cursor-pointer"
                :class="settingTimer === s
                  ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                  : 'border-stone-200 text-stone-600 hover:border-amber-300 hover:text-amber-600'"
              >{{ s }}s</button>
            </div>
          </div>

          <!-- Chord type -->
          <div>
            <p class="text-xs font-semibold tracking-wide uppercase text-stone-400 mb-2">Chord Type</p>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="opt in CHORD_OPTIONS" :key="opt.key"
                @click="settingChords = opt.key"
                class="py-2.5 px-3 rounded-lg border text-left transition-all cursor-pointer"
                :class="settingChords === opt.key
                  ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                  : 'border-stone-200 text-stone-600 hover:border-amber-300 hover:bg-amber-50'"
              >
                <p class="text-sm font-semibold leading-none">{{ opt.label }}</p>
                <p class="text-xs mt-0.5 leading-none"
                   :class="settingChords === opt.key ? 'text-amber-100' : 'text-stone-400'">
                  {{ opt.note }}
                </p>
              </button>
            </div>
          </div>
        </div>

        <p v-if="error" class="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">{{ error }}</p>

        <button
          @click="startGame"
          class="w-full bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 rounded-xl shadow-md shadow-amber-200 transition-colors cursor-pointer"
        >
          Start Game
        </button>
      </div>

      <!-- PLAYING / RESULT -->
      <div v-else-if="phase === 'playing' || phase === 'result'" class="flex flex-col items-center gap-4 pt-1">
        <!-- Score bar -->
        <div class="w-full flex items-center justify-between text-sm text-stone-500">
          <span>Round {{ roundIndex + 1 }} / {{ totalRounds }}</span>
          <span class="font-semibold text-stone-700">{{ score }} correct</span>
        </div>

        <!-- Prompt -->
        <div class="text-center">
          <p class="text-xs font-semibold tracking-widest uppercase text-amber-500 mb-1">Play this chord</p>
          <h2 class="text-7xl font-bold text-stone-900" style="font-family:'Fredoka',sans-serif">
            {{ currentChord.name }}
          </h2>
        </div>

        <!-- Chord diagram -->
        <div
          class="rounded-2xl border bg-white shadow-md p-5 flex items-center justify-center transition-all duration-200"
          :class="{
            'border-stone-200': phase !== 'result',
            'border-emerald-300 ring-2 ring-emerald-300': phase === 'result' && lastResult === 'hit',
            'border-red-300 ring-2 ring-red-300': phase === 'result' && lastResult === 'miss',
          }"
        >
          <svg :width="SVG_W" :height="SVG_H" :viewBox="`0 0 ${SVG_W} ${SVG_H}`" v-if="currentPosition">
            <rect v-if="currentPosition.baseFret === 1"
              :x="GX - 1" :y="GY - 6" :width="GW + 2" height="6" rx="1" fill="#F59E0B" />
            <text v-else :x="GX - 8" :y="GY + FH * 0.6"
              text-anchor="end" font-size="11" fill="#D97706" font-family="monospace">
              {{ currentPosition.baseFret }}fr
            </text>
            <line v-for="f in NUM_FRETS + 1" :key="`fl${f}`"
              :x1="GX" :y1="GY + (f - 1) * FH" :x2="GX + GW" :y2="GY + (f - 1) * FH"
              stroke="#E7E5E4" stroke-width="1.5" />
            <line v-for="s in 6" :key="`sl${s}`"
              :x1="GX + (s - 1) * SW" :y1="GY" :x2="GX + (s - 1) * SW" :y2="GY + NUM_FRETS * FH"
              stroke="#D6D3D1" stroke-width="2" />
            <rect v-for="barre in currentPosition.barres" :key="`barre${barre}`"
              :x="GX + barreStart(barre) * SW - DR"
              :y="GY + (barre - 1) * FH + FH / 2 - DR"
              :width="barreWidth(barre) + DR * 2" :height="DR * 2"
              rx="8" fill="#F59E0B" opacity="0.9" />
            <template v-for="(fret, si) in currentPosition.frets" :key="`mk${si}`">
              <circle v-if="fret === 0"
                :cx="GX + si * SW" :cy="GY - MO"
                :r="DR - 1" fill="none" stroke="#F59E0B" stroke-width="2" />
              <template v-else-if="fret === -1">
                <line :x1="GX + si * SW - 6" :y1="GY - MO - 6" :x2="GX + si * SW + 6" :y2="GY - MO + 6" stroke="#EF4444" stroke-width="2" />
                <line :x1="GX + si * SW + 6" :y1="GY - MO - 6" :x2="GX + si * SW - 6" :y2="GY - MO + 6" stroke="#EF4444" stroke-width="2" />
              </template>
            </template>
            <template v-for="(fret, si) in currentPosition.frets" :key="`dot${si}`">
              <circle v-if="fret > 0 && !isBarreStr(si, fret)"
                :cx="GX + si * SW" :cy="GY + (fret - 1) * FH + FH / 2"
                :r="DR" fill="#F59E0B" />
            </template>
            <template v-for="(finger, si) in currentPosition.fingers" :key="`fn${si}`">
              <text v-if="finger > 0 && (currentPosition.frets[si] ?? 0) > 0 && !isBarreStr(si, currentPosition.frets[si] ?? 0)"
                :x="GX + si * SW"
                :y="GY + ((currentPosition.frets[si] ?? 1) - 1) * FH + FH / 2 + 4"
                text-anchor="middle" font-size="10" fill="white" font-weight="bold">
                {{ finger }}
              </text>
            </template>
          </svg>
          <p v-else class="text-stone-400 text-sm p-4">No diagram found</p>
        </div>

        <!-- Result feedback -->
        <div v-if="phase === 'result'" class="text-base font-semibold"
             :class="lastResult === 'hit' ? 'text-emerald-600' : 'text-red-500'">
          {{ lastResult === 'hit' ? 'Got it!' : "Time's up" }}
        </div>

        <!-- Countdown ring -->
        <div v-if="phase === 'playing'" class="relative w-20 h-20">
          <svg class="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#E7E5E4" stroke-width="6"/>
            <circle cx="40" cy="40" r="34" fill="none"
              :stroke="timeLeft <= 2 ? '#EF4444' : '#F59E0B'"
              stroke-width="6" stroke-linecap="round"
              :stroke-dasharray="`${2 * Math.PI * 34}`"
              :stroke-dashoffset="`${2 * Math.PI * 34 * (1 - timeLeft / timerSecs)}`"
              style="transition: stroke-dashoffset 0.1s linear, stroke 0.3s"
            />
          </svg>
          <span class="absolute inset-0 flex items-center justify-center text-xl font-bold text-stone-700">
            {{ timeLeft }}
          </span>
        </div>

        <!-- Mic level + detected chord -->
        <div v-if="phase === 'playing'" class="w-full space-y-2">
          <div class="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div class="h-full bg-amber-400 rounded-full" style="transition: width 75ms linear"
                 :style="{ width: `${level * 100}%` }" />
          </div>
          <p class="text-xs text-stone-400 text-center">
            Hearing: <span class="font-semibold text-stone-600">{{ detectedName ?? '—' }}</span>
          </p>
        </div>
      </div>

      <!-- DONE -->
      <div v-else class="flex flex-col items-center justify-center text-center gap-6 pt-16">
        <div class="w-20 h-20 rounded-3xl flex items-center justify-center"
             :class="score >= totalRounds * 0.7 ? 'bg-emerald-100' : 'bg-amber-100'">
          <svg class="w-10 h-10" :class="score >= totalRounds * 0.7 ? 'text-emerald-500' : 'text-amber-500'"
               fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path v-if="score >= totalRounds * 0.7" stroke-linecap="round" stroke-linejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            <path v-else stroke-linecap="round" stroke-linejoin="round"
              d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"/>
          </svg>
        </div>
        <div>
          <h2 class="text-4xl font-bold text-stone-900" style="font-family:'Fredoka',sans-serif">
            {{ score }} / {{ totalRounds }}
          </h2>
          <p class="text-stone-500 text-sm mt-2">{{ scoreMessage }}</p>
        </div>
        <div class="flex flex-col gap-3 w-full">
          <button @click="playAgain"
            class="w-full bg-amber-500 hover:bg-amber-400 text-white font-semibold py-3 rounded-xl shadow-md shadow-amber-200 transition-colors cursor-pointer">
            Play Again
          </button>
          <router-link to="/"
            class="w-full border border-stone-300 text-stone-600 hover:border-stone-400 hover:bg-stone-50 font-semibold py-3 rounded-xl transition-all text-sm text-center cursor-pointer">
            Back to Home
          </router-link>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { lookupChord, type ChordPosition } from '../utils/chordLookup'
import { useChordDetection } from '../composables/useChordDetection'

// Chord diagram constants (scaled ~1.5x from ChordDiagram.vue)
const SVG_W = 164
const SVG_H = 160
const GX = 26
const GY = 38
const SW = 22
const FH = 24
const DR = 8
const MO = 14
const GW = SW * 5
const NUM_FRETS = 4

// Settings options
const ROUND_OPTIONS = [5, 10, 15, 20] as const
const TIMER_OPTIONS = [3, 5, 7, 10] as const

type ChordPoolKey = 'majors' | 'minors' | 'mixed' | 'all-majors'

interface Chord { name: string; id: string }

const CHORD_OPTIONS: { key: ChordPoolKey; label: string; note: string }[] = [
  { key: 'majors',     label: 'Majors',     note: 'C D E F G A' },
  { key: 'minors',     label: 'Minors',     note: 'Am Em Dm Bm Fm Gm' },
  { key: 'mixed',      label: 'Mixed',      note: 'Common maj + min' },
  { key: 'all-majors', label: 'All Majors', note: 'All 12 incl. sharps' },
]

const CHORD_POOLS: Record<ChordPoolKey, Chord[]> = {
  'majors': [
    { name: 'A', id: '9:0' }, { name: 'C', id: '0:0' }, { name: 'D', id: '2:0' },
    { name: 'E', id: '4:0' }, { name: 'F', id: '5:0' }, { name: 'G', id: '7:0' },
  ],
  'minors': [
    { name: 'Am', id: '9:1' }, { name: 'Em', id: '4:1' }, { name: 'Dm', id: '2:1' },
    { name: 'Bm', id: '11:1' }, { name: 'Fm', id: '5:1' }, { name: 'Gm', id: '7:1' },
  ],
  'mixed': [
    { name: 'A', id: '9:0' }, { name: 'C', id: '0:0' }, { name: 'D', id: '2:0' },
    { name: 'E', id: '4:0' }, { name: 'F', id: '5:0' }, { name: 'G', id: '7:0' },
    { name: 'Am', id: '9:1' }, { name: 'Em', id: '4:1' }, { name: 'Dm', id: '2:1' },
    { name: 'Bm', id: '11:1' },
  ],
  'all-majors': [
    { name: 'C', id: '0:0' }, { name: 'C#', id: '1:0' }, { name: 'D', id: '2:0' },
    { name: 'Eb', id: '3:0' }, { name: 'E', id: '4:0' }, { name: 'F', id: '5:0' },
    { name: 'F#', id: '6:0' }, { name: 'G', id: '7:0' }, { name: 'Ab', id: '8:0' },
    { name: 'A', id: '9:0' }, { name: 'Bb', id: '10:0' }, { name: 'B', id: '11:0' },
  ],
}

// Settings (persist across games)
const settingRounds = ref<number>(10)
const settingTimer = ref<number>(5)
const settingChords = ref<ChordPoolKey>('majors')

// Active game config (snapshotted at start so mid-game changes don't break things)
const totalRounds = ref(10)
const timerSecs = ref(5)

const { detectedId, detectedName, level, error, start, stop, dispose } = useChordDetection()

type Phase = 'idle' | 'playing' | 'result' | 'done'
const phase = ref<Phase>('idle')
const roundIndex = ref(0)
const score = ref(0)
const lastResult = ref<'hit' | 'miss'>('hit')
const timeLeft = ref(5)
const queue = ref<Chord[]>([])

let timerInterval: ReturnType<typeof setInterval> | null = null
let resultTimeout: ReturnType<typeof setTimeout> | null = null

const currentChord = computed(() => queue.value[roundIndex.value] ?? CHORD_POOLS['majors'][0]!)
const currentPosition = computed<ChordPosition | null>(() => lookupChord(currentChord.value.name))

function buildQueue(pool: Chord[], rounds: number): Chord[] {
  const result: Chord[] = []
  let lastId = ''
  for (let i = 0; i < rounds; i++) {
    const candidates = pool.filter(c => c.id !== lastId)
    const chord = candidates[Math.floor(Math.random() * candidates.length)]!
    result.push(chord)
    lastId = chord.id
  }
  return result
}

async function startGame() {
  await start()
  if (error.value) return
  totalRounds.value = settingRounds.value
  timerSecs.value = settingTimer.value
  queue.value = buildQueue(CHORD_POOLS[settingChords.value], totalRounds.value)
  roundIndex.value = 0
  score.value = 0
  timeLeft.value = timerSecs.value
  phase.value = 'playing'
  startTimer()
}

function startTimer() {
  clearTimer()
  timeLeft.value = timerSecs.value
  timerInterval = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) endRound('miss')
  }, 1000)
}

function clearTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
}

function endRound(result: 'hit' | 'miss') {
  clearTimer()
  lastResult.value = result
  if (result === 'hit') score.value++
  phase.value = 'result'
  resultTimeout = setTimeout(() => {
    const next = roundIndex.value + 1
    if (next >= totalRounds.value) {
      phase.value = 'done'
      stop()
    } else {
      roundIndex.value = next
      phase.value = 'playing'
      startTimer()
    }
  }, 800)
}

watch(detectedId, (id) => {
  if (phase.value !== 'playing') return
  if (id === currentChord.value.id) endRound('hit')
})

function playAgain() {
  clearTimer()
  if (resultTimeout) { clearTimeout(resultTimeout); resultTimeout = null }
  startGame()
}

onUnmounted(() => {
  clearTimer()
  if (resultTimeout) clearTimeout(resultTimeout)
  dispose()
})

// Chord diagram helpers
function isBarreStr(si: number, fret: number): boolean {
  const pos = currentPosition.value
  if (!pos || !pos.barres.length) return false
  return pos.barres.includes(fret) && pos.fingers[si] === 1
}

function barreStart(barre: number): number {
  const pos = currentPosition.value
  if (!pos) return 0
  const hits = pos.fingers.map((f, i) => ({ f, i, fret: pos.frets[i] ?? 0 })).filter(x => x.f === 1 && x.fret === barre)
  return hits[0]?.i ?? 0
}

function barreWidth(barre: number): number {
  const pos = currentPosition.value
  if (!pos) return 0
  const hits = pos.fingers.map((f, i) => ({ f, i, fret: pos.frets[i] ?? 0 })).filter(x => x.f === 1 && x.fret === barre)
  if (hits.length < 2) return 0
  return (hits[hits.length - 1]!.i - hits[0]!.i) * SW
}

const scoreMessage = computed(() => {
  const pct = score.value / totalRounds.value
  if (pct >= 0.9) return 'Incredible — you nailed every chord!'
  if (pct >= 0.7) return 'Great playing! Keep it up.'
  if (pct >= 0.5) return "Not bad — keep practising!"
  return "Keep at it, you'll get there."
})
</script>

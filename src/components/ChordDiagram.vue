<template>
  <!-- Floating popup -->
  <div
    class="absolute z-50 bg-white border border-stone-200 rounded-2xl shadow-xl p-3 pt-2 select-none"
    :style="popupStyle"
  >
    <!-- Chord name -->
    <p class="text-center text-amber-600 font-bold text-sm mb-2 font-mono">{{ name }}</p>

    <div v-if="position">
      <svg :width="SVG_W" :height="SVG_H" :viewBox="`0 0 ${SVG_W} ${SVG_H}`">
        <!-- Nut or fret number -->
        <rect
          v-if="position.baseFret === 1"
          :x="GRID_X - 1"
          :y="GRID_Y - 4"
          :width="GRID_W + 2"
          height="4"
          rx="1"
          fill="#F59E0B"
        />
        <text
          v-else
          :x="GRID_X - 6"
          :y="GRID_Y + FRET_H * 0.6"
          text-anchor="end"
          font-size="8"
          fill="#D97706"
          font-family="monospace"
        >{{ position.baseFret }}fr</text>

        <!-- Fret lines -->
        <line
          v-for="f in NUM_FRETS + 1"
          :key="`fret-${f}`"
          :x1="GRID_X"
          :y1="GRID_Y + (f - 1) * FRET_H"
          :x2="GRID_X + GRID_W"
          :y2="GRID_Y + (f - 1) * FRET_H"
          stroke="#E7E5E4"
          stroke-width="1"
        />

        <!-- String lines -->
        <line
          v-for="s in 6"
          :key="`str-${s}`"
          :x1="GRID_X + (s - 1) * STRING_W"
          :y1="GRID_Y"
          :x2="GRID_X + (s - 1) * STRING_W"
          :y2="GRID_Y + NUM_FRETS * FRET_H"
          stroke="#D6D3D1"
          stroke-width="1.5"
        />

        <!-- Barre bars -->
        <rect
          v-for="barre in position.barres"
          :key="`barre-${barre}`"
          :x="GRID_X + barreStart(barre) * STRING_W - DOT_R"
          :y="GRID_Y + (barre - 1) * FRET_H + FRET_H / 2 - DOT_R"
          :width="barreWidth(barre) + DOT_R * 2"
          :height="DOT_R * 2"
          rx="5"
          fill="#F59E0B"
          opacity="0.9"
        />

        <!-- Open / Muted markers above nut -->
        <template v-for="(fret, si) in position.frets" :key="`marker-${si}`">
          <circle
            v-if="fret === 0"
            :cx="GRID_X + si * STRING_W"
            :cy="GRID_Y - MARKER_OFFSET"
            :r="DOT_R - 1"
            fill="none"
            stroke="#F59E0B"
            stroke-width="1.5"
          />
          <template v-else-if="fret === -1">
            <line
              :x1="GRID_X + si * STRING_W - 4"
              :y1="GRID_Y - MARKER_OFFSET - 4"
              :x2="GRID_X + si * STRING_W + 4"
              :y2="GRID_Y - MARKER_OFFSET + 4"
              stroke="#EF4444" stroke-width="1.5"
            />
            <line
              :x1="GRID_X + si * STRING_W + 4"
              :y1="GRID_Y - MARKER_OFFSET - 4"
              :x2="GRID_X + si * STRING_W - 4"
              :y2="GRID_Y - MARKER_OFFSET + 4"
              stroke="#EF4444" stroke-width="1.5"
            />
          </template>
        </template>

        <!-- Finger dots -->
        <template v-for="(fret, si) in position.frets" :key="`dot-${si}`">
          <circle
            v-if="fret > 0 && !isBarreString(si, fret)"
            :cx="GRID_X + si * STRING_W"
            :cy="GRID_Y + (fret - 1) * FRET_H + FRET_H / 2"
            :r="DOT_R"
            fill="#F59E0B"
          />
        </template>

        <!-- Finger numbers inside dots -->
        <template v-for="(finger, si) in position.fingers" :key="`num-${si}`">
          <text
            v-if="finger > 0 && position.frets[si] > 0 && !isBarreString(si, position.frets[si])"
            :x="GRID_X + si * STRING_W"
            :y="GRID_Y + (position.frets[si] - 1) * FRET_H + FRET_H / 2 + 3"
            text-anchor="middle"
            font-size="7"
            fill="white"
            font-weight="bold"
          >{{ finger }}</text>
        </template>
      </svg>
    </div>

    <!-- Chord not found -->
    <div v-else class="flex flex-col items-center gap-2 py-2 px-2">
      <p class="text-xs text-stone-400 text-center">No diagram found</p>
      <a
        :href="`https://www.google.com/search?q=${encodeURIComponent(name + ' guitar chord')}`"
        target="_blank"
        rel="noopener"
        class="text-xs text-amber-500 hover:text-amber-600 transition-colors"
      >Search Google ↗</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { lookupChord } from '../utils/chordLookup'

const props = defineProps<{
  name: string
  anchorRect?: DOMRect
}>()

const SVG_W = 110
const SVG_H = 108
const GRID_X = 18
const GRID_Y = 26
const STRING_W = 15
const FRET_H = 16
const NUM_FRETS = 4
const DOT_R = 5.5
const MARKER_OFFSET = 10
const GRID_W = STRING_W * 5

const position = computed(() => lookupChord(props.name))

const popupStyle = computed(() => {
  if (!props.anchorRect) return { top: '0', left: '0' }
  const rect = props.anchorRect
  const popupW = SVG_W + 24
  const popupH = SVG_H + 56
  const spaceAbove = rect.top
  const openDown = spaceAbove < popupH + 20
  const top = openDown
    ? rect.bottom + 8
    : rect.top - popupH - 8
  const left = Math.min(
    Math.max(rect.left + rect.width / 2 - popupW / 2, 8),
    window.innerWidth - popupW - 8,
  )
  return { top: `${top}px`, left: `${left}px`, position: 'fixed' as const }
})

function isBarreString(stringIndex: number, fret: number): boolean {
  if (!position.value || !position.value.barres.length) return false
  return position.value.barres.includes(fret) && position.value.fingers[stringIndex] === 1
}

function barreStart(barre: number): number {
  if (!position.value) return 0
  const barreFinger = 1
  const indices = position.value.fingers
    .map((f, i) => ({ f, i, fret: position.value!.frets[i] }))
    .filter(x => x.f === barreFinger && x.fret === barre)
  return indices.length ? indices[0].i : 0
}

function barreWidth(barre: number): number {
  if (!position.value) return 0
  const barreFinger = 1
  const indices = position.value.fingers
    .map((f, i) => ({ f, i, fret: position.value!.frets[i] }))
    .filter(x => x.f === barreFinger && x.fret === barre)
  if (indices.length < 2) return 0
  return (indices[indices.length - 1].i - indices[0].i) * STRING_W
}
</script>

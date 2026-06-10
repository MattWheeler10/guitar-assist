<template>
  <main class="max-w-5xl mx-auto px-6 py-10">
    <!-- Not found -->
    <div v-if="!song" class="text-center py-20 text-stone-400">
      <div class="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"/>
        </svg>
      </div>
      <p class="text-stone-600 font-medium">Song not found.</p>
      <router-link to="/" class="text-amber-500 text-sm hover:underline mt-2 inline-block">← Back to Songbook</router-link>
    </div>

    <template v-else>
      <!-- Back -->
      <router-link to="/" class="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-600 transition-colors mb-8 group cursor-pointer">
        <span class="group-hover:-translate-x-0.5 transition-transform">←</span>
        Back to Songbook
      </router-link>

      <!-- Song Header -->
      <div class="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs px-2.5 py-1 rounded-full font-semibold" :class="statusBadgeClass">
              {{ statusLabel }}
            </span>
            <span class="text-xs px-2.5 py-1 rounded-full font-semibold capitalize" :class="difficultyClass">
              {{ song.difficulty }}
            </span>
          </div>
          <h1 class="text-3xl font-bold text-stone-900 leading-tight" style="font-family:'Fredoka',sans-serif">{{ song.title }}</h1>
          <p class="text-stone-500 mt-1">{{ song.artist }}</p>
        </div>

        <!-- Meta chips + edit -->
        <div class="flex flex-col items-end gap-2">
          <div class="flex gap-2 items-center">
            <span class="text-xs font-mono bg-stone-100 border border-stone-200 rounded-lg px-2.5 py-1 text-stone-600">
              Key: <span class="text-amber-600 font-bold">{{ song.key }}</span>
            </span>
            <span v-if="song.capo" class="text-xs font-mono bg-stone-100 border border-stone-200 rounded-lg px-2.5 py-1 text-stone-600">
              Capo: <span class="text-amber-600 font-bold">{{ song.capo }}</span>
            </span>
            <button
              @click="showEdit = true"
              class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50 transition-all cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2.414a2 2 0 01.586-1.414z"/>
              </svg>
              Edit
            </button>
          </div>
          <a
            :href="song.tabUrl"
            target="_blank"
            rel="noopener"
            class="text-xs text-stone-400 hover:text-amber-500 transition-colors flex items-center gap-1"
          >
            View on Ultimate Guitar ↗
          </a>
        </div>
      </div>

      <AddSongModal
        v-if="showEdit"
        :song="song"
        @close="showEdit = false"
        @saved="onSaved"
      />

      <!-- Two column layout: tab + youtube -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Tab Sheet -->
        <div class="lg:col-span-3">
          <div class="rounded-2xl border border-stone-200 bg-white shadow-sm p-6">
            <div class="flex items-center justify-between mb-5 gap-3 flex-wrap">
              <h2 class="text-xs font-bold uppercase tracking-widest text-stone-400">Chord Sheet</h2>

              <div class="flex items-center gap-2">
                <!-- Scroll Along button / picker -->
                <template v-if="!playing">
                  <template v-if="!scrolling && !scrollFinished">
                    <div v-if="showScrollPicker" class="flex items-center gap-1.5">
                      <span class="text-[10px] text-stone-400">Speed:</span>
                      <button
                        v-for="opt in scrollSpeeds"
                        :key="opt.value"
                        @click="scrollSpeed = opt.value"
                        class="text-[10px] px-2 py-1 rounded-lg border transition-all cursor-pointer"
                        :class="scrollSpeed === opt.value
                          ? 'border-sky-400 bg-sky-50 text-sky-600 font-semibold'
                          : 'border-stone-200 text-stone-500 hover:border-stone-300'"
                      >{{ opt.label }}</button>
                      <button
                        @click="startScrollAlong"
                        class="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-sky-400 text-sky-600 bg-sky-50 hover:bg-sky-100 transition-all cursor-pointer font-semibold"
                      >
                        <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        Start
                      </button>
                      <button @click="showScrollPicker = false" class="text-stone-400 hover:text-stone-600 text-sm leading-none cursor-pointer">×</button>
                    </div>
                    <button
                      v-else
                      @click="showScrollPicker = true"
                      class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-sky-300 text-sky-600 bg-sky-50 hover:bg-sky-100 transition-all cursor-pointer"
                    >
                      <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      Scroll Along
                    </button>
                  </template>
                  <button
                    v-if="scrolling"
                    @click="finishScrollAlong"
                    class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-red-300 text-red-600 bg-red-50 hover:bg-red-100 transition-all cursor-pointer"
                  >
                    <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>
                    Stop
                  </button>
                </template>

                <!-- Play Along toggle -->
                <button
                  v-if="steps.length && !scrolling && !scrollFinished"
                  @click="playing ? stopPlayAlong() : startPlayAlong()"
                  class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-semibold"
                  :class="playing
                    ? 'border-red-300 text-red-600 bg-red-50 hover:bg-red-100'
                    : 'border-emerald-300 text-emerald-600 bg-emerald-50 hover:bg-emerald-100'"
                >
                  <svg v-if="!playing" class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  <svg v-else class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>
                  {{ playing ? 'Stop' : 'Play Along' }}
                  <span v-if="!playing" class="text-[9px] font-bold uppercase tracking-wide bg-amber-400 text-white px-1 py-0.5 rounded">Beta</span>
                </button>

                <!-- Mic selector -->
                <div v-if="!playing && !scrolling" class="relative">
                  <button
                    @click.stop="showMicPicker ? showMicPicker = false : (loadMicDevices(), showMicPicker = true)"
                    class="p-1.5 rounded-lg border transition-all cursor-pointer"
                    :class="selectedMicId
                      ? 'border-amber-300 text-amber-600 bg-amber-50'
                      : 'border-stone-200 text-stone-400 hover:text-stone-600 hover:border-stone-300'"
                    title="Select microphone"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
                    </svg>
                  </button>
                  <div
                    v-if="showMicPicker"
                    @click.stop
                    class="absolute right-0 top-9 z-20 w-56 rounded-xl border border-stone-200 bg-white shadow-lg py-1"
                  >
                    <p class="text-[10px] uppercase tracking-widest text-stone-400 px-3 pt-2 pb-1">Microphone</p>
                    <button
                      @click="selectedMicId = ''; showMicPicker = false"
                      class="w-full text-left text-xs px-3 py-2 transition-colors cursor-pointer"
                      :class="!selectedMicId ? 'text-amber-600 bg-amber-50 font-semibold' : 'text-stone-600 hover:text-stone-800 hover:bg-stone-50'"
                    >System default</button>
                    <button
                      v-for="(dev, i) in micDevices"
                      :key="dev.deviceId"
                      @click="selectedMicId = dev.deviceId; showMicPicker = false"
                      class="w-full text-left text-xs px-3 py-2 transition-colors truncate cursor-pointer"
                      :class="selectedMicId === dev.deviceId ? 'text-amber-600 bg-amber-50 font-semibold' : 'text-stone-600 hover:text-stone-800 hover:bg-stone-50'"
                    >{{ micLabel(dev, i) }}</button>
                    <p v-if="!micDevices.length" class="text-xs text-stone-400 px-3 py-2">No devices found</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Scroll-Along status bar -->
            <div
              v-if="scrolling"
              class="mb-5 rounded-xl border border-sky-200 bg-sky-50 p-4"
            >
              <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  <span class="text-[10px] uppercase tracking-widest text-sky-600 font-bold">Scrolling</span>
                  <div class="flex items-center gap-1">
                    <button
                      v-for="opt in scrollSpeeds"
                      :key="opt.value"
                      @click="changeScrollSpeed(opt.value)"
                      class="text-[10px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer"
                      :class="scrollSpeed === opt.value
                        ? 'border-sky-400 bg-sky-100 text-sky-700 font-semibold'
                        : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'"
                    >{{ opt.label }}</button>
                  </div>
                </div>
                <span class="text-[11px] text-stone-500 font-mono">
                  {{ scrollPos + 1 }} / {{ scrollableIndices.length }}
                </span>
              </div>
              <div class="mt-3 h-2 rounded-full bg-sky-200 overflow-hidden">
                <div
                  class="h-full bg-sky-500 transition-[width] duration-200 rounded-full"
                  :style="{ width: `${Math.round(((scrollPos + 1) / scrollableIndices.length) * 100)}%` }"
                />
              </div>
              <!-- Auto mode: mic level + detected chord -->
              <template v-if="scrollSpeed === 'auto'">
                <div class="mt-3 h-1.5 rounded-full bg-amber-100 overflow-hidden">
                  <div
                    class="h-full bg-amber-400 transition-[width] duration-75 rounded-full"
                    :style="{ width: `${Math.round(detection.level.value * 100)}%` }"
                  />
                </div>
                <p class="mt-2 text-[11px] text-stone-500">
                  Listening for chord changes —
                  <span v-if="detection.detectedName.value" class="text-amber-600 font-semibold">{{ detection.detectedName.value }}</span>
                  <span v-else class="text-stone-400">play a chord to advance</span>.
                  Press <kbd class="px-1.5 rounded-md bg-white border border-stone-200 text-stone-600 font-mono">Space</kbd> or Stop to finish.
                </p>
              </template>
              <p v-else class="mt-2 text-[11px] text-stone-500">
                Auto-scrolling at <span class="text-sky-600 font-semibold">{{ scrollSpeed }}</span> pace.
                Press <kbd class="px-1.5 rounded-md bg-white border border-stone-200 text-stone-600 font-mono">Space</kbd> or the Stop button to finish.
              </p>
            </div>

            <!-- Play-Along status bar -->
            <div
              v-if="playing && !finished"
              class="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
            >
              <div v-if="detection.error.value" class="text-xs text-red-500">
                {{ detection.error.value }}
              </div>
              <template v-else>
                <div class="flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3">
                    <span class="text-[10px] uppercase tracking-widest text-emerald-600 font-bold">Play this</span>
                    <span
                      class="chord text-2xl transition-colors"
                      :class="wrongFlash ? 'text-red-500' : 'text-emerald-600'"
                    >
                      {{ currentChord }}
                    </span>
                    <span v-if="detection.detectedName.value" class="text-xs text-stone-500 font-mono">
                      heard: <span class="text-stone-700 font-semibold">{{ detection.detectedName.value }}</span>
                    </span>
                  </div>
                  <span class="text-[11px] text-stone-500 font-mono">
                    {{ currentStep + 1 }} / {{ steps.length }}
                  </span>
                </div>
                <!-- mic level meter -->
                <div class="mt-3 h-2 rounded-full bg-emerald-200 overflow-hidden">
                  <div
                    class="h-full bg-emerald-500 transition-[width] duration-75 rounded-full"
                    :style="{ width: `${Math.round(detection.level.value * 100)}%` }"
                  />
                </div>
                <p class="mt-2 text-[11px] text-stone-500">
                  Strum the chord — it turns <span class="text-emerald-600 font-semibold">green</span> when heard.
                  Move to the next chord and it auto-advances, or press
                  <kbd class="px-1.5 rounded-md bg-white border border-stone-200 text-stone-600 font-mono">Space</kbd> /
                  <button @click="advance('skipped')" class="underline hover:text-amber-600 cursor-pointer">skip</button>.
                </p>
              </template>
            </div>

            <div class="space-y-0">
                <template v-for="(block, i) in parsed.blocks" :key="i">
                  <div
                    v-if="block.type === 'section'"
                    :ref="(el) => setBlockEl(i, el)"
                    class="section-header mt-5 mb-1 first:mt-0"
                  >{{ block.content }}</div>
                  <div
                    v-else-if="block.type === 'chords'"
                    :ref="(el) => setBlockEl(i, el)"
                    class="chord tab-line text-sm"
                  >
                    <template v-for="(seg, j) in block.segments" :key="j">
                      <span
                        v-if="seg.step !== null"
                        :ref="(el) => setStepEl(seg.step as number, el)"
                        class="rounded px-0.5 transition-colors duration-200"
                        :class="stepClass(seg.step)"
                      >{{ seg.text }}</span><template v-else>{{ seg.text }}</template>
                    </template>
                  </div>
                  <div
                    v-else-if="block.type === 'lyrics'"
                    :ref="(el) => setBlockEl(i, el)"
                    class="tab-line text-stone-700 text-sm mb-1"
                  >{{ block.content }}</div>
                  <div
                    v-else-if="block.type === 'tab'"
                    :ref="(el) => setBlockEl(i, el)"
                    class="rounded-xl bg-stone-50 border border-stone-200 px-3 py-2.5 mb-3 font-mono text-sm leading-relaxed overflow-x-auto"
                  >
                    <div v-for="(tabLine, tl) in block.content.split('\n')" :key="tl" class="whitespace-pre">
                      <span class="font-bold text-amber-600">{{ tabLine.charAt(0) }}</span>{{ tabLine.slice(1) }}
                    </div>
                  </div>
                  <div v-else-if="block.type === 'info'" class="text-xs text-stone-500 font-mono bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 mb-3">
                    {{ block.content }}
                  </div>
                  <div v-else class="h-3" />
                </template>
              </div>

            <!-- End-of-scroll review -->
            <div
              v-if="scrollFinished"
              ref="scrollReviewEl"
              class="mt-6 rounded-xl border border-sky-200 bg-sky-50 p-4"
            >
              <p class="text-sm font-bold text-sky-700 mb-1" style="font-family:'Fredoka',sans-serif">Nice playing!</p>
              <p class="text-xs text-stone-500 mb-3">You made it through the whole song.</p>

              <div v-if="detection.recordingUrl.value" class="mb-4">
                <p class="text-[11px] text-stone-500 mb-1">Listen back to your take</p>
                <audio :src="detection.recordingUrl.value" controls class="w-full h-9 rounded-lg" />
              </div>

              <div class="flex gap-2">
                <button
                  @click="startScrollAlong"
                  class="text-xs px-3 py-1.5 rounded-lg border border-sky-300 text-sky-600 bg-sky-100 hover:bg-sky-200 transition-all cursor-pointer font-semibold"
                >Play again</button>
                <button
                  @click="stopScrollAlong"
                  class="text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-700 hover:border-stone-300 transition-all cursor-pointer"
                >Done</button>
              </div>
            </div>

            <!-- End-of-song review -->
            <div
              v-if="finished"
              ref="reviewEl"
              class="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4"
            >
              <div class="flex items-end gap-4 mb-3">
                <div>
                  <p class="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Accuracy</p>
                  <p class="text-4xl font-bold leading-none" :class="accuracyColor" style="font-family:'Fredoka',sans-serif">{{ accuracy }}%</p>
                </div>
                <div class="text-xs text-stone-500 font-mono pb-1 space-y-0.5">
                  <p>
                    <span class="text-emerald-600 font-semibold">{{ correctCount }}</span> matched ·
                    <span class="text-red-500 font-semibold">{{ missedCount }}</span> missed ·
                    <span class="text-amber-600 font-semibold">{{ skippedCount }}</span> skipped ·
                    {{ steps.length }} total
                  </p>
                  <p class="text-stone-400">{{ ratingMessage }}</p>
                </div>
              </div>

              <div v-if="struggledChords.length" class="mb-3">
                <p class="text-[11px] text-stone-500 mb-1 font-semibold">Chords to practice:</p>
                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="[chord, n] in struggledChords"
                    :key="chord"
                    class="chord text-xs bg-white border border-amber-200 rounded-lg px-2 py-0.5 text-amber-700"
                  >
                    {{ chord }}<span v-if="n > 1" class="text-stone-400"> ×{{ n }}</span>
                  </span>
                </div>
              </div>

              <div v-if="detection.recordingUrl.value" class="mb-3">
                <p class="text-[11px] text-stone-500 mb-1">Listen back to your take</p>
                <audio :src="detection.recordingUrl.value" controls class="w-full h-9 rounded-lg" />
              </div>

              <div class="flex gap-2">
                <button
                  @click="startPlayAlong"
                  class="text-xs px-3 py-1.5 rounded-lg border border-emerald-300 text-emerald-600 bg-emerald-100 hover:bg-emerald-200 transition-all cursor-pointer font-semibold"
                >Play again</button>
                <button
                  @click="stopPlayAlong"
                  class="text-xs px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-700 hover:border-stone-300 transition-all cursor-pointer"
                >Done</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar: YouTube + Links -->
        <div class="space-y-4">
          <!-- YouTube Tutorial -->
          <div v-if="song.youtubeUrl" class="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
            <div class="px-4 py-3 border-b border-stone-100">
              <h2 class="text-xs font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                <svg class="w-3.5 h-3.5 fill-red-500" viewBox="0 0 24 24">
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.8 15.5V8.5l6.2 3.5-6.2 3.5z"/>
                </svg>
                Tutorial
              </h2>
            </div>
            <div class="aspect-video">
              <iframe
                :src="youtubeEmbedUrl"
                class="w-full h-full"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              />
            </div>
            <div class="px-4 py-2">
              <a
                :href="song.youtubeUrl"
                target="_blank"
                rel="noopener"
                class="text-xs text-red-500 hover:text-red-600 transition-colors"
              >
                Open in YouTube ↗
              </a>
            </div>
          </div>

          <!-- Quick Reference: chords used -->
          <div class="rounded-2xl border border-stone-200 bg-white shadow-sm p-4 relative">
            <h2 class="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">Quick Chords</h2>
            <p class="text-xs text-stone-400 mb-3">Click a chord to see the diagram</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="chord in chordsUsed"
                :key="chord"
                @click="toggleChord(chord, $event)"
                class="chord text-sm bg-amber-50 border rounded-lg px-2.5 py-1 transition-all cursor-pointer"
                :class="activeChord === chord
                  ? 'border-amber-400 bg-amber-100 text-amber-700 shadow-sm'
                  : 'border-amber-200 hover:border-amber-400 hover:bg-amber-100'"
              >
                {{ chord }}
              </button>
            </div>

            <ChordDiagram
              v-if="activeChord"
              :name="activeChord"
              :anchor-rect="chordAnchorRect ?? undefined"
            />
          </div>

          <!-- Tab link -->
          <div class="rounded-2xl border border-stone-200 bg-white shadow-sm p-4">
            <h2 class="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Resources</h2>
            <a
              :href="song.tabUrl"
              target="_blank"
              rel="noopener"
              class="flex items-center gap-2 text-sm text-stone-600 hover:text-amber-600 transition-colors"
            >
              <svg class="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"/>
              </svg>
              Full tab on Ultimate Guitar
            </a>
          </div>
        </div>
      </div>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSongs } from '../composables/useSongs'
import AddSongModal from '../components/AddSongModal.vue'
import ChordDiagram from '../components/ChordDiagram.vue'
import { parseTab } from '../utils/chordSequence'
import { useChordDetection } from '../composables/useChordDetection'

const route = useRoute()
const router = useRouter()
const { getSongById } = useSongs()
const song = computed(() => getSongById(route.params.id as string))
const showEdit = ref(false)

function onSaved(newId: string) {
  showEdit.value = false
  if (newId !== route.params.id) {
    router.replace(`/song/${newId}`)
  }
}

// Chord diagram popup
const activeChord = ref<string | null>(null)
const chordAnchorRect = ref<DOMRect | null>(null)

function toggleChord(chord: string, e: MouseEvent) {
  if (activeChord.value === chord) {
    activeChord.value = null
    chordAnchorRect.value = null
  } else {
    activeChord.value = chord
    chordAnchorRect.value = (e.currentTarget as HTMLElement).getBoundingClientRect()
  }
  e.stopPropagation()
}

function closeChord() {
  activeChord.value = null
  chordAnchorRect.value = null
}

function closePopovers() {
  closeChord()
  showMicPicker.value = false
}

onMounted(() => document.addEventListener('click', closePopovers))
onUnmounted(() => document.removeEventListener('click', closePopovers))

const statusLabel = computed(() => {
  const map = { know: 'I Know This', learning: 'Learning', future: 'Future Goal' }
  return song.value ? map[song.value.status] : ''
})

const statusBadgeClass = computed(() => {
  const map = {
    know: 'bg-emerald-100 text-emerald-700',
    learning: 'bg-amber-100 text-amber-700',
    future: 'bg-sky-100 text-sky-700',
  }
  return song.value ? map[song.value.status] : ''
})

const difficultyClass = computed(() => {
  const map = {
    easy: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-red-100 text-red-600',
  }
  return song.value ? map[song.value.difficulty] : ''
})

const youtubeEmbedUrl = computed(() => {
  if (!song.value?.youtubeUrl) return ''
  const url = new URL(song.value.youtubeUrl)
  const videoId = url.searchParams.get('v')
  return `https://www.youtube.com/embed/${videoId}`
})

const chordsUsed = computed(() => {
  if (!song.value) return []
  const infoLine = song.value.tab.find(b => b.type === 'info' && b.content.includes('Chords used:'))
  if (!infoLine) return []
  return infoLine.content.replace('Chords used:', '').trim().split(/\s+/)
})

// ───────────────────────── Mic selector ─────────────────────────
const micDevices = ref<MediaDeviceInfo[]>([])
const selectedMicId = ref<string>('')
const showMicPicker = ref(false)

async function loadMicDevices() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    micDevices.value = devices.filter(d => d.kind === 'audioinput')
    if (micDevices.value.every(d => !d.label)) {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true })
      s.getTracks().forEach(t => t.stop())
      const refreshed = await navigator.mediaDevices.enumerateDevices()
      micDevices.value = refreshed.filter(d => d.kind === 'audioinput')
    }
  } catch {
    // permission denied or no devices — leave list empty
  }
}

function micLabel(d: MediaDeviceInfo, i: number): string {
  return d.label || `Microphone ${i + 1}`
}

// ───────────────────────── Play-Along mode ─────────────────────────
const parsed = computed(() => parseTab(song.value?.tab ?? []))
const steps = computed(() => parsed.value.steps)

const detection = useChordDetection()
const playing = ref(false)
const currentStep = ref(0)
const finished = ref(false)
const wrongFlash = ref(false)
type StepStatus = 'correct' | 'missed' | 'skipped'
const stepStatus = ref<Record<number, StepStatus>>({})
const reviewEl = ref<HTMLElement | null>(null)

const currentChord = computed(() => steps.value[currentStep.value]?.chord ?? '')

const correctCount = computed(
  () => Object.values(stepStatus.value).filter((s) => s === 'correct').length,
)
const missedCount = computed(
  () => Object.values(stepStatus.value).filter((s) => s === 'missed').length,
)
const skippedCount = computed(
  () => Object.values(stepStatus.value).filter((s) => s === 'skipped').length,
)
const accuracy = computed(() =>
  steps.value.length ? Math.round((correctCount.value / steps.value.length) * 100) : 0,
)
const accuracyColor = computed(() =>
  accuracy.value >= 80 ? 'text-emerald-600' : accuracy.value >= 50 ? 'text-amber-600' : 'text-red-500',
)
const ratingMessage = computed(() => {
  const a = accuracy.value
  if (a === 100) return 'Flawless run!'
  if (a >= 80) return 'Great job — nearly there.'
  if (a >= 50) return 'Solid. Keep drilling the tricky ones.'
  return 'Early days — practice makes perfect.'
})
const struggledChords = computed(() => {
  const counts: Record<string, number> = {}
  for (const [stepStr, status] of Object.entries(stepStatus.value)) {
    if (status === 'correct') continue
    const chord = steps.value[Number(stepStr)]?.chord
    if (chord) counts[chord] = (counts[chord] ?? 0) + 1
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
})

let cooldownUntil = 0
const COOLDOWN_MS = 650
// Track the last chord ID that triggered an advance, and whether silence has
// been heard since. This prevents the same chord value from satisfying two
// consecutive steps without a genuine new strum in between.
let lastAdvanceId: string | null = null
let heardSilenceSinceAdvance = true

const stepEls = new Map<number, HTMLElement>()
function setStepEl(step: number, el: unknown) {
  if (el instanceof HTMLElement) stepEls.set(step, el)
  else stepEls.delete(step)
}

function stepClass(step: number): string {
  const status = stepStatus.value[step]
  if (status === 'correct') return 'bg-emerald-100 text-emerald-700'
  if (status === 'missed') return 'bg-red-100 text-red-600'
  if (status === 'skipped') return 'text-stone-400'
  if (playing.value && step === currentStep.value) {
    return wrongFlash.value
      ? 'bg-red-100 text-red-600 ring-1 ring-red-400'
      : 'bg-amber-100 text-amber-700 ring-1 ring-amber-400 animate-pulse'
  }
  return ''
}

async function startPlayAlong() {
  ;(document.activeElement as HTMLElement | null)?.blur()
  currentStep.value = 0
  finished.value = false
  stepStatus.value = {}
  wrongFlash.value = false
  cooldownUntil = performance.now() + COOLDOWN_MS
  lastAdvanceId = null
  heardSilenceSinceAdvance = true
  playing.value = true
  await detection.start(selectedMicId.value || undefined)
  if (detection.error.value) return
  await scrollToCurrent()
}

function stopPlayAlong() {
  playing.value = false
  finished.value = false
  detection.stop()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function advance(reason: StepStatus) {
  if (currentStep.value >= steps.value.length) return
  stepStatus.value = { ...stepStatus.value, [currentStep.value]: reason }
  wrongFlash.value = false
  if (currentStep.value + 1 >= steps.value.length) {
    finished.value = true
    currentStep.value = steps.value.length
    detection.stop()
    scrollToReview()
    return
  }
  currentStep.value++
  cooldownUntil = performance.now() + COOLDOWN_MS
  // After any advance (skip or correct), reset so the next chord is always
  // treated as a fresh strum regardless of what was last heard.
  lastAdvanceId = null
  heardSilenceSinceAdvance = true
  scrollToCurrent()
}

let wrongTimer: ReturnType<typeof setTimeout> | undefined
function flashWrong() {
  wrongFlash.value = true
  clearTimeout(wrongTimer)
  wrongTimer = setTimeout(() => (wrongFlash.value = false), 500)
}

async function scrollToCurrent() {
  await nextTick()
  stepEls.get(currentStep.value)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

async function scrollToReview() {
  await nextTick()
  reviewEl.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

watch(
  () => detection.detectedId.value,
  (id) => {
    if (!playing.value || finished.value) return

    // Track silence so repeated same-chord steps each need a fresh strum
    if (id === null) {
      heardSilenceSinceAdvance = true
      return
    }

    if (performance.now() < cooldownUntil) return

    // If this chord was the one that triggered the last advance and we haven't
    // heard silence since, it's the same continuous strum — ignore it
    if (id === lastAdvanceId && !heardSilenceSinceAdvance) return

    const expected = steps.value[currentStep.value]
    if (!expected) return

    if (id === expected.id) {
      stepStatus.value = { ...stepStatus.value, [currentStep.value]: 'correct' }
      lastAdvanceId = id
      heardSilenceSinceAdvance = false
      cooldownUntil = performance.now() + 10_000
      setTimeout(() => advance('correct'), 420)
      return
    }

    flashWrong()
  },
)

function onKeydown(e: KeyboardEvent) {
  if (e.code === 'Space') {
    if (scrolling.value && !scrollFinished.value) {
      e.preventDefault()
      finishScrollAlong()
      return
    }
    if (playing.value && !finished.value) {
      e.preventDefault()
      advance('skipped')
    }
  }
}

// ───────────────────────── Scroll-Along mode ─────────────────────────

type ManualScrollSpeed = 'slow' | 'medium' | 'fast'
type ScrollSpeed = ManualScrollSpeed | 'auto'
const SCROLL_PPS: Record<ManualScrollSpeed, number> = { slow: 6, medium: 12, fast: 22 }

const scrollSpeeds: { value: ScrollSpeed; label: string }[] = [
  { value: 'auto',   label: 'Auto' },
  { value: 'slow',   label: 'Slow' },
  { value: 'medium', label: 'Medium' },
  { value: 'fast',   label: 'Fast' },
]

const scrolling = ref(false)
const scrollFinished = ref(false)
const scrollSpeed = ref<ScrollSpeed>('auto')
const scrollPos = ref(0)
const showScrollPicker = ref(false)
const scrollReviewEl = ref<HTMLElement | null>(null)

const scrollableIndices = computed(() =>
  parsed.value.blocks
    .map((_, i) => i)
    .filter(i => parsed.value.blocks[i]?.type !== 'blank'),
)

const blockEls = new Map<number, HTMLElement>()
function setBlockEl(i: number, el: unknown) {
  if (el instanceof HTMLElement) blockEls.set(i, el)
  else blockEls.delete(i)
}

let scrollRaf = 0
let lastScrollTs = 0
let scrollAccum = 0

function updateScrollPos() {
  const viewCentre = window.scrollY + window.innerHeight * 0.45
  let closest = scrollPos.value
  let closestDist = Infinity
  scrollableIndices.value.forEach((blockIdx, posIdx) => {
    const el = blockEls.get(blockIdx)
    if (!el) return
    const elMid = el.getBoundingClientRect().top + window.scrollY + el.offsetHeight / 2
    const dist = Math.abs(elMid - viewCentre)
    if (dist < closestDist) { closestDist = dist; closest = posIdx }
  })
  scrollPos.value = closest
}

function scrollLoop(ts: number) {
  if (!scrolling.value || scrollSpeed.value === 'auto') return
  if (lastScrollTs === 0) lastScrollTs = ts
  const delta = Math.min(ts - lastScrollTs, 100)
  lastScrollTs = ts

  scrollAccum += SCROLL_PPS[scrollSpeed.value as ManualScrollSpeed] * (delta / 1000)
  const px = Math.floor(scrollAccum)
  if (px > 0) {
    window.scrollBy(0, px)
    scrollAccum -= px
  }
  updateScrollPos()

  scrollRaf = requestAnimationFrame(scrollLoop)
}

// Auto mode: advance to the next block whenever any chord change is detected
let autoCooldownUntil = 0
const AUTO_COOLDOWN_MS = 900

watch(
  () => detection.detectedId.value,
  (id) => {
    if (!scrolling.value || scrollSpeed.value !== 'auto' || id == null) return
    if (performance.now() < autoCooldownUntil) return
    autoCooldownUntil = performance.now() + AUTO_COOLDOWN_MS

    const nextPos = scrollPos.value + 1
    if (nextPos >= scrollableIndices.value.length) {
      finishScrollAlong()
      return
    }
    scrollPos.value = nextPos
    const blockIdx = scrollableIndices.value[nextPos]
    const el = blockIdx !== undefined ? blockEls.get(blockIdx) : undefined
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  },
)

async function finishScrollAlong() {
  cancelAnimationFrame(scrollRaf)
  scrollRaf = 0
  scrolling.value = false
  scrollFinished.value = true
  detection.stop()
  await nextTick()
  scrollReviewEl.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function changeScrollSpeed(s: ScrollSpeed) {
  const wasAuto = scrollSpeed.value === 'auto'
  scrollSpeed.value = s
  if (!scrolling.value) return
  if (s === 'auto') {
    // switching to auto — stop the pixel RAF
    cancelAnimationFrame(scrollRaf)
    scrollRaf = 0
  } else if (wasAuto) {
    // switching from auto to a fixed speed — start the RAF
    lastScrollTs = 0
    scrollAccum = 0
    scrollRaf = requestAnimationFrame(scrollLoop)
  }
}

async function startScrollAlong() {
  ;(document.activeElement as HTMLElement | null)?.blur()
  showScrollPicker.value = false
  scrollPos.value = 0
  scrollFinished.value = false
  lastScrollTs = 0
  scrollAccum = 0
  autoCooldownUntil = 0
  scrolling.value = true
  await detection.start(selectedMicId.value || undefined)
  await nextTick()
  const first = scrollableIndices.value[0]
  const firstEl = first !== undefined ? blockEls.get(first) : undefined
  if (firstEl) {
    const top = firstEl.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.2
    window.scrollTo({ top: Math.max(0, top) })
  }
  if (scrollSpeed.value !== 'auto') {
    scrollRaf = requestAnimationFrame(scrollLoop)
  }
}

function stopScrollAlong() {
  cancelAnimationFrame(scrollRaf)
  scrollRaf = 0
  scrolling.value = false
  scrollFinished.value = false
  showScrollPicker.value = false
  lastScrollTs = 0
  scrollAccum = 0
  detection.stop()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  clearTimeout(wrongTimer)
  cancelAnimationFrame(scrollRaf)
  detection.dispose()
})
</script>

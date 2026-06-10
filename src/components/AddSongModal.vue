<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="$emit('close')"
    >
      <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" />

      <div class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-stone-200 bg-white shadow-2xl">
        <!-- Header -->
        <div class="sticky top-0 bg-white border-b border-stone-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 class="font-bold text-stone-900 text-lg" style="font-family:'Fredoka',sans-serif">{{ isEdit ? 'Edit Song' : 'Add a Song' }}</h2>
          <button @click="$emit('close')" class="text-stone-400 hover:text-stone-600 transition-colors text-xl leading-none cursor-pointer w-8 h-8 flex items-center justify-center rounded-lg hover:bg-stone-100">×</button>
        </div>

        <form @submit.prevent="submit" class="p-6 space-y-5">
          <!-- Title + Artist -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs text-stone-600 mb-1.5 font-semibold">Song Title *</label>
              <input
                v-model="form.title"
                required
                placeholder="Where Does Your Spirit Go"
                class="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs text-stone-600 mb-1.5 font-semibold">Artist *</label>
              <input
                v-model="form.artist"
                required
                placeholder="The Kid LAROI"
                class="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-xs text-stone-600 mb-1.5 font-semibold">Where are you with this song?</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="opt in statusOptions"
                :key="opt.value"
                type="button"
                @click="form.status = opt.value"
                class="rounded-xl border py-2.5 px-3 text-xs font-semibold transition-all cursor-pointer"
                :class="form.status === opt.value ? opt.activeClass : 'border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50'"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- UG URL -->
          <div>
            <label class="block text-xs text-stone-600 mb-1.5 font-semibold">Ultimate Guitar URL</label>
            <input
              v-model="form.tabUrl"
              type="url"
              placeholder="https://tabs.ultimate-guitar.com/tab/..."
              class="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-colors"
            />
          </div>

          <!-- YouTube URL -->
          <div>
            <label class="block text-xs text-stone-600 mb-1.5 font-semibold">
              YouTube Tutorial URL
              <span class="text-stone-400 font-normal">(optional)</span>
            </label>
            <input
              v-model="form.youtubeUrl"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              class="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-colors"
            />
          </div>

          <!-- Key / Capo / Difficulty -->
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-xs text-stone-600 mb-1.5 font-semibold">Key</label>
              <input
                v-model="form.key"
                placeholder="e.g. G, Am, C#"
                class="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs text-stone-600 mb-1.5 font-semibold">Capo <span class="text-stone-400 font-normal">(fret)</span></label>
              <input
                v-model.number="form.capo"
                type="number"
                min="0"
                max="12"
                placeholder="0 = none"
                class="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label class="block text-xs text-stone-600 mb-1.5 font-semibold">Difficulty</label>
              <select
                v-model="form.difficulty"
                class="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-amber-400 focus:bg-white transition-colors cursor-pointer"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <!-- Tab / Chord Sheet -->
          <div>
            <label class="block text-xs text-stone-600 mb-1.5 font-semibold">
              Tab / Chord Sheet
              <span class="text-stone-400 font-normal ml-1">— paste directly from Ultimate Guitar</span>
            </label>
            <textarea
              v-model="form.tabText"
              rows="10"
              placeholder="[Verse 1]&#10;Em              C&#10;Paste your chords and lyrics here...&#10;G               D&#10;The app will detect chord lines automatically"
              class="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-amber-400 focus:bg-white transition-colors font-mono resize-y"
            />
            <p class="text-xs text-stone-400 mt-1">
              Lines with only chord names (Em, C, G…) are highlighted automatically. Section headers go in [brackets].
            </p>
          </div>

          <!-- Chords Used -->
          <div>
            <label class="block text-xs text-stone-600 mb-1.5 font-semibold">
              Chords Used
              <span class="text-stone-400 font-normal ml-1">— auto-detected from tab, or pick manually</span>
            </label>
            <div class="space-y-2">
              <div v-for="group in chordGroups" :key="group.label" class="flex items-center gap-2">
                <span class="text-xs text-stone-400 w-10 shrink-0 font-mono">{{ group.label }}</span>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="chord in group.chords"
                    :key="chord"
                    type="button"
                    @click="toggleChord(chord)"
                    class="chord text-xs px-2 py-0.5 rounded-lg border transition-all cursor-pointer"
                    :class="form.selectedChords.includes(chord)
                      ? 'border-amber-400 bg-amber-100 text-amber-700'
                      : 'border-stone-200 text-stone-500 hover:border-amber-300 hover:text-amber-600 hover:bg-amber-50'"
                  >{{ chord }}</button>
                </div>
              </div>
            </div>
            <p v-if="form.selectedChords.length" class="text-xs text-stone-500 mt-2">
              Selected: <span class="font-mono text-amber-600 font-semibold">{{ form.selectedChords.join('  ') }}</span>
            </p>
          </div>

          <p v-if="error" class="text-red-500 text-xs">{{ error }}</p>

          <!-- Actions -->
          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-sm text-stone-500 hover:text-stone-700 transition-colors cursor-pointer"
            >Cancel</button>
            <button
              type="submit"
              class="px-5 py-2 text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-white rounded-xl transition-colors shadow-md shadow-amber-100 cursor-pointer"
            >
              {{ isEdit ? 'Save Changes' : 'Add to Songbook' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Song, SongStatus } from '../data/songs'
import { useSongs, parseTabText, slugify } from '../composables/useSongs'
import { isChordLine, isChordToken } from '../utils/chordSequence'

const props = defineProps<{ song?: Song }>()
const emit = defineEmits<{ close: []; saved: [newId: string] }>()

const isEdit = computed(() => !!props.song)
const { addSong, updateSong, songs } = useSongs()

const statusOptions = [
  { value: 'know' as SongStatus,     label: 'I Know It',   activeClass: 'border-emerald-400 bg-emerald-50 text-emerald-700' },
  { value: 'learning' as SongStatus, label: 'Learning',    activeClass: 'border-amber-400 bg-amber-50 text-amber-700' },
  { value: 'future' as SongStatus,   label: 'Future Goal', activeClass: 'border-sky-400 bg-sky-50 text-sky-700' },
]

const chordGroups = [
  { label: 'Major',  chords: ['C', 'D', 'E', 'F', 'G', 'A', 'B'] },
  { label: 'Minor',  chords: ['Am', 'Bm', 'Cm', 'Dm', 'Em', 'Fm', 'Gm'] },
  { label: '7th',    chords: ['C7', 'D7', 'E7', 'F7', 'G7', 'A7', 'B7'] },
  { label: 'Min 7',  chords: ['Am7', 'Bm7', 'Dm7', 'Em7', 'Gm7'] },
  { label: 'Maj 7',  chords: ['Cmaj7', 'Dmaj7', 'Fmaj7', 'Gmaj7', 'Amaj7'] },
  { label: 'Sus',    chords: ['Asus2', 'Asus4', 'Dsus2', 'Dsus4', 'Gsus2', 'Gsus4'] },
  { label: 'Add 9',  chords: ['Cadd9', 'Dadd9', 'Gadd9', 'Fadd9'] },
]

function extractChordsFromSong(song: Song): string[] {
  const block = song.tab.find(b => b.type === 'info' && b.content.includes('Chords used:'))
  if (!block) return []
  return block.content.replace('Chords used:', '').trim().split(/\s+/).filter(Boolean)
}

function tabBlocksToText(song: Song): string {
  return song.tab
    .map(b => b.type === 'blank' ? '' : b.type === 'info' ? '' : b.content)
    .join('\n')
    .trim()
}

const form = ref({
  title:          props.song?.title      ?? '',
  artist:         props.song?.artist     ?? '',
  status:         props.song?.status     ?? ('learning' as SongStatus),
  tabUrl:         props.song?.tabUrl     ?? '',
  youtubeUrl:     props.song?.youtubeUrl ?? '',
  key:            props.song?.key        ?? 'G',
  capo:           props.song?.capo       ?? undefined as number | undefined,
  difficulty:     props.song?.difficulty ?? ('medium' as 'easy' | 'medium' | 'hard'),
  tabText:        props.song ? tabBlocksToText(props.song) : '',
  selectedChords: props.song ? extractChordsFromSong(props.song) : [] as string[],
})

function toggleChord(chord: string) {
  const idx = form.value.selectedChords.indexOf(chord)
  if (idx === -1) form.value.selectedChords.push(chord)
  else form.value.selectedChords.splice(idx, 1)
}

function extractChordsFromText(text: string): string[] {
  const found = new Set<string>()
  for (const line of text.split('\n')) {
    if (!isChordLine(line)) continue
    for (const raw of line.trim().split(/\s+/)) {
      const token = raw.replace(/\*+/g, '')
      if (isChordToken(token)) found.add(token)
    }
  }
  return Array.from(found)
}

const error = ref('')

let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(() => form.value.tabText, (text) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    const detected = extractChordsFromText(text)
    if (detected.length) form.value.selectedChords = detected
  }, 300)
})

function submit() {
  error.value = ''
  if (!form.value.title.trim() || !form.value.artist.trim()) {
    error.value = 'Title and artist are required.'
    return
  }
  const newId = slugify(form.value.title, form.value.artist)

  if (!isEdit.value && songs.value.find(s => s.id === newId)) {
    error.value = 'A song with this title and artist already exists.'
    return
  }

  const parsedTab = form.value.tabText.trim()
    ? parseTabText(form.value.tabText)
    : []

  const capoStr = form.value.capo ? `Capo: ${form.value.capo}` : 'No capo'
  const infoBlocks: { type: 'info' | 'blank'; content: string }[] = [
    { type: 'info', content: `Key: ${form.value.key}  |  ${capoStr}  |  Tuning: Standard` },
  ]
  if (form.value.selectedChords.length) {
    infoBlocks.push({ type: 'info', content: `Chords used: ${form.value.selectedChords.join('  ')}` })
  }
  infoBlocks.push({ type: 'blank', content: '' })

  const tab = parsedTab.length
    ? [...infoBlocks, ...parsedTab]
    : [...infoBlocks, { type: 'info' as const, content: 'No tab content added yet.' }]

  const updated: Song = {
    id:         newId,
    title:      form.value.title.trim(),
    artist:     form.value.artist.trim(),
    status:     form.value.status,
    tabUrl:     form.value.tabUrl || '#',
    youtubeUrl: form.value.youtubeUrl || undefined,
    key:        form.value.key,
    capo:       form.value.capo || undefined,
    difficulty: form.value.difficulty,
    tab,
  }

  if (isEdit.value) {
    updateSong(props.song!.id, updated)
  } else {
    addSong(updated)
  }

  emit('saved', newId)
  emit('close')
}
</script>

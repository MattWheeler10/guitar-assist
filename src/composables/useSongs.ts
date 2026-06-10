import { ref, watch } from 'vue'
import type { Song, SongStatus, TabBlock } from '../data/songs'
import { getSongs } from '../data/songs'
import { isChordLine } from '../utils/chordSequence'

const songs = ref<Song[]>(getSongs())

watch(songs, (val) => {
  localStorage.setItem('guitar-assist-songs', JSON.stringify(val))
}, { deep: true })

export function useSongs() {
  function moveSong(id: string, newStatus: SongStatus) {
    const song = songs.value.find(s => s.id === id)
    if (song) song.status = newStatus
  }

  function addSong(song: Song) {
    songs.value.push(song)
  }

  function updateSong(originalId: string, updated: Song) {
    const idx = songs.value.findIndex(s => s.id === originalId)
    if (idx !== -1) songs.value[idx] = updated
  }

  function removeSong(id: string) {
    songs.value = songs.value.filter(s => s.id !== id)
  }

  function getSongsByStatus(status: SongStatus) {
    return songs.value.filter(s => s.status === status)
  }

  function getSongById(id: string) {
    return songs.value.find(s => s.id === id)
  }

  return { songs, moveSong, addSong, updateSong, removeSong, getSongsByStatus, getSongById }
}

// --- Tab metadata extractor ---

export interface TabMeta {
  key: string | null   // null = not found in tab text
  capo: number | null  // null = not found; 0 = explicitly "no capo"
}

const ENHARMONIC_MAP: Record<string, string> = {
  'A#': 'A#/Bb', 'Bb': 'A#/Bb',
  'C#': 'C#/Db', 'Db': 'C#/Db',
  'D#': 'D#/Eb', 'Eb': 'D#/Eb',
  'F#': 'F#/Gb', 'Gb': 'F#/Gb',
  'G#': 'G#/Ab', 'Ab': 'G#/Ab',
}
const NATURAL_KEYS = new Set(['A', 'B', 'C', 'D', 'E', 'F', 'G'])

function normalizeKey(raw: string): string | null {
  const root = raw.replace(/m$/, '')
  return ENHARMONIC_MAP[root] ?? (NATURAL_KEYS.has(root) ? root : null)
}

function parseCapo(raw: string): number | null {
  const s = raw.trim().toLowerCase()
  if (/^(no capo|none|no)$/.test(s)) return 0
  const m = s.match(/\d+/)
  return m ? parseInt(m[0], 10) : null
}

export function extractTabMeta(raw: string): TabMeta {
  let key: string | null = null
  let capo: number | null = null

  for (const line of raw.split('\n')) {
    const t = line.trim()
    if (key === null) {
      const m = t.match(/^key\s*[:\-]\s*([A-G][#b]?m?)/i)
      if (m) key = normalizeKey(m[1])
    }
    if (capo === null) {
      const m = t.match(/^capo\s*[:\-]\s*(.+)/i)
      if (m) capo = parseCapo(m[1])
    }
    if (key !== null && capo !== null) break
  }

  return { key, capo }
}

// --- Tab content parser ---

// Remove asterisk markers UG adds to chords (e.g. "Am*" -> "Am")
function stripChordAsterisks(line: string): string {
  return line.replace(/([A-G][#b]?[^\s*]*)\*+/g, '$1')
}

// Matches lines like "E|---0---", "e|---", "B|--3--", "D|--5--" etc.
function isTabLine(line: string): boolean {
  return /^\s*[EBGDAe]\|/.test(line)
}

export function parseTabText(raw: string): TabBlock[] {
  const lines = raw.split('\n')
  const blocks: TabBlock[] = []

  for (const line of lines) {
    const trimmed = line.trimEnd()
    if (!trimmed.trim()) {
      blocks.push({ type: 'blank', content: '' })
      continue
    }
    if (trimmed.trim().startsWith('[') && trimmed.trim().endsWith(']')) {
      blocks.push({ type: 'section', content: trimmed.trim() })
      continue
    }
    if (isTabLine(trimmed)) {
      // Append to an existing tab block if the previous block is also a tab line,
      // otherwise start a new one
      const prev = blocks.at(-1)
      if (prev?.type === 'tab') {
        prev.content += '\n' + trimmed
      } else {
        blocks.push({ type: 'tab', content: trimmed })
      }
      continue
    }
    if (isChordLine(trimmed)) {
      blocks.push({ type: 'chords', content: stripChordAsterisks(trimmed) })
      continue
    }
    blocks.push({ type: 'lyrics', content: trimmed })
  }

  // Collapse multiple consecutive blanks into one
  return blocks.reduce<TabBlock[]>((acc, b) => {
    if (b.type === 'blank' && acc.at(-1)?.type === 'blank') return acc
    acc.push(b)
    return acc
  }, [])
}

export function slugify(title: string, artist: string): string {
  return `${title}-${artist}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

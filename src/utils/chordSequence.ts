import type { TabBlock } from '../data/songs'

/**
 * Parses the chord sequence out of a song's tab blocks for play-along mode, and
 * splits each `chords` line into renderable segments so individual chord tokens
 * can be highlighted while preserving the line's monospace alignment.
 */

const PITCH_CLASS: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1,
  D: 2, 'D#': 3, Eb: 3,
  E: 4, F: 5, 'F#': 6, Gb: 6,
  G: 7, 'G#': 8, Ab: 8,
  A: 9, 'A#': 10, Bb: 10, B: 11,
}

// Chord quality / extensions, longest-first so e.g. "maj7" wins over "maj" and
// "m7b5" over "m7". Allowed to chain (e.g. "7sus4", "add9") via `*` below.
const QUALITY =
  'maj13|maj11|maj9|maj7|maj|m7b5|min7|min|m13|m11|m9|m7|m6|m|add11|add9|add|sus2|sus4|sus|dim7|dim|aug|13|11|9|7|6|5'

// Root is an uppercase A–G (+ optional #/b), so lowercase words in lyrics/
// annotations are never matched. Followed by any number of quality tokens and
// an optional slash-bass note.
const CHORD_RE = new RegExp(`[A-G][#b]?(?:${QUALITY})*(?:\\/[A-G][#b]?)?`, 'g')

// Anchored single-token test: does this whole token look like a chord?
const CHORD_TOKEN_RE = new RegExp(`^[A-G][#b]?(?:${QUALITY})*(?:\\/[A-G][#b]?)?$`)

/**
 * True if every whitespace-separated token on the line is a chord (e.g.
 * "C  Em  G6  Fmaj7"). Asterisk variation markers are ignored. Used at paste
 * time to tell chord lines apart from lyrics.
 */
export function isChordLine(line: string): boolean {
  const tokens = line.trim().replace(/\*/g, '').split(/\s+/).filter(Boolean)
  return tokens.length > 0 && tokens.every((t) => CHORD_TOKEN_RE.test(t))
}

/** True if a single token (asterisks stripped) is a valid chord, e.g. "G6". */
export function isChordToken(token: string): boolean {
  return CHORD_TOKEN_RE.test(token.replace(/\*/g, ''))
}

/**
 * Canonical id matching the detector's: `${pitchClass}:${minor ? 1 : 0}`.
 * Detection only distinguishes major vs minor triads, so 7ths/sus/etc. collapse
 * to their nearest triad. Returns null if the root is unrecognised.
 */
export function chordToId(name: string): string | null {
  const m = name.match(/^([A-G][#b]?)(.*)$/)
  if (!m || m[1] === undefined) return null
  const pc = PITCH_CLASS[m[1]]
  if (pc === undefined) return null
  const suffix = m[2] ?? ''
  // minor if it starts with m/min but NOT "maj"
  const minor = /^(?:m(?!aj)|min)/.test(suffix)
  return `${pc}:${minor ? 1 : 0}`
}

export interface ChordStep {
  /** Chord as written in the tab, e.g. "Em" */
  chord: string
  /** Canonical id for comparison with the detector */
  id: string
}

export interface TabSegment {
  text: string
  /** Index into the flat step list, or null for plain text/whitespace */
  step: number | null
}

export interface ParsedBlock extends TabBlock {
  segments?: TabSegment[]
}

export interface ParsedTab {
  blocks: ParsedBlock[]
  steps: ChordStep[]
}

export function parseTab(tab: TabBlock[]): ParsedTab {
  const steps: ChordStep[] = []
  const blocks: ParsedBlock[] = tab.map((block) => {
    if (block.type !== 'chords') return { ...block }

    const segments: TabSegment[] = []
    const re = new RegExp(CHORD_RE)
    let lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = re.exec(block.content)) !== null) {
      const token = m[0]
      const id = chordToId(token)
      if (id === null) continue // not a real chord (shouldn't happen), skip
      if (m.index > lastIndex) {
        segments.push({ text: block.content.slice(lastIndex, m.index), step: null })
      }
      const step = steps.length
      steps.push({ chord: token, id })
      segments.push({ text: token, step })
      lastIndex = m.index + token.length
    }
    if (lastIndex < block.content.length) {
      segments.push({ text: block.content.slice(lastIndex), step: null })
    }
    return { ...block, segments }
  })

  return { blocks, steps }
}

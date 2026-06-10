import guitarDb from '@tombatossals/chords-db/lib/guitar.json'

export interface ChordPosition {
  frets: number[]    // 6 values: -1=muted, 0=open, 1+=fret (relative to baseFret)
  fingers: number[]  // 6 values: 0=no finger, 1-4=finger number
  baseFret: number
  barres: number[]   // relative fret positions that have a full barre
}

const KEY_MAP: Record<string, string> = {
  'C': 'C', 'C#': 'Csharp', 'Db': 'Csharp',
  'D': 'D', 'D#': 'Eb', 'Eb': 'Eb',
  'E': 'E', 'F': 'F', 'F#': 'Fsharp', 'Gb': 'Fsharp',
  'G': 'G', 'G#': 'Ab', 'Ab': 'Ab',
  'A': 'A', 'A#': 'Bb', 'Bb': 'Bb', 'B': 'B',
}

// Maps user-facing suffix to DB suffix
const SUFFIX_MAP: Record<string, string> = {
  '':      'major',
  'm':     'minor',
  'maj':   'major',
  'min':   'minor',
  'minor': 'minor',
  'major': 'major',
  'm7':    'm7',
  'maj7':  'maj7',
  '7':     '7',
  'dim':   'dim',
  'dim7':  'dim7',
  'aug':   'aug',
  'sus2':  'sus2',
  'sus4':  'sus4',
  'add9':  'add9',
  '9':     '9',
  '11':    '11',
  '13':    '13',
  '6':     '6',
  'm6':    'm6',
  'm9':    'm9',
}

export function lookupChord(name: string): ChordPosition | null {
  // Strip slash bass notes (C/G → C)
  const slashIdx = name.lastIndexOf('/')
  const cleanName = slashIdx > 0 ? name.slice(0, slashIdx) : name

  const rootMatch = cleanName.match(/^([A-G][#b]?)(.*)$/)
  if (!rootMatch) return null

  const [, root, rawSuffix] = rootMatch
  const dbKey = KEY_MAP[root]
  if (!dbKey) return null

  const suffix = SUFFIX_MAP[rawSuffix] ?? rawSuffix
  const db = guitarDb as any
  const chords: any[] = db.chords[dbKey] ?? []
  const match = chords.find((c: any) => c.suffix === suffix)
  if (!match || !match.positions?.length) return null

  return match.positions[0] as ChordPosition
}

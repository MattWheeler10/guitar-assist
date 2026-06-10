# Guitar Assist — Ideas & Future Features

## Chord Challenge Mini-Game

A timed game mode to drill chord changes under pressure.

### How it works
- Display a random chord diagram (using the existing `ChordDiagram` component)
- A countdown timer starts from 5 seconds
- Player must physically play the chord before time runs out — they self-report success/fail with a button tap
- If time expires without a response, it counts as a miss
- Running score tracked per session (e.g. "7 / 10")
- Optional: increase difficulty by reducing countdown (5s → 4s → 3s) as streak grows
- Optional: limit chord pool to chords from a specific song (pull from `useSongs`)

### Implementation notes
- New view: `src/views/ChordChallengeView.vue`
- Reuse `ChordDiagram.vue` for the chord display
- Pull chord list from `src/utils/chordLookup.ts`
- Score state lives in a new `useChordChallenge` composable
- Add a route and nav link to access the game

---

## UI Redesign — Brighter Colours & Better UX

The current UI is functional but could feel more vibrant and polished.

### Direction
- Move away from muted/dark tones — use a bright, warm palette (ambers, teals, or electric blues with white space)
- Larger, more readable chord labels with better contrast
- Cards with more padding, rounded corners, subtle shadows (not flat)
- Animated transitions between views (Vue `<Transition>`)
- Better mobile layout — current chord diagrams may be too small on small screens
- Sticky nav with clear active states
- A proper hero/header on the home view with a tagline

### Specific component targets
- `src/style.css` — replace CSS variables with a new brighter palette
- `src/views/HomeView.vue` — hero section, better card grid layout
- `src/components/SongCard.vue` — richer card design, hover effects
- `src/components/ChordDiagram.vue` — larger dots, brighter string/fret lines
- `src/components/AddSongModal.vue` / `ConfirmDeleteModal.vue` — consistent modal style with backdrop blur

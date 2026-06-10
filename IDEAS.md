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

## Chord Transition Trainer

Drill the *switch* between two specific chords — the hardest skill for beginners.

### How it works
- Player picks two chords (e.g. G → Em)
- A 60-second countdown runs
- Mic detects each successful chord in sequence and counts clean transitions
- Score = number of clean switches made in the time limit
- Could live as a new mode inside ChordChallengeView or its own view

### Notes
- Reuses existing mic detection from `useChordDetection`
- Could seed the pair from a song's chord sheet (e.g. "practice the hardest transition in this song")

---

## BPM / Metronome Mode in Chord Game

Replace (or complement) the countdown timer with a musical BPM setting.

### How it works
- Player sets a BPM before starting
- The current chord flashes/pulses on the beat
- Mic detects the chord; game advances on the next beat if correct
- Much more transferable to real playing than a raw countdown

### Notes
- Use Web Audio API `AudioContext` to schedule click events precisely
- BPM selector alongside the existing timer selector in settings

---

## Built-in Guitar Tuner

A chromatic tuner using the microphone — one of the most-used tools for any guitarist.

### How it works
- Detect the dominant frequency from mic input using FFT (same pipeline as chord detection)
- Match it to the nearest note and show cents sharp/flat
- Display the six standard string names (E A D G B e) as targets
- Simple needle or colour (red → green) UI

### Notes
- New view or slide-out panel accessible from the nav
- Reuse the `AudioContext` setup from `useChordDetection`

---

## Practice Streak & Session Log

Motivational tracking to encourage daily practice.

### How it works
- Log the date whenever a play-along, scroll-along, or chord game session completes
- Show a streak counter ("🔥 5 days in a row") on the home screen
- Calendar heatmap or simple "last 7 days" dots per song or overall
- Persisted in `localStorage`

### Notes
- New composable `useSessionLog.ts`
- Could also surface "you haven't practiced this song in 2 weeks" nudges on song cards

---

## Chord Progression Practice Mode

Practice common real-world progressions rather than random chords.

### How it works
- Preset progressions: I–IV–V–I, I–V–vi–IV, 12-bar blues, etc.
- Mic detects each chord in sequence; auto-advances when correct
- Shows which degree of the key each chord is (e.g. "IV — F in the key of C")
- Optional: pull the progression from a specific song in the songbook

### Notes
- Could be a new tab inside ChordChallengeView
- Progressions stored as arrays of chord IDs relative to a root key

---

## Auto-Difficulty Progression in Chord Game

Tighten the timer automatically as the player succeeds.

### How it works
- Start at the selected countdown (e.g. 10s)
- After each correct answer, reduce by 0.5s (floor at 2s)
- After a miss, add 1s back (ceiling at the starting value)
- Optional: show a "difficulty" label that rises as the timer tightens

### Notes
- Small change to the existing game loop in `ChordChallengeView.vue`
- Could be a toggle in settings: "Adaptive difficulty: on/off"

---

## Practice Notes per Song

Free-text notes attached to each song for personal reminders.

### How it works
- A collapsible notes section on the song view (below the chord sheet)
- Editable inline; saved to the song record in `localStorage`
- Examples: "struggling with F → C", "capo keeps slipping on fret 3"

### Notes
- Add `notes?: string` field to the `Song` interface in `src/data/songs.ts`
- Simple `<textarea>` with auto-save on blur

---

## Ear Training Mode

Reverse of the chord game — hear a chord, identify it by name.

### How it works
- App synthesises a chord through the speakers using Web Audio API
- Player taps the correct chord name from multiple choices
- Builds the ability to recognise chords without visual cues
- Score tracked per session

### Notes
- Use `OscillatorNode` + `GainNode` to synthesise triads
- Chord pool uses the same category system as the chord game
- Could be a new mode toggle in ChordChallengeView

---

## Backing Track Generator

A simple looping drum/bass pattern to practice over.

### How it works
- Player picks a key and BPM
- App generates a basic rhythmic loop (4/4 strumming pattern or drum beat) using Web Audio API
- Play button starts the loop; player practices over it
- Optional: tie to a song's key so it starts pre-configured

### Notes
- Could use pre-recorded one-bar audio loops or Web Audio synthesis
- New view or a panel accessible from the song page

---

## Fretboard Visualiser

Show chord and scale shapes across the full neck, not just a 4-fret box.

### How it works
- Full 12-fret neck diagram rendered as SVG
- Highlight all positions where a chord or scale tone appears
- Toggle between chord view and scale view
- Click a chord in the songbook to see it on the full neck

### Notes
- New component `FretboardDiagram.vue`
- Logic to calculate all note positions from a root + intervals

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

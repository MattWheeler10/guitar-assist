import { ref, shallowRef } from 'vue'

/**
 * Real-time chord detection from the microphone.
 *
 * Approach: pull an FFT spectrum from a Web Audio AnalyserNode, fold it into a
 * 12-bin "chroma" vector (energy per pitch-class, summed across octaves), then
 * match that against templates for every major/minor triad via cosine
 * similarity. This is the classic chromagram technique — it won't rival a
 * trained ML model, but it's self-contained and works well for the clean open
 * chords (Em, C, G, D, Am, F …) this app deals with.
 *
 * The detector smooths its output: a candidate must win for several consecutive
 * frames, with enough confidence and energy, before `detectedId` updates. This
 * keeps the green/red feedback from flickering.
 */

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export interface ChordTemplate {
  /** Canonical id: `${pitchClass}:${minor ? 1 : 0}` */
  id: string
  /** Display name, e.g. "Em", "C" */
  name: string
  /** Unit-length 12-bin template vector */
  vec: Float32Array
}

/** Build templates for all 12 major + 12 minor triads. */
function buildTemplates(): ChordTemplate[] {
  const templates: ChordTemplate[] = []
  const make = (root: number, intervals: number[], minor: boolean) => {
    const vec = new Float32Array(12)
    for (const iv of intervals) vec[(root + iv) % 12] = 1
    // normalise to unit length so cosine similarity is just a dot product
    const norm = Math.sqrt(intervals.length)
    for (let i = 0; i < 12; i++) vec[i] = (vec[i] ?? 0) / norm
    templates.push({
      id: `${root}:${minor ? 1 : 0}`,
      name: NOTE_NAMES[root] + (minor ? 'm' : ''),
      vec,
    })
  }
  for (let root = 0; root < 12; root++) {
    make(root, [0, 4, 7], false) // major triad
    make(root, [0, 3, 7], true) // minor triad
  }
  return templates
}

const TEMPLATES = buildTemplates()

export function useChordDetection() {
  const isListening = ref(false)
  /** Canonical id of the currently-detected chord, or null. */
  const detectedId = ref<string | null>(null)
  /** Display name of the currently-detected chord, or null. */
  const detectedName = ref<string | null>(null)
  /** Mic input level 0..1, for a live meter. */
  const level = ref(0)
  const error = ref<string | null>(null)
  /** Object URL of the last session's recording, for playback. */
  const recordingUrl = ref<string | null>(null)

  const audioCtx = shallowRef<AudioContext | null>(null)
  let analyser: AnalyserNode | null = null
  let source: MediaStreamAudioSourceNode | null = null
  let stream: MediaStream | null = null
  let rafId = 0

  let mediaRecorder: MediaRecorder | null = null
  let recordedChunks: Blob[] = []

  /** First MediaRecorder mime type the browser supports, or '' for default. */
  function pickMime(): string | null {
    if (typeof MediaRecorder === 'undefined') return null
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ]
    for (const c of candidates) {
      if (MediaRecorder.isTypeSupported(c)) return c
    }
    return '' // let the browser choose its default
  }

  let freqData: Float32Array<ArrayBuffer> | null = null
  let timeData: Float32Array<ArrayBuffer> | null = null
  const chroma = new Float32Array(12)

  // smoothing state
  let candidateId: string | null = null
  let candidateCount = 0
  const STABLE_FRAMES = 3 // consecutive frames a candidate must win
  const SIM_THRESHOLD = 0.62 // minimum cosine similarity to accept
  const MARGIN = 0.02 // top must beat runner-up by this much
  const LEVEL_FLOOR = 0.012 // RMS below this = treat as silence

  let lastTick = 0
  const TICK_MS = 50 // throttle analysis to ~20fps

  function analyse(now: number) {
    rafId = requestAnimationFrame(analyse)
    if (now - lastTick < TICK_MS) return
    lastTick = now

    if (!analyser || !freqData || !timeData || !audioCtx.value) return

    // --- input level (RMS from time domain) ---
    analyser.getFloatTimeDomainData(timeData)
    let sumSq = 0
    for (let i = 0; i < timeData.length; i++) {
      const v = timeData[i] ?? 0
      sumSq += v * v
    }
    const rms = Math.sqrt(sumSq / timeData.length)
    level.value = Math.min(1, rms * 4)

    if (rms < LEVEL_FLOOR) {
      resetCandidate(null)
      return
    }

    // --- build chroma vector ---
    analyser.getFloatFrequencyData(freqData)
    chroma.fill(0)
    const sr = audioCtx.value.sampleRate
    const binHz = sr / analyser.fftSize
    const minHz = 70 // ~ low E (open guitar E2 = 82Hz, leave headroom)
    const maxHz = 1600
    for (let bin = 1; bin < freqData.length; bin++) {
      const hz = bin * binHz
      if (hz < minHz) continue
      if (hz > maxHz) break
      const db = freqData[bin] ?? -Infinity
      if (!isFinite(db)) continue
      const amp = Math.pow(10, db / 20) // dB -> linear amplitude
      // pitch class of nearest semitone
      const midi = 69 + 12 * Math.log2(hz / 440)
      const pc = ((Math.round(midi) % 12) + 12) % 12
      chroma[pc] = (chroma[pc] ?? 0) + amp
    }

    // normalise chroma to unit length
    let chromaNorm = 0
    for (let i = 0; i < 12; i++) {
      const c = chroma[i] ?? 0
      chromaNorm += c * c
    }
    chromaNorm = Math.sqrt(chromaNorm)
    if (chromaNorm < 1e-9) {
      resetCandidate(null)
      return
    }
    for (let i = 0; i < 12; i++) chroma[i] = (chroma[i] ?? 0) / chromaNorm

    // --- match against templates ---
    let best: ChordTemplate | null = null
    let bestSim = -1
    let secondSim = -1
    for (const t of TEMPLATES) {
      let dot = 0
      for (let i = 0; i < 12; i++) dot += (chroma[i] ?? 0) * (t.vec[i] ?? 0)
      if (dot > bestSim) {
        secondSim = bestSim
        bestSim = dot
        best = t
      } else if (dot > secondSim) {
        secondSim = dot
      }
    }

    if (best && bestSim >= SIM_THRESHOLD && bestSim - secondSim >= MARGIN) {
      accumulate(best)
    } else {
      resetCandidate(null)
    }
  }

  /** A candidate won this frame; promote it once it's stable. */
  function accumulate(t: ChordTemplate) {
    if (candidateId === t.id) {
      candidateCount++
    } else {
      candidateId = t.id
      candidateCount = 1
    }
    if (candidateCount >= STABLE_FRAMES && detectedId.value !== t.id) {
      detectedId.value = t.id
      detectedName.value = t.name
    }
  }

  /** No confident match this frame. */
  function resetCandidate(_: null) {
    candidateId = null
    candidateCount = 0
    if (detectedId.value !== null) {
      detectedId.value = null
      detectedName.value = null
    }
  }

  async function start(deviceId?: string) {
    if (isListening.value) return
    error.value = null
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          ...(deviceId ? { deviceId: { exact: deviceId } } : {}),
        },
      })
      const ctx = new AudioContext()
      audioCtx.value = ctx
      if (ctx.state === 'suspended') await ctx.resume()
      source = ctx.createMediaStreamSource(stream)
      analyser = ctx.createAnalyser()
      analyser.fftSize = 16384 // ~2.7Hz bins @44.1kHz — fine low-end resolution
      analyser.smoothingTimeConstant = 0.4
      analyser.minDecibels = -90
      analyser.maxDecibels = -10
      source.connect(analyser)

      freqData = new Float32Array(analyser.frequencyBinCount)
      timeData = new Float32Array(analyser.fftSize)

      // start recording the take so it can be played back afterwards
      if (recordingUrl.value) {
        URL.revokeObjectURL(recordingUrl.value)
        recordingUrl.value = null
      }
      recordedChunks = []
      const mime = pickMime()
      if (mime !== null) {
        try {
          mediaRecorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)
          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunks.push(e.data)
          }
          mediaRecorder.onstop = () => {
            if (recordedChunks.length === 0) return
            const blob = new Blob(recordedChunks, {
              type: mediaRecorder?.mimeType || 'audio/webm',
            })
            recordingUrl.value = URL.createObjectURL(blob)
          }
          mediaRecorder.start()
        } catch {
          mediaRecorder = null
        }
      }

      isListening.value = true
      lastTick = 0
      rafId = requestAnimationFrame(analyse)
    } catch (e: unknown) {
      error.value =
        e instanceof DOMException && e.name === 'NotAllowedError'
          ? 'Microphone access was denied. Allow it in your browser to play along.'
          : 'Could not access the microphone.'
      stop()
    }
  }

  function stop() {
    cancelAnimationFrame(rafId)
    rafId = 0
    // Stop the recorder first so its buffered audio is flushed (onstop builds
    // the playback URL) before we tear down the underlying media tracks.
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try {
        mediaRecorder.stop()
      } catch {
        /* ignore */
      }
    }
    mediaRecorder = null
    source?.disconnect()
    analyser?.disconnect()
    stream?.getTracks().forEach((t) => t.stop())
    audioCtx.value?.close().catch(() => {})
    source = null
    analyser = null
    stream = null
    audioCtx.value = null
    freqData = null
    timeData = null
    isListening.value = false
    level.value = 0
    detectedId.value = null
    detectedName.value = null
    candidateId = null
    candidateCount = 0
  }

  /** Free the recording's object URL; call on unmount. */
  function dispose() {
    stop()
    if (recordingUrl.value) {
      URL.revokeObjectURL(recordingUrl.value)
      recordingUrl.value = null
    }
  }

  return { isListening, detectedId, detectedName, level, error, recordingUrl, start, stop, dispose }
}

// AudioContext lazy — necesita interacción de usuario antes de poder reproducir
let sharedCtx: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!sharedCtx) {
    sharedCtx = new AudioContext()
  }
  return sharedCtx
}

async function ensureRunning(ctx: AudioContext): Promise<void> {
  if (ctx.state === 'suspended') {
    await ctx.resume()
  }
}

/** Pop suave — tarea completada */
export async function playPop() {
  const ctx = getAudioContext()
  if (!ctx) return
  await ensureRunning(ctx)

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.type = 'sine'
  osc.frequency.setValueAtTime(600, ctx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08)

  gain.gain.setValueAtTime(0.25, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)

  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 0.08)
}

/** Desbloquea el AudioContext (Chrome lo mantiene suspendido hasta interacción) */
export async function unlockAudioContext() {
  const ctx = getAudioContext()
  if (ctx && ctx.state === 'suspended') {
    await ctx.resume()
  }
}

/** Ding — pomodoro completado */
export async function playDing() {
  const ctx = getAudioContext()
  if (!ctx) return
  await ensureRunning(ctx)

  // Dos tonos para efecto de campana
  const freqs = [880, 1108] as const
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05)

    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.05)
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.05 + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.05 + 1.2)

    osc.start(ctx.currentTime + i * 0.05)
    osc.stop(ctx.currentTime + i * 0.05 + 1.2)
  })
}

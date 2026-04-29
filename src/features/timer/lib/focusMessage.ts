import { toast } from 'sonner'

function formatEndTime(remainingSeconds: number): string {
  const end = new Date(Date.now() + remainingSeconds * 1000)
  return end.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
}

/**
 * Copia al portapapeles un mensaje de "modo enfoque" para pegar
 * en Slack/Teams/WhatsApp. Reduce ansiedad social del TDAH.
 */
export async function copyFocusMessage(remainingSeconds: number) {
  const endTime = formatEndTime(remainingSeconds)
  const message = `Estoy en modo enfoque hasta las ${endTime}. Te respondo después.`

  try {
    await navigator.clipboard.writeText(message)
    toast.success('Mensaje copiado al portapapeles', {
      description: message,
      duration: 3000,
    })
  } catch {
    toast.error('No se pudo copiar el mensaje', {
      description: 'Probá manualmente con Ctrl+C',
      duration: 3000,
    })
  }
}

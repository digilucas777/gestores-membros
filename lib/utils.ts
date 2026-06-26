// lib/utils.ts

/**
 * Accepts a Panda Video iframe, a Videoflow iframe, or a direct URL.
 * Returns just the video URL to store in the database.
 * Videoflow URLs are prefixed with "vf::" so the player can render them correctly.
 */
export function extractVideoUrl(input: string): string {
  const trimmed = input.trim()

  // Already stored as Videoflow (idempotent re-save)
  if (trimmed.startsWith('vf::')) return trimmed

  // Videoflow embed: <div ... data-vf-src="URL" ...>
  const vfSrcMatch = trimmed.match(/data-vf-src="([^"]+)"/)
  if (vfSrcMatch) return `vf::${vfSrcMatch[1]}`

  // Generic iframe (Panda Video / others): src="URL"
  const srcMatch = trimmed.match(/src="([^"]+)"/)
  if (srcMatch) return srcMatch[1]

  // Plain URL — detect Videoflow by domain
  if (trimmed.includes('videoflow.lat')) return `vf::${trimmed}`

  return trimmed
}

/** @deprecated use extractVideoUrl */
export const extractPandaVideoUrl = extractVideoUrl

export function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

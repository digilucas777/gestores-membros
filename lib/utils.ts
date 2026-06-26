// lib/utils.ts

/**
 * Accepts a Panda Video iframe embed code or a direct URL.
 * Returns just the URL to use as iframe src.
 */
export function extractPandaVideoUrl(input: string): string {
  const trimmed = input.trim()
  const srcMatch = trimmed.match(/src="([^"]+)"/)
  if (srcMatch) return srcMatch[1]
  return trimmed
}

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

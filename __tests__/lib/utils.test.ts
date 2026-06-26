// __tests__/lib/utils.test.ts
import { extractPandaVideoUrl, formatDate } from '@/lib/utils'

describe('extractPandaVideoUrl', () => {
  it('extracts src from full iframe code', () => {
    const iframe = `<iframe id="panda-abc" src="https://player-vz-123.tv.pandavideo.com.br/embed/?v=uuid-here" style="border:none;" allow="autoplay"></iframe>`
    expect(extractPandaVideoUrl(iframe)).toBe(
      'https://player-vz-123.tv.pandavideo.com.br/embed/?v=uuid-here'
    )
  })

  it('returns URL unchanged when already a URL', () => {
    const url = 'https://player-vz-123.tv.pandavideo.com.br/embed/?v=uuid-here'
    expect(extractPandaVideoUrl(url)).toBe(url)
  })

  it('trims whitespace', () => {
    const url = '  https://player-vz-123.tv.pandavideo.com.br/embed/?v=abc  '
    expect(extractPandaVideoUrl(url)).toBe(
      'https://player-vz-123.tv.pandavideo.com.br/embed/?v=abc'
    )
  })
})

describe('formatDate', () => {
  it('returns — for null', () => {
    expect(formatDate(null)).toBe('—')
  })

  it('returns formatted date string for valid ISO', () => {
    const result = formatDate('2026-06-26T10:00:00Z')
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })
})

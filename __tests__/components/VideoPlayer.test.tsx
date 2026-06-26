// __tests__/components/VideoPlayer.test.tsx
import { render, screen } from '@testing-library/react'
import VideoPlayer from '@/components/VideoPlayer'

describe('VideoPlayer', () => {
  it('renders an iframe with the correct src', () => {
    const url = 'https://player-vz-123.tv.pandavideo.com.br/embed/?v=abc'
    render(<VideoPlayer url={url} title="Aula 1" />)
    const iframe = screen.getByTitle('Aula 1')
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute('src', url)
  })

  it('renders iframe with allowFullScreen', () => {
    render(
      <VideoPlayer
        url="https://player-vz-123.tv.pandavideo.com.br/embed/?v=abc"
        title="Test"
      />
    )
    const iframe = screen.getByTitle('Test')
    expect(iframe).toHaveAttribute('allowFullscreen')
  })
})

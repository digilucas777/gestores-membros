'use client'

import { useEffect } from 'react'

type Props = {
  url: string
  title: string
}

const VIDEOFLOW_SCRIPT = 'https://videoflow.lat/player/embed.js'

export default function VideoPlayer({ url, title }: Props) {
  const isVideoflow = url.startsWith('vf::')
  const videoUrl = isVideoflow ? url.slice(4) : url

  useEffect(() => {
    if (!isVideoflow) return

    const existing = document.querySelector(`script[src="${VIDEOFLOW_SCRIPT}"]`)
    if (existing) {
      existing.remove()
    }

    const script = document.createElement('script')
    script.src = VIDEOFLOW_SCRIPT
    script.async = true
    document.head.appendChild(script)

    return () => {
      script.remove()
    }
  }, [isVideoflow, videoUrl])

  if (isVideoflow) {
    return (
      <div
        className="w-full rounded-xl overflow-hidden bg-black"
        style={{ position: 'relative', aspectRatio: '16/9', maxHeight: '450px' }}
      >
        <div
          className="vf-player"
          data-vf-src={videoUrl}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />
      </div>
    )
  }

  return (
    <div
      className="w-full rounded-xl overflow-hidden bg-black"
      style={{ position: 'relative', aspectRatio: '16/9', maxHeight: '450px' }}
    >
      <iframe
        src={videoUrl}
        title={title}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
      />
    </div>
  )
}

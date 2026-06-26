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
      <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
        <div
          className="vf-player w-full h-full"
          data-vf-src={videoUrl}
        />
      </div>
    )
  }

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
      <iframe
        src={videoUrl}
        title={title}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className="w-full h-full border-0"
      />
    </div>
  )
}

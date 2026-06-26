// components/VideoPlayer.tsx
'use client'

type Props = {
  url: string
  title: string
}

export default function VideoPlayer({ url, title }: Props) {
  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black">
      <iframe
        src={url}
        title={title}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        className="w-full h-full border-0"
      />
    </div>
  )
}

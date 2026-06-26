// app/aulas/[id]/page.tsx
export const dynamic = 'force-dynamic'

import { getAulaById } from '@/lib/actions/aulas'
import VideoPlayer from '@/components/VideoPlayer'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ id: string }> }

export default async function AulaPage({ params }: Props) {
  const { id } = await params
  const aula = await getAulaById(id)
  if (!aula) notFound()

  return (
    <div className="min-h-screen">
      <header className="border-b border-border px-6 py-4 flex items-center gap-4">
        <Link
          href="/aulas"
          className="text-muted text-sm hover:text-white transition-colors"
        >
          ← Voltar
        </Link>
        <h1 className="font-bold text-lg">
          Trafego <span className="text-muted font-normal">/ BORDERLESS</span>
        </h1>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-6">{aula.titulo}</h2>
        <VideoPlayer url={aula.panda_video_url} title={aula.titulo} />
        {aula.descricao && (
          <p className="text-muted text-sm mt-6 leading-relaxed">{aula.descricao}</p>
        )}
      </main>
    </div>
  )
}

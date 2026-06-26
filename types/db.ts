// types/db.ts
export type Gestor = {
  id: string
  email: string
  nome: string | null
  created_at: string
  last_seen_at: string | null
  login_count: number
}

export type Modulo = {
  id: string
  titulo: string
  position: number
  created_at: string
}

export type Aula = {
  id: string
  titulo: string
  descricao: string | null
  panda_video_url: string
  modulo_id: string | null
  position: number
  created_at: string
}

export type Acesso = {
  id: string
  gestor_id: string
  accessed_at: string
}

export type AcessoWithGestor = Acesso & {
  gestores: Pick<Gestor, 'nome' | 'email'>
}

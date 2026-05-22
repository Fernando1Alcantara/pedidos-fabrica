'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { formatarData } from '@/lib/data'

export default function MeusPedidosPage() {
  const router = useRouter()
  const [pedidos, setPedidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    function verificarTela() {
      setMobile(window.innerWidth < 768)
    }
    verificarTela()
    window.addEventListener('resize', verificarTela)
    return () => window.removeEventListener('resize', verificarTela)
  }, [])

  useEffect(() => {
    carregarPedidos()
  }, [])

  async function carregarPedidos() {
    // 1. VERIFICAR SE ESTÁ LOGADO
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // 2. VERIFICAR SE É CLIENTE (não industria)
    const { data: clienteInfo } = await supabase
      .from('clientes')
      .select('id, tipo')
      .eq('email', user.email?.toLowerCase())
      .single()

    if (!clienteInfo) {
      setErro('Usuário não encontrado. Contate o administrador.')
      setLoading(false)
      return
    }

    if (clienteInfo.tipo === 'industria') {
      router.push('/industria')
      return
    }

    // 3. BUSCAR PEDIDOS DO CLIENTE
    const { data, error } = await supabase
      .from('pedidos')
      .select(`*, itens_pedido (quantidade)`)
      .eq('cliente_id', clienteInfo.id)
      .order('created_at', { ascending: false })

    if (error) {
      setErro('Erro ao carregar pedidos.')
      setLoading(false)
      return
    }

    setPedidos(data || [])
    setLoading(false)
  }

  function statusConfig(status: string) {
    if (status === 'Recebido') return { fundo: '#FAEEDA', texto: '#854F0B', borda: '#FAC775' }
    if (status === 'Produção') return { fundo: '#E6F1FB', texto: '#185FA5', borda: '#B5D4F4' }
    return { fundo: '#EAF3DE', texto: '#3B6D11', borda: '#C0DD97' }
  }

  function totalPares(pedido: any) {
    return (pedido.itens_pedido || []).reduce(
      (total: number, item: any) => total + Number(item.quantidade || 0), 0
    )
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: '#f5f5f3',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'sans-serif', color: '#888', fontSize: '15px',
      }}>
        Carregando pedidos...
      </div>
    )
  }

  if (erro) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: '#f5f5f3', fontFamily: 'sans-serif',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
      }}>
        <div style={{
          backgroundColor: '#FCEBEB', color: '#A32D2D', padding: '1rem 1.25rem',
          borderRadius: '8px', fontSize: '14px', maxWidth: '400px', textAlign: 'center',
        }}>
          {erro}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#f5f5f3', fontFamily: 'sans-serif',
      padding: mobile ? '1.25rem' : '2rem',
    }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => router.push('/cliente')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '13px', color: '#185FA5', padding: 0, marginBottom: '12px',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}
          >
            ← Voltar
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111', margin: 0 }}>
            Meus pedidos
          </h1>
          <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
            Acompanhe seus pedidos em tempo real
          </p>
        </div>

        {/* SEM PEDIDOS */}
        {pedidos.length === 0 && (
          <div style={{
            backgroundColor: '#fff', borderRadius: '12px',
            border: '0.5px solid rgba(0,0,0,0.1)', padding: '2rem',
            textAlign: 'center', color: '#888', fontSize: '14px',
          }}>
            Você ainda não fez nenhum pedido.
          </div>
        )}

        {/* LISTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {pedidos.map((pedido) => {
            const status = statusConfig(pedido.status)
            return (
              <div key={pedido.id} style={{
                backgroundColor: '#fff',
                border: '0.5px solid rgba(0,0,0,0.1)',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
              }}>
                {/* TOPO */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: mobile ? 'flex-start' : 'center',
                  flexDirection: mobile ? 'column' : 'row',
                  gap: mobile ? '12px' : '8px',
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Pedido
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#111', fontFamily: 'monospace', marginBottom: '4px' }}>
                      #{pedido.id.slice(0, 8)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {formatarData(pedido.created_at)} · {totalPares(pedido)} pares
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <span style={{
                      fontSize: '12px', fontWeight: 500, padding: '4px 12px',
                      borderRadius: '20px', backgroundColor: status.fundo,
                      color: status.texto, border: `0.5px solid ${status.borda}`,
                      display: 'flex', alignItems: 'center', gap: '5px',
                    }}>
                      <span style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        backgroundColor: status.texto, flexShrink: 0,
                      }} />
                      {pedido.status}
                    </span>
                  </div>
                </div>

                {/* LINHA */}
                <div style={{ height: '0.5px', backgroundColor: 'rgba(0,0,0,0.06)', margin: '12px 0' }} />

                {/* RODAPÉ */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: mobile ? 'stretch' : 'center',
                  flexDirection: mobile ? 'column' : 'row',
                  gap: mobile ? '10px' : '8px',
                }}>
                  {/* ETAPAS */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {['Recebido', 'Produção', 'Finalizado'].map((etapa, i) => (
                      <div key={etapa} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {i > 0 && <div style={{ width: '16px', height: '1px', backgroundColor: '#ddd' }} />}
                        <span style={{
                          fontSize: '12px', fontWeight: 500,
                          color: pedido.status === etapa ? '#111' : '#bbb',
                        }}>
                          {etapa}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/meus-pedidos/${pedido.id}`}
                    style={{
                      backgroundColor: '#111827', color: '#fff',
                      padding: mobile ? '10px' : '8px 16px',
                      borderRadius: '8px', fontWeight: 500, fontSize: '13px',
                      textDecoration: 'none', textAlign: 'center',
                      display: 'flex', justifyContent: 'center', alignItems: 'center',
                    }}
                  >
                    Ver detalhes →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
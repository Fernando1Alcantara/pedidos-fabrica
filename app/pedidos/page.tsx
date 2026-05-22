'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function PedidosPage() {
  const router = useRouter()
  const [pedidos, setPedidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [clienteFiltro, setClienteFiltro] = useState('Todos')
  const [statusFiltro, setStatusFiltro] = useState('Todos')
  const [periodoFiltro, setPeriodoFiltro] = useState('Últimos 30 dias')

  useEffect(() => {
    verificarPermissao()
  }, [])

  async function verificarPermissao() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('clientes')
      .select('tipo')
      .eq('email', user.email)
      .single()

    if (!data || data.tipo !== 'industria') {
      router.push('/cliente')
      return
    }

    await carregarPedidos()
    setLoading(false)
  }

  async function carregarPedidos() {
    const { data } = await supabase
      .from('pedidos')
      .select(`*, clientes (nome), itens_pedido (quantidade)`)
      .order('created_at', { ascending: false })

    if (data) setPedidos(data)
  }

  // FILTRO DE PERÍODO COMPARANDO DATA NO FORMATO YYYY-MM-DD (preciso)
  function dataLimite() {
    const hoje = new Date()
    const dataHoje = hoje.toISOString().split('T')[0]

    if (periodoFiltro === 'Hoje') return dataHoje

    const d = new Date()
    if (periodoFiltro === 'Últimos 7 dias') d.setDate(d.getDate() - 7)
    if (periodoFiltro === 'Últimos 30 dias') d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  }

  function pedidosFiltrados() {
    const limite = dataLimite()
    return pedidos.filter((pedido) => {
      const dataPedido = pedido.created_at?.split('T')[0]
      if (!dataPedido) return false

      // FILTRO DE PERÍODO — comparação de strings YYYY-MM-DD (correto e preciso)
      if (dataPedido < limite) return false

      // FILTRO DE CLIENTE
      if (clienteFiltro !== 'Todos' && pedido.clientes?.nome !== clienteFiltro) return false

      // FILTRO DE STATUS
      if (statusFiltro !== 'Todos' && pedido.status !== statusFiltro) return false

      return true
    })
  }

  function totalStatus(status: string) {
    return pedidosFiltrados().filter((p) => p.status === status).length
  }

  function totalPares(pedido: any) {
    return (pedido.itens_pedido || []).reduce(
      (acc: number, item: any) => acc + Number(item.quantidade || 0), 0
    )
  }

  function corStatus(status: string) {
    if (status === 'Recebido') return { fundo: '#FAEEDA', texto: '#854F0B' }
    if (status === 'Impresso') return { fundo: '#E6F1FB', texto: '#185FA5' }
    return { fundo: '#EAF3DE', texto: '#3B6D11' }
  }

  const clientesUnicos = [...new Set(pedidos.map((p) => p.clientes?.nome).filter(Boolean))]

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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f3', padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => router.push('/industria')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '13px', color: '#185FA5', padding: 0, marginBottom: '12px',
              display: 'flex', alignItems: 'center', gap: '4px',
            }}
          >
            ← Voltar
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111', margin: 0 }}>
            Pedidos recebidos
          </h1>
          <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
            Gestão de pedidos da fábrica
          </p>
        </div>

        {/* FILTROS */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <select
            value={clienteFiltro}
            onChange={(e) => setClienteFiltro(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: '8px', border: '0.5px solid rgba(0,0,0,0.2)',
              backgroundColor: '#fff', fontSize: '13px', color: '#111', cursor: 'pointer',
            }}
          >
            <option>Todos</option>
            {clientesUnicos.map((nome) => (
              <option key={nome}>{nome}</option>
            ))}
          </select>

          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: '8px', border: '0.5px solid rgba(0,0,0,0.2)',
              backgroundColor: '#fff', fontSize: '13px', color: '#111', cursor: 'pointer',
            }}
          >
            <option>Todos</option>
            <option>Recebido</option>
            <option>Impresso</option>
            <option>Finalizado</option>
          </select>

          <select
            value={periodoFiltro}
            onChange={(e) => setPeriodoFiltro(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: '8px', border: '0.5px solid rgba(0,0,0,0.2)',
              backgroundColor: '#fff', fontSize: '13px', color: '#111', cursor: 'pointer',
            }}
          >
            <option>Hoje</option>
            <option>Últimos 7 dias</option>
            <option>Últimos 30 dias</option>
          </select>
        </div>

        {/* CARDS STATUS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '1.5rem' }}>
          {[
            { label: 'Recebidos', status: 'Recebido', emoji: '📩' },
            { label: 'Impressos', status: 'Impresso', emoji: '🖨️' },
            { label: 'Finalizados', status: 'Finalizado', emoji: '✅' },
          ].map((item) => (
            <div key={item.status} style={{
              backgroundColor: '#fff', padding: '1rem',
              borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.1)',
            }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>
                {item.emoji} {item.label}
              </div>
              <div style={{ fontSize: '28px', fontWeight: 600, color: '#111' }}>
                {totalStatus(item.status)}
              </div>
            </div>
          ))}
        </div>

        {/* LISTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {pedidosFiltrados().length === 0 && (
            <div style={{
              backgroundColor: '#fff', borderRadius: '12px',
              border: '0.5px solid rgba(0,0,0,0.1)', padding: '2rem',
              textAlign: 'center', color: '#888', fontSize: '14px',
            }}>
              Nenhum pedido encontrado para os filtros selecionados.
            </div>
          )}

          {pedidosFiltrados().map((pedido) => {
            const statusCor = corStatus(pedido.status)
            return (
              <div key={pedido.id} style={{
                backgroundColor: '#fff', borderRadius: '12px', padding: '1rem 1.25rem',
                border: '0.5px solid rgba(0,0,0,0.1)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                gap: '12px', flexWrap: 'wrap',
              }}>
                {/* ESQUERDA */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', color: '#888', marginBottom: '2px' }}>
                    {pedido.clientes?.nome}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#111', fontFamily: 'monospace', marginBottom: '4px' }}>
                    #{pedido.id.slice(0, 8)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {new Date(pedido.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                    {' · '}
                    <span style={{ fontWeight: 500, color: '#111' }}>{totalPares(pedido)} pares</span>
                  </div>
                </div>

                {/* DIREITA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <span style={{
                    fontSize: '12px', fontWeight: 500, padding: '4px 12px',
                    borderRadius: '20px', backgroundColor: statusCor.fundo, color: statusCor.texto,
                  }}>
                    {pedido.status}
                  </span>

                  {/* CORRIGIDO: Link direto sem button dentro */}
                  <Link
                    href={`/pedidos/${pedido.id}`}
                    style={{
                      backgroundColor: '#185FA5', color: '#fff',
                      padding: '7px 14px', borderRadius: '8px',
                      fontSize: '13px', fontWeight: 500, textDecoration: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Abrir pedido
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
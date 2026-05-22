'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [paresHoje, setParesHoje] = useState(0)
  const [pedidosHoje, setPedidosHoje] = useState(0)
  const [clientesHoje, setClientesHoje] = useState(0)
  const [emProducao, setEmProducao] = useState(0)
  const [coresMaisVendidas, setCoresMaisVendidas] = useState<any[]>([])
  const [tamanhosMaisVendidos, setTamanhosMaisVendidos] = useState<any[]>([])

  useEffect(() => {
    verificarECarregar()
  }, [])

  async function verificarECarregar() {
    // 1. VERIFICAR SE ESTÁ LOGADO
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // 2. VERIFICAR SE É industria
    const { data: cliente } = await supabase
      .from('clientes')
      .select('tipo')
      .eq('email', user.email)
      .single()

    if (!cliente || cliente.tipo !== 'industria') {
      router.push('/cliente')
      return
    }

    await carregarDashboard()
    setLoading(false)
  }

  async function carregarDashboard() {
    try {
      const hoje = new Date().toISOString().split('T')[0]

      // PEDIDOS — filtrado por data no banco, não em memória
      const { data: pedidos } = await supabase
        .from('pedidos')
        .select('id, created_at, status, cliente_id')
        .gte('created_at', hoje + 'T00:00:00')
        .lte('created_at', hoje + 'T23:59:59')

      // PEDIDOS EM PRODUÇÃO — query separada
      const { count: countProducao } = await supabase
        .from('pedidos')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'Em Produção')

      setEmProducao(countProducao || 0)
      setPedidosHoje((pedidos || []).length)

      const clientesUnicos = new Set((pedidos || []).map((p) => p.cliente_id))
      setClientesHoje(clientesUnicos.size)

      // IDS DOS PEDIDOS DE HOJE
      const ids = (pedidos || []).map((p) => p.id)

      if (ids.length === 0) {
        setParesHoje(0)
        setCoresMaisVendidas([])
        setTamanhosMaisVendidos([])
        return
      }

      // ITENS DOS PEDIDOS DE HOJE — sem join com produtos (não existe)
      const { data: itens } = await supabase
        .from('itens_pedido')
        .select('quantidade, cor, tamanho')
        .in('pedido_id', ids)

      let totalPares = 0
      const cores: Record<string, number> = {}
      const tamanhos: Record<string, number> = {}

      ;(itens || []).forEach((item: any) => {
        const qty = Number(item.quantidade || 0)
        totalPares += qty

        if (item.cor) {
          cores[item.cor] = (cores[item.cor] || 0) + qty
        }

        if (item.tamanho) {
          const t = String(item.tamanho)
          tamanhos[t] = (tamanhos[t] || 0) + qty
        }
      })

      setParesHoje(totalPares)

      setCoresMaisVendidas(
        Object.entries(cores)
          .map(([nome, total]) => ({ nome, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5)
      )

      setTamanhosMaisVendidos(
        Object.entries(tamanhos)
          .map(([nome, total]) => ({ nome, total }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 5)
      )
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: '#f5f5f3',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'sans-serif', color: '#888', fontSize: '15px',
      }}>
        Carregando dashboard...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f3', padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111', margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>Visão geral operacional — hoje</p>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '1.5rem' }}>
          {[
            { label: 'Pares hoje', valor: paresHoje },
            { label: 'Pedidos hoje', valor: pedidosHoje },
            { label: 'Clientes hoje', valor: clientesHoje },
            { label: 'Em produção', valor: emProducao },
          ].map((kpi) => (
            <div key={kpi.label} style={{
              backgroundColor: '#eeeee9', borderRadius: '8px', padding: '1rem',
            }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{kpi.label}</div>
              <div style={{ fontSize: '28px', fontWeight: 600, color: '#111' }}>{kpi.valor}</div>
            </div>
          ))}
        </div>

        {/* RANKINGS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>

          {/* CORES */}
          <div style={{ backgroundColor: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '12px', padding: '1.25rem' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#111', marginBottom: '1rem' }}>
              Cores mais pedidas hoje
            </h2>
            {coresMaisVendidas.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#aaa' }}>Nenhum dado hoje</p>
            ) : (
              coresMaisVendidas.map((item) => (
                <div key={item.nome} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)',
                }}>
                  <span style={{ fontSize: '13px', color: '#111' }}>{item.nome}</span>
                  <span style={{
                    fontSize: '12px', fontWeight: 600, padding: '2px 10px',
                    borderRadius: '20px', backgroundColor: '#EBF4FF', color: '#185FA5',
                  }}>{item.total}</span>
                </div>
              ))
            )}
          </div>

          {/* TAMANHOS */}
          <div style={{ backgroundColor: '#fff', border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '12px', padding: '1.25rem' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#111', marginBottom: '1rem' }}>
              Tamanhos mais pedidos hoje
            </h2>
            {tamanhosMaisVendidos.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#aaa' }}>Nenhum dado hoje</p>
            ) : (
              tamanhosMaisVendidos.map((item) => (
                <div key={item.nome} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '0.5px solid rgba(0,0,0,0.06)',
                }}>
                  <span style={{ fontSize: '13px', color: '#111' }}>{item.nome}</span>
                  <span style={{
                    fontSize: '12px', fontWeight: 600, padding: '2px 10px',
                    borderRadius: '20px', backgroundColor: '#EAF3DE', color: '#3B6D11',
                  }}>{item.total}</span>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
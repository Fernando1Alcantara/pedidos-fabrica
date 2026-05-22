'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { formatarData } from '@/lib/data'

export default function PedidoClientePage() {
  const params = useParams()
  const router = useRouter()

  const [pedido, setPedido] = useState<any>(null)
  const [itens, setItens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mobile, setMobile] = useState(false)

  const cores = ['Branco', 'Preto', 'Bege', 'Dourado', 'Rosa', 'Pink']
  const tamanhos = Array.from({ length: 21 }, (_, i) => i + 16)

  useEffect(() => {
    function verificarTela() { setMobile(window.innerWidth < 768) }
    verificarTela()
    window.addEventListener('resize', verificarTela)
    return () => window.removeEventListener('resize', verificarTela)
  }, [])

  useEffect(() => { carregarPedido() }, [])

  async function carregarPedido() {
    try {
      const pedidoId = Array.isArray(params.id) ? params.id[0] : params.id
      const { data: pedidoData } = await supabase
        .from('pedidos').select('*, clientes (nome)').eq('id', pedidoId).single()
      const { data: itensData } = await supabase
        .from('itens_pedido').select('*').eq('pedido_id', pedidoId)
      setPedido(pedidoData)
      setItens(itensData || [])
      setLoading(false)
    } catch (erro) {
      console.error(erro)
      setLoading(false)
    }
  }

  function buscarQuantidade(cor: string, tamanho: number) {
    const item = itens.find((i) => i.cor === cor && i.tamanho === tamanho)
    return item ? item.quantidade : 0
  }

  function totalPorCor(cor: string) {
    return itens.filter((i) => i.cor === cor).reduce((acc, i) => acc + i.quantidade, 0)
  }

  function totalGeral() {
    return itens.reduce((acc, i) => acc + i.quantidade, 0)
  }

  function corStatus(status: string) {
    if (status === 'Finalizado') return { fundo: '#EAF3DE', texto: '#3B6D11' }
    if (status === 'Produção') return { fundo: '#E6F1FB', texto: '#185FA5' }
    return { fundo: '#FAEEDA', texto: '#854F0B' }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#888', fontSize: '15px' }}>
        Carregando pedido...
      </div>
    )
  }

  if (!pedido) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#888', fontSize: '15px' }}>
        Pedido não encontrado.
      </div>
    )
  }

  const statusCor = corStatus(pedido.status)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f3', padding: mobile ? '1rem' : '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* BOTÃO VOLTAR — maior e mais visível */}
        <button
          onClick={() => router.push('/meus-pedidos')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: '#fff',
            border: '0.5px solid rgba(0,0,0,0.15)',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '14px', fontWeight: 500,
            color: '#111', cursor: 'pointer',
            marginBottom: '1.5rem',
          }}
        >
          ← Voltar para Meus Pedidos
        </button>

        {/* HEADER */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111', margin: 0 }}>
              Pedido #{pedido.id.slice(0, 8)}
            </h1>
            <span style={{
              fontSize: '12px', fontWeight: 500, padding: '3px 10px',
              borderRadius: '20px', backgroundColor: statusCor.fundo, color: statusCor.texto,
            }}>
              {pedido.status}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
            {formatarData(pedido.created_at)} · {totalGeral()} pares no total
          </p>
        </div>

        {/* CARD */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.1)', padding: '1.25rem' }}>

          {/* DESKTOP — coluna cor fixada */}
          {!mobile && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #e5e7eb', padding: '10px 14px', backgroundColor: '#111827', color: '#fff', textAlign: 'left', position: 'sticky', left: 0, zIndex: 2, minWidth: '90px' }}>Cor</th>
                    {tamanhos.map((t) => (
                      <th key={t} style={{ border: '1px solid #e5e7eb', padding: '10px 6px', backgroundColor: '#111827', color: '#fff', textAlign: 'center', minWidth: '46px', fontSize: '12px' }}>{t}</th>
                    ))}
                    <th style={{ border: '1px solid #e5e7eb', padding: '10px', backgroundColor: '#3B6D11', color: '#fff', textAlign: 'center', minWidth: '60px', position: 'sticky', right: 0, zIndex: 2 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cores.map((cor, index) => (
                    <tr key={cor} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9fafb' }}>
                      <td style={{ border: '1px solid #e5e7eb', padding: '10px 14px', fontWeight: 500, color: '#111', backgroundColor: index % 2 === 0 ? '#f5f5f3' : '#eeeee9', position: 'sticky', left: 0, zIndex: 1 }}>{cor}</td>
                      {tamanhos.map((tamanho) => {
                        const qty = buscarQuantidade(cor, tamanho)
                        return (
                          <td key={tamanho} style={{ border: '1px solid #e5e7eb', padding: '10px 6px', textAlign: 'center', fontSize: '13px', backgroundColor: qty ? '#EAF3DE' : '#fff', color: qty ? '#3B6D11' : '#ddd', fontWeight: qty ? 600 : 400 }}>
                            {qty || ''}
                          </td>
                        )
                      })}
                      <td style={{ border: '1px solid #e5e7eb', padding: '10px', textAlign: 'center', backgroundColor: '#EAF3DE', color: '#3B6D11', fontWeight: 600, fontSize: '13px', position: 'sticky', right: 0, zIndex: 1 }}>
                        {totalPorCor(cor) || ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* MOBILE — cards por cor */}
          {mobile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cores.map((cor) => {
                const total = totalPorCor(cor)
                const tamanhosComQtd = tamanhos.filter((t) => buscarQuantidade(cor, t) > 0)
                return (
                  <div key={cor} style={{ border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: '#111827', color: '#fff', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 500, fontSize: '14px' }}>{cor}</span>
                      {total > 0 && (
                        <span style={{ backgroundColor: '#3B6D11', color: '#fff', fontSize: '12px', fontWeight: 600, padding: '2px 10px', borderRadius: '20px' }}>
                          {total} pares
                        </span>
                      )}
                    </div>
                    {tamanhosComQtd.length === 0 ? (
                      <div style={{ padding: '10px 14px', fontSize: '12px', color: '#aaa' }}>Sem itens nesta cor</div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))', gap: '6px', padding: '10px' }}>
                        {tamanhosComQtd.map((tamanho) => {
                          const qty = buscarQuantidade(cor, tamanho)
                          return (
                            <div key={tamanho} style={{ backgroundColor: '#EAF3DE', borderRadius: '6px', padding: '6px 4px', textAlign: 'center' }}>
                              <div style={{ fontSize: '11px', color: '#888', marginBottom: '2px' }}>nº {tamanho}</div>
                              <div style={{ fontSize: '16px', fontWeight: 600, color: '#3B6D11' }}>{qty}</div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}

              {totalGeral() > 0 && (
                <div style={{ backgroundColor: '#111827', color: '#fff', padding: '12px 16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>Total geral</span>
                  <span style={{ fontSize: '18px', fontWeight: 600 }}>{totalGeral()} pares</span>
                </div>
              )}
            </div>
          )}

          {/* TOTAL DESKTOP */}
          {!mobile && totalGeral() > 0 && (
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ backgroundColor: '#111827', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '15px', fontWeight: 600 }}>
                Total de pares: {totalGeral()}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
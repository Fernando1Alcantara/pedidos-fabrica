'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { supabase } from '@/lib/supabase'

export default function ProducaoPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [dados, setDados] = useState<any[]>([])
  const [pedidosIds, setPedidosIds] = useState<string[]>([])
  const [periodo, setPeriodo] = useState('Hoje')
  const [mobile, setMobile] = useState(false)

  const hoje = new Date().toISOString().split('T')[0]
  const [dataInicial, setDataInicial] = useState(hoje)
  const [dataFinal, setDataFinal] = useState(hoje)

  const cores = ['Branco', 'Preto', 'Bege', 'Dourado', 'Rosa', 'Pink']
  const tamanhos = Array.from({ length: 21 }, (_, i) => i + 16)

  useEffect(() => {
    function verificarTela() { setMobile(window.innerWidth < 768) }
    verificarTela()
    window.addEventListener('resize', verificarTela)
    return () => window.removeEventListener('resize', verificarTela)
  }, [])

  useEffect(() => { verificarPermissao() }, [])

  async function verificarPermissao() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data } = await supabase.from('clientes').select('tipo').eq('email', user.email).single()
    if (!data || data.tipo !== 'industria') { router.push('/cliente'); return }
    await carregarDados(hoje, hoje)
    setLoading(false)
  }

  async function carregarDados(inicio: string, fim: string) {
    const { data: pedidos } = await supabase
      .from('pedidos').select('id, created_at, consolidado_impresso').eq('consolidado_impresso', false)

    const pedidosFiltrados = (pedidos || []).filter((p: any) => {
      const data = p.created_at?.split('T')[0]
      return data >= inicio && data <= fim
    })

    const ids = pedidosFiltrados.map((p: any) => p.id)
    setPedidosIds(ids)

    if (ids.length === 0) { setDados([]); return }

    const { data: itens } = await supabase.from('itens_pedido').select('*').in('pedido_id', ids)

    const agrupado: any = {}
    ;(itens || []).forEach((item: any) => {
      const chave = `${item.cor}-${item.tamanho}`
      if (!agrupado[chave]) agrupado[chave] = { cor: item.cor, tamanho: item.tamanho, total: 0 }
      agrupado[chave].total += item.quantidade
    })
    setDados(Object.values(agrupado))
  }

  function atualizarPeriodo(novoPeriodo: string) {
    setPeriodo(novoPeriodo)
    const hoje = new Date()
    const inicio = new Date()
    let dataIni = hoje.toISOString().split('T')[0]
    let dataFim = hoje.toISOString().split('T')[0]
    if (novoPeriodo === 'Ontem') { inicio.setDate(hoje.getDate() - 1); dataIni = inicio.toISOString().split('T')[0]; dataFim = dataIni }
    else if (novoPeriodo === '7 Dias') { inicio.setDate(hoje.getDate() - 7); dataIni = inicio.toISOString().split('T')[0] }
    else if (novoPeriodo === '30 Dias') { inicio.setDate(hoje.getDate() - 30); dataIni = inicio.toISOString().split('T')[0] }
    setDataInicial(dataIni); setDataFinal(dataFim)
    carregarDados(dataIni, dataFim)
  }

  function buscarQuantidade(cor: string, tamanho: number) {
    const item = dados.find((d: any) => d.cor === cor && Number(d.tamanho) === tamanho)
    return item ? item.total : 0
  }

  function totalPorCor(cor: string) {
    return dados.filter((i: any) => i.cor === cor).reduce((acc: number, i: any) => acc + i.total, 0)
  }

  function totalGeral() {
    return dados.reduce((acc: number, i: any) => acc + i.total, 0)
  }

  async function gerarPDF() {
    const pdf = new jsPDF('landscape', 'mm', 'a4')

    pdf.setFontSize(16)
    pdf.text('Resumo Geral - Producao', 14, 16)
    pdf.setFontSize(10)
    pdf.text(`Periodo: ${dataInicial} ate ${dataFinal}`, 14, 24)
    pdf.text(`Total de pedidos: ${pedidosIds.length}`, 14, 30)

    const head = [['Cor', ...tamanhos, 'Total']]
    const body = cores.map((cor) => [
      cor,
      ...tamanhos.map((t) => buscarQuantidade(cor, t) || ''),
      totalPorCor(cor) || '',
    ])

    autoTable(pdf, {
      startY: 36,
      head,
      body,
      styles: {
        halign: 'center',
        fontSize: 10,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [17, 24, 39],
        fontSize: 10,
        cellPadding: 2,
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 18 },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index > 0 && data.column.index < tamanhos.length + 1) {
          if (data.cell.raw && data.cell.raw !== '') {
            data.cell.styles.fillColor = [234, 243, 222]
            data.cell.styles.textColor = [59, 109, 17]
            data.cell.styles.fontStyle = 'bold'
          }
        }
        if (data.section === 'body' && data.column.index === tamanhos.length + 1) {
          data.cell.styles.fillColor = [234, 243, 222]
          data.cell.styles.textColor = [59, 109, 17]
          data.cell.styles.fontStyle = 'bold'
        }
        if (data.section === 'head' && data.column.index === tamanhos.length + 1) {
          data.cell.styles.fillColor = [59, 109, 17]
        }
      },
    })

    const finalY = (pdf as any).lastAutoTable?.finalY || 60
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`Total Geral: ${totalGeral()} pares`, 14, finalY + 10)

    pdf.save('consolidado-producao.pdf')

    if (pedidosIds.length > 0) {
      await supabase.from('pedidos').update({ consolidado_impresso: true }).in('id', pedidosIds)
    }
    carregarDados(dataInicial, dataFinal)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#888', fontSize: '15px' }}>
        Carregando...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f3', padding: mobile ? '1rem' : '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <div style={{ marginBottom: '1.5rem' }}>
          <button onClick={() => router.push('/industria')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#185FA5', padding: 0, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            ← Voltar
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111', margin: 0 }}>Consolidado de produção</h1>
          <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>Pedidos ainda não consolidados</p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
          {['Hoje', 'Ontem', '7 Dias', '30 Dias'].map((item) => (
            <button key={item} onClick={() => atualizarPeriodo(item)} style={{ backgroundColor: periodo === item ? '#111827' : '#fff', color: periodo === item ? '#fff' : '#111', border: '0.5px solid rgba(0,0,0,0.2)', padding: '7px 14px', borderRadius: '8px', fontWeight: 500, fontSize: '13px', cursor: 'pointer' }}>
              {item}
            </button>
          ))}
          <input type="date" value={dataInicial} onChange={(e) => { setDataInicial(e.target.value); carregarDados(e.target.value, dataFinal) }} style={{ padding: '7px 10px', border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '13px', color: '#111' }} />
          <input type="date" value={dataFinal} onChange={(e) => { setDataFinal(e.target.value); carregarDados(dataInicial, e.target.value) }} style={{ padding: '7px 10px', border: '0.5px solid rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '13px', color: '#111' }} />
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.1)', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button onClick={gerarPDF} style={{ backgroundColor: '#111827', color: '#fff', border: 'none', padding: '9px 20px', borderRadius: '8px', fontWeight: 500, fontSize: '13px', cursor: 'pointer' }}>
              Gerar PDF consolidado
            </button>
            {dados.length === 0 && <span style={{ fontSize: '13px', color: '#888' }}>Nenhum pedido pendente no período</span>}
            {dados.length > 0 && <span style={{ fontSize: '13px', color: '#3B6D11', fontWeight: 500 }}>Total geral: {totalGeral()} pares</span>}
          </div>

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

          {mobile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cores.map((cor) => {
                const total = totalPorCor(cor)
                const tamanhosComQtd = tamanhos.filter((t) => buscarQuantidade(cor, t) > 0)
                return (
                  <div key={cor} style={{ border: '0.5px solid rgba(0,0,0,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{ backgroundColor: '#111827', color: '#fff', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 500, fontSize: '14px' }}>{cor}</span>
                      {total > 0 && <span style={{ backgroundColor: '#3B6D11', color: '#fff', fontSize: '12px', fontWeight: 600, padding: '2px 10px', borderRadius: '20px' }}>{total} pares</span>}
                    </div>
                    {tamanhosComQtd.length === 0 ? (
                      <div style={{ padding: '10px 14px', fontSize: '12px', color: '#aaa' }}>Sem pedidos neste período</div>
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
        </div>
      </div>
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'

import jsPDF from 'jspdf'

import autoTable from 'jspdf-autotable'

import { supabase } from '@/lib/supabase'

export default function ProducaoPage() {

  const [dados, setDados] =
    useState<any[]>([])

  const [pedidosIds, setPedidosIds] =
    useState<string[]>([])

  const [periodo, setPeriodo] =
    useState('Hoje')

  const hoje = new Date()

  const dataHoje =
    hoje.toISOString().split('T')[0]

  const [dataInicial, setDataInicial] =
    useState(dataHoje)

  const [dataFinal, setDataFinal] =
    useState(dataHoje)

  const cores = [
    'Branco',
    'Preto',
    'Bege',
    'Dourado',
    'Rosa',
    'Pink'
  ]

  const tamanhos = Array.from(
    { length: 21 },
    (_, i) => i + 16
  )

  useEffect(() => {

    atualizarPeriodo(periodo)

  }, [])

  useEffect(() => {

    carregarDados()

  }, [
    dataInicial,
    dataFinal
  ])

  function atualizarPeriodo(
    novoPeriodo: string
  ) {

    setPeriodo(novoPeriodo)

    const hoje =
      new Date()

    const inicio =
      new Date()

    if (novoPeriodo === 'Hoje') {

      const hojeTexto =
        hoje
          .toISOString()
          .split('T')[0]

      setDataInicial(
        hojeTexto
      )

      setDataFinal(
        hojeTexto
      )

    }

    if (novoPeriodo === 'Ontem') {

      inicio.setDate(
        hoje.getDate() - 1
      )

      const data =
        inicio
          .toISOString()
          .split('T')[0]

      setDataInicial(data)

      setDataFinal(data)

    }

    if (
      novoPeriodo ===
      '7 Dias'
    ) {

      inicio.setDate(
        hoje.getDate() - 7
      )

      setDataInicial(

        inicio
          .toISOString()
          .split('T')[0]

      )

      setDataFinal(

        hoje
          .toISOString()
          .split('T')[0]

      )

    }

    if (
      novoPeriodo ===
      '30 Dias'
    ) {

      inicio.setDate(
        hoje.getDate() - 30
      )

      setDataInicial(

        inicio
          .toISOString()
          .split('T')[0]

      )

      setDataFinal(

        hoje
          .toISOString()
          .split('T')[0]

      )

    }

  }

  async function carregarDados() {

    const { data: pedidos } =

      await supabase
        .from('pedidos')
        .select(`
          id,
          created_at,
          consolidado_impresso
        `)

        .eq(
          'consolidado_impresso',
          false
        )

    const pedidosFiltrados =
      (pedidos || []).filter(
        (pedido: any) => {

          const dataPedido =
            pedido.created_at
              ?.split('T')[0]

          return (

            dataPedido >=
              dataInicial &&

            dataPedido <=
              dataFinal

          )

        }
      )

    const ids =
      pedidosFiltrados.map(
        (pedido: any) =>
          pedido.id
      )

    setPedidosIds(ids)

    if (ids.length === 0) {

      setDados([])

      return

    }

    const { data: itens } =

      await supabase
        .from('itens_pedido')
        .select('*')

        .in(
          'pedido_id',
          ids
        )

    const agrupado: any = {}

    ;(itens || []).forEach(
      (item: any) => {

        const chave =

          `${item.cor}-${item.tamanho}`

        if (!agrupado[chave]) {

          agrupado[chave] = {

            cor:
              item.cor,

            tamanho:
              item.tamanho,

            total: 0

          }

        }

        agrupado[chave].total +=
          item.quantidade

      }
    )

    setDados(
      Object.values(agrupado)
    )

  }

  function buscarQuantidade(
    cor: string,
    tamanho: number
  ) {

    const item =
      dados.find(

        (d: any) =>

          d.cor === cor &&

          Number(d.tamanho)
            === tamanho

      )

    return item
      ? item.total
      : ''

  }

  function totalPorCor(
    cor: string
  ) {

    return dados

      .filter(
        (item: any) =>
          item.cor === cor
      )

      .reduce(

        (
          acc: number,
          item: any
        ) =>

          acc + item.total,

        0

      )

  }

  function totalGeral() {

    return dados.reduce(

      (
        acc: number,
        item: any
      ) =>

        acc + item.total,

      0

    )

  }

  async function gerarPDF() {

    const pdf = new jsPDF(
      'landscape',
      'mm',
      'a4'
    )

    pdf.setFontSize(20)

    pdf.text(
      'Resumo Geral Produção',
      14,
      18
    )

    pdf.setFontSize(11)

    pdf.text(

      `Período: ${dataInicial} até ${dataFinal}`,

      14,

      28

    )

    const head = [
      [
        'Cor',
        ...tamanhos,
        'Total'
      ]
    ]

    const body = cores.map(
      (cor) => [

        cor,

        ...tamanhos.map(
          (tamanho) =>

            buscarQuantidade(
              cor,
              tamanho
            )
        ),

        totalPorCor(cor)

      ]
    )

    autoTable(pdf, {

      startY: 36,

      head,

      body,

      styles: {

        halign: 'center',

        fontSize: 8

      },

      headStyles: {

        fillColor: [17, 24, 39]

      }

    })

    const finalY =
      (pdf as any)
        .lastAutoTable
        ?.finalY || 60

    pdf.setFontSize(15)

    pdf.text(

      `Total Geral: ${totalGeral()} pares`,

      14,

      finalY + 12

    )

    pdf.save(
      'consolidado-producao.pdf'
    )

    if (
      pedidosIds.length > 0
    ) {

      await supabase
        .from('pedidos')
        .update({

          consolidado_impresso:
            true

        })

        .in(
          'id',
          pedidosIds
        )

    }

    carregarDados()

  }

  return (

    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        padding: '40px'
      }}
    >

      {/* TOPO */}

      <div
        style={{
          marginBottom: '30px'
        }}
      >

        <h1
          style={{
            fontSize: '48px',
            fontWeight: '800',
            color: '#111827'
          }}
        >
          Consolidado Produção
        </h1>

      </div>

      {/* FILTROS */}

      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '30px'
        }}
      >

        {[
          'Hoje',
          'Ontem',
          '7 Dias',
          '30 Dias'
        ].map((item) => (

          <button
            key={item}
            onClick={() =>
              atualizarPeriodo(item)
            }
            style={{
              backgroundColor:

                periodo === item
                  ? '#111827'
                  : '#f3f4f6',

              color:

                periodo === item
                  ? '#ffffff'
                  : '#111827',

              border: 'none',

              padding:
                '12px 20px',

              borderRadius: '12px',

              fontWeight: '700',

              cursor: 'pointer'
            }}
          >
            {item}
          </button>

        ))}

        <input
          type="date"
          value={dataInicial}
          onChange={(e) =>
            setDataInicial(
              e.target.value
            )
          }
          style={{
            padding: '12px',
            border:
              '1px solid #d1d5db',
            borderRadius: '12px'
          }}
        />

        <input
          type="date"
          value={dataFinal}
          onChange={(e) =>
            setDataFinal(
              e.target.value
            )
          }
          style={{
            padding: '12px',
            border:
              '1px solid #d1d5db',
            borderRadius: '12px'
          }}
        />

      </div>

      {/* CARD */}

      <div
        style={{
          backgroundColor: '#f9fafb',
          borderRadius: '24px',
          padding: '30px',
          boxShadow:
            '0 10px 30px rgba(0,0,0,0.05)'
        }}
      >

        {/* BOTÃO */}

        <div
          style={{
            marginBottom: '30px'
          }}
        >

          <button
            onClick={gerarPDF}
            style={{
              backgroundColor:
                '#111827',

              color: '#ffffff',

              border: 'none',

              padding:
                '14px 24px',

              borderRadius: '14px',

              fontWeight: '700',

              cursor: 'pointer'
            }}
          >
            Gerar PDF Consolidado
          </button>

        </div>

        {/* TABELA */}

        <div
          style={{
            overflowX: 'auto'
          }}
        >

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor:
                '#ffffff'
            }}
          >

            <thead>

              <tr>

                <th
                  style={{
                    border:
                      '1px solid #d1d5db',

                    padding: '12px',

                    backgroundColor:
                      '#0f172a',

                    color: '#ffffff'
                  }}
                >
                  Cor
                </th>

                {tamanhos.map(
                  (tamanho) => (

                    <th
                      key={tamanho}
                      style={{
                        border:
                          '1px solid #d1d5db',

                        padding:
                          '12px',

                        backgroundColor:
                          '#0f172a',

                        color:
                          '#ffffff'
                      }}
                    >
                      {tamanho}
                    </th>

                  )
                )}

                <th
                  style={{
                    border:
                      '1px solid #d1d5db',

                    padding: '12px',

                    backgroundColor:
                      '#16a34a',

                    color: '#ffffff'
                  }}
                >
                  Total
                </th>

              </tr>

            </thead>

            <tbody>

              {cores.map(
                (cor, index) => (

                  <tr
                    key={cor}
                    style={{
                      backgroundColor:

                        index % 2 === 0
                          ? '#ffffff'
                          : '#f8fafc'
                    }}
                  >

                    <td
                      style={{
                        border:
                          '1px solid #d1d5db',

                        padding:
                          '12px',

                        fontWeight:
                          '700',

                        color:
                          '#111827',

                        backgroundColor:
                          '#f1f5f9'
                      }}
                    >
                      {cor}
                    </td>

                    {tamanhos.map(
                      (tamanho) => {

                        const quantidade =

                          buscarQuantidade(
                            cor,
                            tamanho
                          )

                        return (

                          <td
                            key={tamanho}
                            style={{
                              border:
                                '1px solid #d1d5db',

                              padding:
                                '12px',

                              textAlign:
                                'center',

                              backgroundColor:

                                quantidade
                                  ? '#86efac'
                                  : '#ffffff',

                              color:

                                quantidade
                                  ? '#052e16'
                                  : '#9ca3af',

                              fontWeight:

                                quantidade
                                  ? '700'
                                  : '400'
                            }}
                          >
                            {quantidade}
                          </td>

                        )

                      }
                    )}

                    <td
                      style={{
                        border:
                          '1px solid #d1d5db',

                        padding:
                          '12px',

                        textAlign:
                          'center',

                        backgroundColor:
                          '#22c55e',

                        fontWeight:
                          '800',

                        color:
                          '#ffffff'
                      }}
                    >
                      {totalPorCor(cor)}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

        {/* TOTAL */}

        <div
          style={{
            marginTop: '24px',
            display: 'flex',
            justifyContent:
              'flex-end'
          }}
        >

          <div
            style={{
              backgroundColor:
                '#0f172a',

              color: '#ffffff',

              padding:
                '16px 24px',

              borderRadius:
                '16px',

              fontSize: '20px',

              fontWeight: '800'
            }}
          >
            Total Geral:
            {' '}
            {totalGeral()}
            {' '}
            pares
          </div>

        </div>

      </div>

    </div>

  )

}
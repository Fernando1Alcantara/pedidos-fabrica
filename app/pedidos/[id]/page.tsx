'use client'

import { useEffect, useState } from 'react'

import { useParams } from 'next/navigation'

import jsPDF from 'jspdf'

import autoTable from 'jspdf-autotable'

import { supabase } from '@/lib/supabase'

import { formatarData } from '@/lib/data'

export default function PedidoIndustriaPage() {

  const params = useParams()

  const [pedido, setPedido] =
    useState<any>(null)

  const [itens, setItens] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(true)

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

    carregarPedido()

  }, [])

  async function carregarPedido() {

    try {

      const pedidoId =

        Array.isArray(params.id)
          ? params.id[0]
          : params.id

      // PEDIDO

      const { data: pedidoData } =

        await supabase
          .from('pedidos')
          .select(`
            *,
            clientes (
              nome
            )
          `)

          .eq(
            'id',
            pedidoId
          )

          .single()

      // ITENS

      const { data: itensData } =

        await supabase
          .from('itens_pedido')
          .select('*')

          .eq(
            'pedido_id',
            pedidoId
          )

      setPedido(pedidoData)

      setItens(itensData || [])

      setLoading(false)

    }

    catch (erro) {

      console.log(erro)

      setLoading(false)

    }

  }

  function buscarQuantidade(
    cor: string,
    tamanho: number
  ) {

    const item =
      itens.find(

        (i) =>
          i.cor === cor &&
          i.tamanho === tamanho

      )

    return item
      ? item.quantidade
      : ''

  }

  function totalPorCor(
    cor: string
  ) {

    return itens

      .filter(
        (item) =>
          item.cor === cor
      )

      .reduce(

        (acc, item) =>

          acc + item.quantidade,

        0

      )

  }

  function totalGeral() {

    return itens.reduce(

      (acc, item) =>

        acc + item.quantidade,

      0

    )

  }

  async function alterarStatus(
    novoStatus: string
  ) {

    await supabase
      .from('pedidos')
      .update({

        status: novoStatus

      })

      .eq(
        'id',
        pedido.id
      )

    setPedido({

      ...pedido,

      status: novoStatus

    })

  }

  async function gerarPDF() {

    const pdf = new jsPDF(
      'landscape',
      'mm',
      'a4'
    )

    pdf.setFontSize(22)

    pdf.text(
      'Pedido de Sapatilhas',
      14,
      18
    )

    pdf.setFontSize(12)

    pdf.text(
      `Cliente: ${pedido.clientes?.nome}`,
      14,
      28
    )

    pdf.text(
      `Data: ${formatarData(
        pedido.created_at
      )}`,
      14,
      35
    )

    const head = [
      [
        'Cor',
        ...tamanhos,
        'Total'
      ]
    ]

    const body = cores.map((cor) => [

      cor,

      ...tamanhos.map((tamanho) =>

        buscarQuantidade(
          cor,
          tamanho
        )

      ),

      totalPorCor(cor)

    ])

    autoTable(pdf, {

      startY: 45,

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

    pdf.setFontSize(16)

    pdf.text(

      `Total de Pares: ${totalGeral()}`,

      14,

      finalY + 12

    )

    // BAIXAR PDF

    pdf.save(
      `pedido-${pedido.id}.pdf`
    )

    // ALTERAR STATUS

    await supabase
      .from('pedidos')
      .update({

        status: 'Impresso'

      })

      .eq(
        'id',
        pedido.id
      )

    // ATUALIZAR TELA

    setPedido({

      ...pedido,

      status: 'Impresso'

    })

  }

  if (loading) {

    return (

      <div
        style={{
          padding: '40px'
        }}
      >
        Carregando pedido...
      </div>

    )

  }

  if (!pedido) {

    return (

      <div
        style={{
          padding: '40px'
        }}
      >
        Pedido não encontrado
      </div>

    )

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
          Pedido
        </h1>

        <p
          style={{
            marginTop: '10px',
            color: '#6b7280'
          }}
        >
          #{pedido.id.slice(0, 8)}
        </p>

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

        {/* CLIENTE */}

        <div
          style={{
            marginBottom: '30px'
          }}
        >

          <p
            style={{
              color: '#6b7280'
            }}
          >
            Cliente
          </p>

          <h2
            style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#111827'
            }}
          >
            {pedido.clientes?.nome}
          </h2>

          <p
            style={{
              marginTop: '10px',
              color: '#6b7280'
            }}
          >
            {formatarData(
              pedido.created_at
            )}
          </p>

        </div>

        {/* BOTÕES */}

        <div
          style={{
            display: 'flex',
            gap: '14px',
            marginBottom: '30px',
            flexWrap: 'wrap'
          }}
        >

          <button
            onClick={gerarPDF}
            style={{
              backgroundColor:
                '#111827',

              color: '#fff',

              border: 'none',

              padding:
                '12px 22px',

              borderRadius: '12px',

              fontWeight: '700',

              cursor: 'pointer'
            }}
          >
            Gerar PDF
          </button>

          <button
            onClick={() =>
              alterarStatus(
                'Finalizado'
              )
            }
            style={{
              backgroundColor:
                '#16a34a',

              color: '#fff',

              border: 'none',

              padding:
                '12px 22px',

              borderRadius: '12px',

              fontWeight: '700',

              cursor: 'pointer'
            }}
          >
            Finalizar Pedido
          </button>

        </div>

        {/* STATUS */}

        <div
          style={{
            marginBottom: '30px'
          }}
        >

          <span
            style={{
              backgroundColor:
                pedido.status ===
                'Finalizado'
                  ? '#dcfce7'
                  : pedido.status ===
                    'Impresso'
                  ? '#dbeafe'
                  : '#fef3c7',

              color:
                pedido.status ===
                'Finalizado'
                  ? '#166534'
                  : pedido.status ===
                    'Impresso'
                  ? '#1d4ed8'
                  : '#92400e',

              padding:
                '12px 20px',

              borderRadius:
                '999px',

              fontWeight: '700'
            }}
          >
            {pedido.status}
          </span>

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
              backgroundColor: '#ffffff'
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
                      '#111827',

                    color: '#ffffff',

                    minWidth: '120px'
                  }}
                >
                  Cor
                </th>

                {tamanhos.map((tamanho) => (

                  <th
                    key={tamanho}
                    style={{
                      border:
                        '1px solid #d1d5db',

                      padding: '12px',

                      backgroundColor:
                        '#111827',

                      color: '#ffffff',

                      minWidth: '60px'
                    }}
                  >
                    {tamanho}
                  </th>

                ))}

                <th
                  style={{
                    border:
                      '1px solid #d1d5db',

                    padding: '12px',

                    backgroundColor:
                      '#16a34a',

                    color: '#ffffff',

                    minWidth: '90px'
                  }}
                >
                  Total
                </th>

              </tr>

            </thead>

            <tbody>

              {cores.map((cor, index) => (

                <tr
                  key={cor}
                  style={{
                    backgroundColor:
                      index % 2 === 0
                        ? '#ffffff'
                        : '#f9fafb'
                  }}
                >

                  <td
                    style={{
                      border:
                        '1px solid #d1d5db',

                      padding: '12px',

                      fontWeight: '700',

                      color: '#111827',

                      backgroundColor:
                        '#f3f4f6'
                    }}
                  >
                    {cor}
                  </td>

                  {tamanhos.map((tamanho) => {

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

                          padding: '12px',

                          textAlign: 'center',

                          fontWeight:
                            quantidade
                              ? '700'
                              : '400',

                          color:
                            quantidade
                              ? '#111827'
                              : '#9ca3af',

                          backgroundColor:
                            quantidade
                              ? '#dcfce7'
                              : 'transparent'
                        }}
                      >
                        {quantidade}
                      </td>

                    )

                  })}

                  <td
                    style={{
                      border:
                        '1px solid #d1d5db',

                      padding: '12px',

                      textAlign: 'center',

                      fontWeight: '800',

                      backgroundColor:
                        '#dcfce7',

                      color: '#166534'
                    }}
                  >
                    {totalPorCor(cor)}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* TOTAL GERAL */}

        <div
          style={{
            marginTop: '24px',

            display: 'flex',

            justifyContent: 'flex-end'
          }}
        >

          <div
            style={{
              backgroundColor:
                '#111827',

              color: '#ffffff',

              padding:
                '16px 24px',

              borderRadius: '16px',

              fontSize: '20px',

              fontWeight: '800'
            }}
          >
            Total de Pares:
            {' '}
            {totalGeral()}
          </div>

        </div>

      </div>

    </div>

  )

}
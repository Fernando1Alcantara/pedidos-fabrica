'use client'

import { useEffect, useState } from 'react'

import { useParams } from 'next/navigation'

import { supabase } from '@/lib/supabase'

import { formatarData } from '@/lib/data'

export default function PedidoClientePage() {

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

  if (loading) {

    return (

      <div
        style={{
          padding: '40px',
          fontSize: '22px'
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
          padding: '40px',
          fontSize: '22px'
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
        backgroundColor: '#f3f4f6',
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
            color: '#000'
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
          backgroundColor: '#ffffff',
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

        {/* STATUS */}

        <div
          style={{
            marginBottom: '30px'
          }}
        >

          <span
            style={{
              backgroundColor: '#fef3c7',
              color: '#92400e',
              padding: '12px 20px',
              borderRadius: '999px',
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

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  )

}
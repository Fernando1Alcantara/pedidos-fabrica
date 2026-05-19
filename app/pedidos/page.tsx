'use client'

import Link from 'next/link'

import {
  useEffect,
  useState
} from 'react'

import { useRouter }
from 'next/navigation'

import { supabase }
from '@/lib/supabase'

export default function PedidosPage() {

  const router =
    useRouter()

  const [pedidos, setPedidos] =
    useState<any[]>([])

  const [clienteFiltro, setClienteFiltro] =
    useState('Todos')

  const [statusFiltro, setStatusFiltro] =
    useState('Todos')

  const [periodoFiltro, setPeriodoFiltro] =
    useState('Últimos 30 dias')

  useEffect(() => {

    verificarPermissao()

  }, [])

  async function verificarPermissao() {

    const {

      data: { user }

    } = await supabase.auth
      .getUser()

    // NÃO LOGADO

    if (!user) {

      router.push('/login')

      return

    }

    // BUSCA USUÁRIO

    const { data }
      = await supabase

        .from('clientes')

        .select('tipo')

        .eq(
          'email',
          user.email
        )

        .single()

    // NÃO É INDÚSTRIA

    if (

      !data ||

      data.tipo !==
        'industria'

    ) {

      router.push('/cliente')

      return

    }

    carregarPedidos()

  }

  async function carregarPedidos() {

    const { data } = await supabase

      .from('pedidos')

      .select(`
        *,
        clientes (
          nome
        ),
        itens_pedido (
          quantidade
        )
      `)

      .order(
        'created_at',
        { ascending: false }
      )

    if (!data) return

    setPedidos(data)

  }

  function pedidosFiltrados() {

    let resultado = [...pedidos]

    // CLIENTE

    if (
      clienteFiltro !== 'Todos'
    ) {

      resultado = resultado.filter(
        (pedido) =>

          pedido.clientes?.nome ===
          clienteFiltro
      )

    }

    // STATUS

    if (
      statusFiltro !== 'Todos'
    ) {

      resultado = resultado.filter(
        (pedido) =>

          pedido.status ===
          statusFiltro
      )

    }

    // PERÍODO

    const hoje = new Date()

    resultado = resultado.filter(
      (pedido) => {

        const dataPedido =
          new Date(
            pedido.created_at
          )

        const diffDias =

          (
            hoje.getTime() -
            dataPedido.getTime()
          ) /

          (1000 * 60 * 60 * 24)

        if (
          periodoFiltro ===
          'Hoje'
        ) {

          return diffDias < 1

        }

        if (
          periodoFiltro ===
          'Últimos 7 dias'
        ) {

          return diffDias <= 7

        }

        if (
          periodoFiltro ===
          'Últimos 30 dias'
        ) {

          return diffDias <= 30

        }

        return true

      }
    )

    return resultado

  }

  function totalStatus(
    status: string
  ) {

    return pedidosFiltrados()

      .filter(
        (pedido) =>
          pedido.status === status
      )

      .length

  }

  function totalPares(
    pedido: any
  ) {

    return (
      pedido.itens_pedido || []
    ).reduce(

      (
        acc: number,
        item: any
      ) =>

        acc + item.quantidade,

      0

    )

  }

  function corStatus(
    status: string
  ) {

    if (
      status === 'Recebido'
    ) {

      return {
        fundo: '#fef3c7',
        texto: '#92400e'
      }

    }

    if (
      status === 'Impresso'
    ) {

      return {
        fundo: '#dbeafe',
        texto: '#1d4ed8'
      }

    }

    return {

      fundo: '#dcfce7',
      texto: '#166534'

    }

  }

  return (

    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        padding: '40px'
      }}
    >

      {/* TÍTULO */}

      <div
        style={{
          marginBottom: '40px'
        }}
      >

        <h1
          style={{
            fontSize: '64px',
            fontWeight: '900',
            color: '#0f172a',
            marginBottom: '10px'
          }}
        >
          Pedidos Recebidos
        </h1>

        <p
          style={{
            color: '#64748b',
            fontSize: '22px'
          }}
        >
          Gestão de pedidos da fábrica
        </p>

      </div>

      {/* FILTROS */}

      <div
        style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}
      >

        {/* CLIENTE */}

        <select

          value={clienteFiltro}

          onChange={(e) =>
            setClienteFiltro(
              e.target.value
            )
          }

          style={{
            padding:
              '14px 20px',

            borderRadius:
              '16px',

            border:
              '1px solid #cbd5e1',

            backgroundColor:
              '#ffffff',

            fontSize: '16px',

            fontWeight: '600',

            color: '#0f172a',

            minWidth: '170px'
          }}
        >

          <option>
            Todos
          </option>

          {[...new Set(

            pedidos.map(
              (pedido) =>
                pedido.clientes?.nome
            )

          )].map((nome) => (

            <option
              key={nome}
            >
              {nome}
            </option>

          ))}

        </select>

        {/* STATUS */}

        <select

          value={statusFiltro}

          onChange={(e) =>
            setStatusFiltro(
              e.target.value
            )
          }

          style={{
            padding:
              '14px 20px',

            borderRadius:
              '16px',

            border:
              '1px solid #cbd5e1',

            backgroundColor:
              '#ffffff',

            fontSize: '16px',

            fontWeight: '600',

            color: '#0f172a',

            minWidth: '170px'
          }}
        >

          <option>
            Todos
          </option>

          <option>
            Recebido
          </option>

          <option>
            Impresso
          </option>

          <option>
            Finalizado
          </option>

        </select>

        {/* PERÍODO */}

        <select

          value={periodoFiltro}

          onChange={(e) =>
            setPeriodoFiltro(
              e.target.value
            )
          }

          style={{
            padding:
              '14px 20px',

            borderRadius:
              '16px',

            border:
              '1px solid #cbd5e1',

            backgroundColor:
              '#ffffff',

            fontSize: '16px',

            fontWeight: '600',

            color: '#0f172a',

            minWidth: '220px'
          }}
        >

          <option>
            Hoje
          </option>

          <option>
            Últimos 7 dias
          </option>

          <option>
            Últimos 30 dias
          </option>

        </select>

      </div>

      {/* CARDS STATUS */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(300px, 1fr))',

          gap: '20px',

          marginBottom: '40px'
        }}
      >

        {/* RECEBIDOS */}

        <div
          style={{
            backgroundColor:
              '#ffffff',

            padding: '30px',

            borderRadius:
              '24px',

            border:
              '1px solid #e2e8f0'
          }}
        >

          <p
            style={{
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '20px'
            }}
          >
            📩 Recebidos
          </p>

          <h2
            style={{
              fontSize: '60px',
              fontWeight: '900',
              color: '#0f172a'
            }}
          >
            {totalStatus(
              'Recebido'
            )}
          </h2>

        </div>

        {/* IMPRESSOS */}

        <div
          style={{
            backgroundColor:
              '#ffffff',

            padding: '30px',

            borderRadius:
              '24px',

            border:
              '1px solid #e2e8f0'
          }}
        >

          <p
            style={{
              fontWeight: '700',
              color: '#0f172a',
              marginBottom: '20px'
            }}
          >
            🖨️ Impressos
          </p>

          <h2
            style={{
              fontSize: '60px',
              fontWeight: '900',
              color: '#0f172a'
            }}
          >
            {totalStatus(
              'Impresso'
            )}
          </h2>

        </div>

      </div>

      {/* LISTA */}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >

        {pedidosFiltrados().map(
          (pedido) => {

            const statusCor =
              corStatus(
                pedido.status
              )

            return (

              <div
                key={pedido.id}
                style={{
                  backgroundColor:
                    '#ffffff',

                  borderRadius:
                    '24px',

                  padding: '24px',

                  border:
                    '1px solid #e2e8f0',

                  display: 'flex',

                  justifyContent:
                    'space-between',

                  alignItems:
                    'center',

                  boxShadow:
                    '0 4px 20px rgba(0,0,0,0.04)'
                }}
              >

                {/* ESQUERDA */}

                <div>

                  <p
                    style={{
                      color:
                        '#64748b',

                      marginBottom:
                        '10px'
                    }}
                  >
                    Cliente
                  </p>

                  <h2
                    style={{
                      fontSize:
                        '28px',

                      fontWeight:
                        '800',

                      color:
                        '#0f172a',

                      marginBottom:
                        '12px'
                    }}
                  >
                    {
                      pedido.clientes
                        ?.nome
                    }
                  </h2>

                  <p
                    style={{
                      color:
                        '#64748b',

                      marginBottom:
                        '10px'
                    }}
                  >
                    {new Date(
                      pedido.created_at
                    ).toLocaleString(
                      'pt-BR',
                      {
                        timeZone:
                          'America/Sao_Paulo'
                      }
                    )}
                  </p>

                  {/* TOTAL PARES */}

                  <p
                    style={{
                      fontSize:
                        '18px',

                      fontWeight:
                        '700',

                      color:
                        '#111827'
                    }}
                  >
                    {totalPares(
                      pedido
                    )}
                    {' '}
                    pares
                  </p>

                </div>

                {/* DIREITA */}

                <div
                  style={{
                    display: 'flex',
                    alignItems:
                      'center',

                    gap: '20px'
                  }}
                >

                  {/* STATUS */}

                  <div
                    style={{
                      backgroundColor:
                        statusCor.fundo,

                      color:
                        statusCor.texto,

                      padding:
                        '12px 20px',

                      borderRadius:
                        '999px',

                      fontWeight:
                        '700'
                    }}
                  >
                    {pedido.status}
                  </div>

                  {/* BOTÃO */}

                  <Link
                    href={`/pedidos/${pedido.id}`}
                  >

                    <button
                      style={{
                        backgroundColor:
                          '#2563eb',

                        color:
                          '#ffffff',

                        border:
                          'none',

                        padding:
                          '14px 24px',

                        borderRadius:
                          '16px',

                        fontWeight:
                          '700',

                        cursor:
                          'pointer'
                      }}
                    >
                      Abrir Pedido
                    </button>

                  </Link>

                </div>

              </div>

            )

          }
        )}

      </div>

    </div>

  )

}
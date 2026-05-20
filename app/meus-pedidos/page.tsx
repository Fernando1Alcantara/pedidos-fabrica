'use client'

import {
  useEffect,
  useState
} from 'react'

import Link from 'next/link'

import {
  useRouter
} from 'next/navigation'

import {
  supabase
} from '@/lib/supabase'

import {
  formatarData
} from '@/lib/data'

export default function MeusPedidosPage() {

  const router = useRouter()

  const [pedidos, setPedidos] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(true)

  const [mobile, setMobile] =
    useState(false)

  useEffect(() => {

    carregarPedidos()

    function verificarTela() {

      setMobile(
        window.innerWidth < 768
      )

    }

    verificarTela()

    window.addEventListener(
      'resize',
      verificarTela
    )

    return () =>
      window.removeEventListener(
        'resize',
        verificarTela
      )

  }, [])

  async function carregarPedidos() {

    const {
      data: { user }
    } =

      await supabase.auth
        .getUser()

    if (!user) {

      router.push('/login')

      return

    }

    const { data: cliente } =

      await supabase
        .from('clientes')
        .select('*')

        .eq(
          'email',
          user.email?.toLowerCase()
        )

        .single()

    if (!cliente) {

      alert(
        'Cliente não encontrado'
      )

      setLoading(false)

      return

    }

    const { data, error } =

      await supabase
        .from('pedidos')

        .select(`
          *,
          itens_pedido (
            quantidade
          )
        `)

        .eq(
          'cliente_id',
          cliente.id
        )

        .order(
          'created_at',
          { ascending: false }
        )

    if (error) {

      console.log(error)

      setLoading(false)

      return

    }

    setPedidos(data || [])

    setLoading(false)

  }

  function statusConfig(
    status: string
  ) {

    if (status === 'Recebido') {

      return {

        fundo:
          '#fef3c7',

        texto:
          '#92400e',

        borda:
          '#fde68a'

      }

    }

    if (status === 'Produção') {

      return {

        fundo:
          '#dbeafe',

        texto:
          '#1d4ed8',

        borda:
          '#93c5fd'

      }

    }

    return {

      fundo:
        '#dcfce7',

      texto:
        '#166534',

      borda:
        '#86efac'

    }

  }

  function totalPares(
    pedido: any
  ) {

    return (
      pedido.itens_pedido || []
    )

      .reduce(

        (
          total: number,
          item: any
        ) =>

          total +
          Number(
            item.quantidade || 0
          ),

        0
      )

  }

  if (loading) {

    return (

      <div
        style={{
          minHeight: '100vh',
          backgroundColor:
            '#f3f4f6',

          display: 'flex',

          justifyContent:
            'center',

          alignItems:
            'center',

          fontSize: '22px',

          color: '#6b7280'
        }}
      >

        Carregando pedidos...

      </div>

    )

  }

  return (

    <div
      style={{
        minHeight: '100vh',

        backgroundColor:
          '#f3f4f6',

        padding:
          mobile
            ? '20px'
            : '40px'
      }}
    >

      {/* TOPO */}

      <div
        style={{
          marginBottom:
            mobile
              ? '28px'
              : '40px'
        }}
      >

        {/* BOTÃO VOLTAR */}

        <button

          onClick={() =>
            router.push('/cliente')
          }

          style={{

            backgroundColor:
              'transparent',

            border: 'none',

            color: '#111827',

            fontSize:
              mobile
                ? '15px'
                : '16px',

            fontWeight: '700',

            cursor: 'pointer',

            marginBottom: '18px',

            padding: 0
          }}
        >

          ← Voltar para Home

        </button>

        <h1
          style={{
            fontSize:
              mobile
                ? '42px'
                : '52px',

            fontWeight: '800',

            color: '#111827',

            marginBottom: '10px'
          }}
        >

          Meus Pedidos

        </h1>

        <p
          style={{
            color: '#6b7280',

            fontSize:
              mobile
                ? '16px'
                : '18px'
          }}
        >

          Acompanhe seus pedidos em tempo real

        </p>

      </div>

      {/* SEM PEDIDOS */}

      {pedidos.length === 0 && (

        <div
          style={{
            backgroundColor:
              '#ffffff',

            borderRadius:
              '24px',

            padding:
              mobile
                ? '30px'
                : '40px',

            textAlign:
              'center',

            color:
              '#6b7280',

            fontSize:
              mobile
                ? '18px'
                : '20px',

            border:
              '1px solid #e5e7eb'
          }}
        >

          Nenhum pedido encontrado

        </div>

      )}

      {/* LISTA */}

      <div
        style={{
          display: 'flex',

          flexDirection:
            'column',

          gap:
            mobile
              ? '18px'
              : '22px'
        }}
      >

        {pedidos.map((pedido) => {

          const status =
            statusConfig(
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

                padding:
                  mobile
                    ? '22px'
                    : '28px',

                border:
                  '1px solid #e5e7eb',

                boxShadow:
                  '0 4px 16px rgba(0,0,0,0.04)',

                transition:
                  '0.2s'
              }}
            >

              {/* TOPO CARD */}

              <div
                style={{

                  display: 'flex',

                  justifyContent:
                    'space-between',

                  alignItems:
                    mobile
                      ? 'flex-start'
                      : 'center',

                  flexDirection:
                    mobile
                      ? 'column'
                      : 'row',

                  gap:
                    mobile
                      ? '18px'
                      : '12px'
                }}
              >

                {/* ESQUERDA */}

                <div>

                  <p
                    style={{
                      color:
                        '#6b7280',

                      fontSize:
                        '14px',

                      marginBottom:
                        '8px'
                    }}
                  >

                    Pedido

                  </p>

                  <h2
                    style={{

                      fontSize:
                        mobile
                          ? '32px'
                          : '34px',

                      fontWeight:
                        '800',

                      color:
                        '#111827',

                      marginBottom:
                        '10px'
                    }}
                  >

                    #
                    {pedido.id.slice(0, 8)}

                  </h2>

                  <div
                    style={{

                      display: 'flex',

                      gap: '12px',

                      flexWrap:
                        'wrap',

                      alignItems:
                        'center'
                    }}
                  >

                    <span
                      style={{
                        color:
                          '#6b7280',

                        fontSize:
                          '15px'
                      }}
                    >

                      {formatarData(
                        pedido.created_at
                      )}

                    </span>

                    <span
                      style={{
                        color:
                          '#9ca3af'
                      }}
                    >

                      •

                    </span>

                    <span
                      style={{

                        fontWeight:
                          '700',

                        color:
                          '#111827',

                        fontSize:
                          '15px'
                      }}
                    >

                      {totalPares(
                        pedido
                      )}{' '}

                      pares

                    </span>

                  </div>

                </div>

                {/* STATUS */}

                <div
                  style={{

                    backgroundColor:
                      status.fundo,

                    color:
                      status.texto,

                    border:
                      `1px solid ${status.borda}`,

                    padding:
                      '10px 18px',

                    borderRadius:
                      '999px',

                    fontWeight:
                      '700',

                    fontSize:
                      '14px',

                    display: 'flex',

                    alignItems:
                      'center',

                    gap: '8px'
                  }}
                >

                  <div
                    style={{

                      width: '8px',

                      height: '8px',

                      borderRadius:
                        '999px',

                      backgroundColor:
                        status.texto
                    }}
                  />

                  {pedido.status}

                </div>

              </div>

              {/* LINHA */}

              <div
                style={{
                  height: '1px',

                  backgroundColor:
                    '#f3f4f6',

                  margin:
                    '22px 0'
                }}
              />

              {/* RODAPÉ */}

              <div
                style={{

                  display: 'flex',

                  justifyContent:
                    'space-between',

                  alignItems:
                    mobile
                      ? 'stretch'
                      : 'center',

                  flexDirection:
                    mobile
                      ? 'column'
                      : 'row',

                  gap:
                    mobile
                      ? '16px'
                      : '10px'
                }}
              >

                {/* ETAPAS */}

                <div
                  style={{

                    display: 'flex',

                    alignItems:
                      'center',

                    gap:
                      mobile
                        ? '8px'
                        : '12px',

                    flexWrap:
                      'wrap'
                  }}
                >

                  <span
                    style={{
                      fontSize:
                        '14px',

                      color:
                        pedido.status ===
                        'Recebido'

                          ? '#111827'

                          : '#9ca3af',

                      fontWeight:
                        '700'
                    }}
                  >

                    Recebido

                  </span>

                  <div
                    style={{
                      width: '22px',
                      height: '2px',
                      backgroundColor:
                        '#d1d5db'
                    }}
                  />

                  <span
                    style={{
                      fontSize:
                        '14px',

                      color:
                        pedido.status ===
                        'Produção'

                          ? '#111827'

                          : '#9ca3af',

                      fontWeight:
                        '700'
                    }}
                  >

                    Produção

                  </span>

                  <div
                    style={{
                      width: '22px',
                      height: '2px',
                      backgroundColor:
                        '#d1d5db'
                    }}
                  />

                  <span
                    style={{
                      fontSize:
                        '14px',

                      color:
                        pedido.status ===
                        'Finalizado'

                          ? '#111827'

                          : '#9ca3af',

                      fontWeight:
                        '700'
                    }}
                  >

                    Finalizado

                  </span>

                </div>

                {/* BOTÃO */}

                <Link

                  href={`/meus-pedidos/${pedido.id}`}

                  style={{

                    backgroundColor:
                      '#111827',

                    color:
                      '#ffffff',

                    padding:
                      mobile
                        ? '16px'
                        : '14px 22px',

                    borderRadius:
                      '14px',

                    fontWeight:
                      '700',

                    textDecoration:
                      'none',

                    display: 'flex',

                    justifyContent:
                      'center',

                    alignItems:
                      'center',

                    minWidth:
                      mobile
                        ? '100%'
                        : '160px',

                    fontSize:
                      '15px'
                  }}
                >

                  Detalhes →

                </Link>

              </div>

            </div>

          )

        })}

      </div>

    </div>

  )

}
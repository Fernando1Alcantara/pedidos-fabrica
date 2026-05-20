'use client'

import {
  useEffect,
  useState
} from 'react'

import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase'

export default function NovoPedidoPage() {

  const router = useRouter()

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

  const [quantidades, setQuantidades] =
    useState<any>({})

  const [salvando, setSalvando] =
    useState(false)

  const [mobile, setMobile] =
    useState(false)

  const [expandido, setExpandido] =
    useState<any>({})

  useEffect(() => {

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

  function alterarQuantidade(
    cor: string,
    tamanho: number,
    valor: string
  ) {

    setQuantidades((prev: any) => ({

      ...prev,

      [`${cor}-${tamanho}`]:
        valor

    }))

  }

  function totalPares() {

    return Object.values(
      quantidades
    )

      .reduce(
        (
          total: number,
          valor: any
        ) =>

          total +
          Number(valor || 0),

        0
      )

  }

  async function enviarPedido() {

    if (salvando) {
      return
    }

    const total =
      totalPares()

    if (total <= 0) {

      alert(
        'Adicione ao menos 1 item'
      )

      return

    }

    setSalvando(true)

    try {

      const {
        data: { user }
      } =

        await supabase
          .auth
          .getUser()

      if (!user) {

        alert(
          'Usuário não logado'
        )

        setSalvando(false)

        return

      }

      const { data: cliente } =

        await supabase
          .from('clientes')
          .select('*')

          .eq(
            'email',
            user.email
              ?.toLowerCase()
          )

          .single()

      if (!cliente) {

        alert(
          'Cliente não encontrado'
        )

        setSalvando(false)

        return

      }

      const {
        data: pedido,
        error
      } =

        await supabase
          .from('pedidos')
          .insert({

            cliente_id:
              cliente.id,

            status:
              'Recebido',

            consolidado_impresso:
              false

          })

          .select()

          .single()

      if (error || !pedido) {

        console.log(error)

        alert(
          'Erro ao criar pedido'
        )

        setSalvando(false)

        return

      }

      const itens = Object.entries(
        quantidades
      )

        .filter(
          ([_, valor]) =>
            Number(valor) > 0
        )

        .map(([chave, valor]) => {

          const [
            cor,
            tamanho
          ] = chave.split('-')

          return {

            pedido_id:
              pedido.id,

            cor,

            tamanho:
              Number(tamanho),

            quantidade:
              Number(valor)

          }

        })

      const {
        error: erroItens
      } =

        await supabase
          .from('itens_pedido')
          .insert(itens)

      if (erroItens) {

        console.log(erroItens)

        alert(
          'Erro ao salvar itens'
        )

        setSalvando(false)

        return

      }

      router.push(
        '/meus-pedidos'
      )

    }

    catch (erro) {

      console.log(erro)

      alert(
        'Erro inesperado'
      )

    }

    setSalvando(false)

  }

  return (

    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding:
          mobile
            ? '16px'
            : '40px'
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
            fontSize:
              mobile
                ? '38px'
                : '52px',

            fontWeight: '800',

            color: '#111827'
          }}
        >
          Novo Pedido
        </h1>

        <p
          style={{
            marginTop: '10px',
            color: '#6b7280',
            fontSize:
              mobile
                ? '16px'
                : '18px'
          }}
        >
          Preencha as quantidades desejadas
        </p>

      </div>

      {mobile ? (

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            paddingBottom: '140px'
          }}
        >

          {cores.map((cor) => {

            const expandidoCor =
              expandido[cor]

            const listaTamanhos =

              expandidoCor
                ? tamanhos
                : tamanhos.slice(0, 8)

            return (

              <div
                key={cor}
                style={{
                  backgroundColor:
                    '#ffffff',

                  borderRadius:
                    '24px',

                  padding: '20px',

                  border:
                    '1px solid #e5e7eb',

                  boxShadow:
                    '0 4px 12px rgba(0,0,0,0.04)'
                }}
              >

                <div
                  style={{
                    marginBottom: '20px'
                  }}
                >

                  <h2
                    style={{
                      fontSize: '28px',
                      fontWeight: '800',
                      color: '#111827'
                    }}
                  >
                    {cor}
                  </h2>

                </div>

                <div
                  style={{
                    display: 'grid',

                    gridTemplateColumns:
                      'repeat(4, 1fr)',

                    gap: '14px'
                  }}
                >

                  {listaTamanhos.map(
                    (tamanho) => (

                      <div
                        key={tamanho}
                      >

                        <div
                          style={{
                            textAlign:
                              'center',

                            fontWeight:
                              '700',

                            marginBottom:
                              '8px',

                            color:
                              '#111827'
                          }}
                        >
                          {tamanho}
                        </div>

                        <input
                          type="number"

                          min="0"

                          value={
                            quantidades[
                              `${cor}-${tamanho}`
                            ] || ''
                          }

                          onChange={(e) =>
                            alterarQuantidade(
                              cor,
                              tamanho,
                              e.target.value
                            )
                          }

                          style={{
                            width: '100%',

                            height: '54px',

                            border:
                              '1px solid #d1d5db',

                            borderRadius:
                              '14px',

                            textAlign:
                              'center',

                            fontSize:
                              '22px',

                            fontWeight:
                              '700',

                            color:
                              '#111827',

                            backgroundColor:
                              '#ffffff',

                            outline:
                              'none'
                          }}
                        />

                      </div>

                    )
                  )}

                </div>

                {!expandidoCor && (

                  <button

                    onClick={() =>

                      setExpandido(
                        (prev: any) => ({

                          ...prev,

                          [cor]: true

                        })
                      )

                    }

                    style={{
                      width: '100%',

                      marginTop: '18px',

                      backgroundColor:
                        '#f3f4f6',

                      border: 'none',

                      padding: '16px',

                      borderRadius:
                        '14px',

                      fontWeight:
                        '700',

                      color:
                        '#111827'
                    }}
                  >

                    Ver mais tamanhos

                  </button>

                )}

              </div>

            )

          })}

          <div
            style={{
              position: 'fixed',

              bottom: 0,

              left: 0,

              right: 0,

              backgroundColor:
                '#ffffff',

              padding: '20px',

              display: 'flex',

              justifyContent:
                'space-between',

              alignItems:
                'center',

              boxShadow:
                '0 -4px 20px rgba(0,0,0,0.08)'
            }}
          >

            <div>

              <p
                style={{
                  color: '#6b7280',
                  fontSize: '14px'
                }}
              >
                Total de pares
              </p>

              <h2
                style={{
                  fontSize: '42px',
                  fontWeight: '800',
                  color: '#111827'
                }}
              >
                {totalPares()}
              </h2>

            </div>

            <button

              onClick={enviarPedido}

              disabled={salvando}

              style={{

                backgroundColor:

                  salvando
                    ? '#9ca3af'
                    : '#111827',

                color: '#ffffff',

                border: 'none',

                borderRadius: '18px',

                padding:
                  '18px 30px',

                fontSize: '20px',

                fontWeight: '800',

                cursor:
                  salvando
                    ? 'not-allowed'
                    : 'pointer'
              }}
            >

              {salvando
                ? 'Enviando...'
                : 'Enviar Pedido'}

            </button>

          </div>

        </div>

      ) : (

        <div
          style={{
            backgroundColor: '#f9fafb',
            borderRadius: '24px',
            padding: '30px',
            boxShadow:
              '0 10px 30px rgba(0,0,0,0.05)'
          }}
        >

          <div
            style={{
              overflowX: 'auto'
            }}
          >

            <table
              style={{
                width: '100%',
                borderCollapse:
                  'collapse',

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

                      padding: '14px',

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

                        padding: '14px',

                        backgroundColor:
                          '#111827',

                        color: '#ffffff',

                        minWidth: '70px'
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

                        padding: '14px',

                        fontWeight:
                          '700',

                        color: '#111827',

                        backgroundColor:
                          '#f3f4f6'
                      }}
                    >
                      {cor}
                    </td>

                    {tamanhos.map((tamanho) => (

                      <td
                        key={tamanho}
                        style={{
                          border:
                            '1px solid #d1d5db',

                          padding: '8px',

                          textAlign:
                            'center'
                        }}
                      >

                        <input
                          type="number"
                          min="0"

                          value={
                            quantidades[
                              `${cor}-${tamanho}`
                            ] || ''
                          }

                          onChange={(e) =>
                            alterarQuantidade(
                              cor,
                              tamanho,
                              e.target.value
                            )
                          }

                          style={{

                            width: '60px',

                            padding: '10px',

                            border:
                              '1px solid #d1d5db',

                            borderRadius:
                              '10px',

                            textAlign:
                              'center',

                            fontSize:
                              '16px',

                            fontWeight:
                              '600',

                            color:
                              '#111827',

                            backgroundColor:
                              '#ffffff',

                            outline:
                              'none'
                          }}
                        />

                      </td>

                    ))}

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          <div
            style={{
              marginTop: '30px',

              display: 'flex',

              justifyContent:
                'space-between',

              alignItems: 'center',

              flexWrap: 'wrap',

              gap: '20px'
            }}
          >

            <div>

              <p
                style={{
                  color: '#6b7280',
                  marginBottom: '8px'
                }}
              >
                Total de pares
              </p>

              <h2
                style={{
                  fontSize: '42px',
                  fontWeight: '800',
                  color: '#111827'
                }}
              >
                {totalPares()}
              </h2>

            </div>

            <button

              onClick={enviarPedido}

              disabled={salvando}

              style={{

                backgroundColor:

                  salvando
                    ? '#9ca3af'
                    : '#111827',

                color: '#ffffff',

                padding:
                  '16px 32px',

                border: 'none',

                borderRadius: '14px',

                fontWeight: '700',

                fontSize: '16px',

                opacity:
                  salvando ? 0.7 : 1,

                cursor:

                  salvando
                    ? 'not-allowed'
                    : 'pointer'

              }}
            >

              {salvando

                ? 'Enviando...'

                : 'Enviar Pedido'}

            </button>

          </div>

        </div>

      )}

    </div>

  )

}
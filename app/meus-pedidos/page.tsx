'use client'

import { useEffect, useState } from 'react'

import Link from 'next/link'

import { useRouter } from 'next/navigation'

import { supabase } from '@/lib/supabase'

import { formatarData } from '@/lib/data'

export default function MeusPedidosPage() {

  const router = useRouter()

  const [pedidos, setPedidos] =
    useState<any[]>([])

  const [loading, setLoading] =
    useState(true)

  useEffect(() => {

    carregarPedidos()

  }, [])

  async function carregarPedidos() {

    // USUÁRIO LOGADO

    const {
      data: { user }
    } = await supabase.auth
      .getUser()

    if (!user) {

      router.push('/login')

      return

    }

    // BUSCAR CLIENTE

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

    // BUSCAR PEDIDOS

    const { data, error } =

      await supabase
        .from('pedidos')
        .select(`
          *,
          clientes (
            nome
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

  function corStatus(status: string) {

    if (status === 'Recebido') {

      return {

        fundo: '#fef3c7',
        texto: '#92400e'

      }

    }

    if (status === 'Impresso') {

      return {

        fundo: '#dbeafe',
        texto: '#1e40af'

      }

    }

    return {

      fundo: '#dcfce7',
      texto: '#166534'

    }

  }

  // LOADING

  if (loading) {

    return (

      <div
        style={{
          padding: '40px',
          fontSize: '22px'
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
        backgroundColor: '#f3f4f6',
        padding: '40px'
      }}
    >

      {/* TOPO */}

      <div
        style={{
          marginBottom: '40px'
        }}
      >

        <h1
          style={{
            fontSize: '52px',
            fontWeight: '800',
            color: '#000'
          }}
        >
          Meus Pedidos
        </h1>

        <p
          style={{
            color: '#6b7280',
            marginTop: '10px',
            fontSize: '18px'
          }}
        >
          Acompanhe seus pedidos
        </p>

      </div>

      {/* SEM PEDIDOS */}

      {pedidos.length === 0 && (

        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '40px',
            borderRadius: '24px',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '20px'
          }}
        >
          Nenhum pedido encontrado
        </div>

      )}

      {/* LISTA */}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >

        {pedidos.map((pedido) => {

          const cores =
            corStatus(
              pedido.status
            )

          return (

            <div
              key={pedido.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                padding: '30px',
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                boxShadow:
                  '0 10px 30px rgba(0,0,0,0.05)'
              }}
            >

              {/* ESQUERDA */}

              <div>

                <p
                  style={{
                    color: '#6b7280',
                    marginBottom: '6px'
                  }}
                >
                  Pedido
                </p>

                <h2
                  style={{
                    fontSize: '32px',
                    fontWeight: '800',
                    color: '#111827'
                  }}
                >
                  #
                  {pedido.id.slice(0, 8)}
                </h2>

                <p
                  style={{
                    color: '#6b7280',
                    marginTop: '10px'
                  }}
                >
                  {formatarData(
                    pedido.created_at
                  )}
                </p>

              </div>

              {/* STATUS */}

              <div>

                <span
                  style={{
                    backgroundColor:
                      cores.fundo,

                    color:
                      cores.texto,

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

              {/* BOTÃO */}

              <Link
                href={`/meus-pedidos/${pedido.id}`}
                style={{
                  backgroundColor:
                    '#2563eb',

                  color: '#ffffff',

                  padding:
                    '16px 28px',

                  borderRadius:
                    '16px',

                  fontWeight: '700',

                  textDecoration:
                    'none'
                }}
              >
                Ver Pedido
              </Link>

            </div>

          )

        })}

      </div>

    </div>

  )

}
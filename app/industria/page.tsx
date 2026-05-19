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

export default function IndustriaPage() {

  const router =
    useRouter()

  const [
    emailUsuario,

    setEmailUsuario

  ] = useState('')

  useEffect(() => {

    verificarUsuario()

  }, [])

  async function verificarUsuario() {

    const {

      data: { user }

    } = await supabase.auth
      .getUser()

    // NÃO LOGADO

    if (!user) {

      router.push('/login')

      return

    }

    setEmailUsuario(
      user.email || ''
    )

    // BUSCAR USUÁRIO

    const { data }
      = await supabase

        .from('clientes')

        .select('tipo')

        .eq(
          'email',
          user.email
        )

        .single()

    // NÃO É INDUSTRIA

    if (
      !data ||

      data.tipo !==
        'industria'
    ) {

      router.push('/cliente')

      return

    }

  }

  async function sair() {

    await supabase.auth.signOut()

    router.push('/login')

  }

  return (

    <div
      style={{
        minHeight: '100vh',
        backgroundColor:
          '#f3f4f6',

        padding: '40px'
      }}
    >

      {/* TOPO */}

      <div
        style={{
          display: 'flex',

          justifyContent:
            'space-between',

          alignItems:
            'center',

          marginBottom:
            '50px'
        }}
      >

        <div>

          <p
            style={{
              color: '#6b7280',
              fontSize: '18px',
              marginBottom: '10px'
            }}
          >
            Bem-vindo
          </p>

          <h1
            style={{
              fontSize: '42px',
              fontWeight: '800',
              color: '#000'
            }}
          >
            {emailUsuario}
          </h1>

          <p
            style={{
              color: '#6b7280',
              marginTop: '10px',
              fontSize: '18px'
            }}
          >
            Painel da indústria
          </p>

        </div>

        <button
          onClick={sair}
          style={{
            backgroundColor:
              '#ef4444',

            color: '#fff',

            border: 'none',

            padding:
              '14px 24px',

            borderRadius:
              '14px',

            fontWeight:
              '700',

            cursor:
              'pointer'
          }}
        >
          Sair
        </button>

      </div>

      {/* CARDS */}

      <div
        style={{
          display: 'grid',

          gridTemplateColumns:
            'repeat(auto-fit, minmax(320px, 1fr))',

          gap: '30px'
        }}
      >

        {/* PEDIDOS */}

        <Link
          href="/pedidos"
          style={{
            backgroundColor:
              '#ffffff',

            borderRadius:
              '28px',

            padding: '40px',

            textDecoration:
              'none',

            boxShadow:
              '0 10px 30px rgba(0,0,0,0.06)'
          }}
        >

          <div
            style={{
              fontSize: '70px',
              marginBottom: '24px'
            }}
          >
            📦
          </div>

          <h2
            style={{
              fontSize: '36px',

              fontWeight:
                '800',

              color: '#111827',

              marginBottom:
                '14px'
            }}
          >
            Pedidos
          </h2>

          <p
            style={{
              color: '#6b7280',
              fontSize: '18px'
            }}
          >
            Visualize os pedidos recebidos
          </p>

        </Link>

        {/* PRODUÇÃO */}

        <Link
          href="/producao"
          style={{
            backgroundColor:
              '#ffffff',

            borderRadius:
              '28px',

            padding: '40px',

            textDecoration:
              'none',

            boxShadow:
              '0 10px 30px rgba(0,0,0,0.06)'
          }}
        >

          <div
            style={{
              fontSize: '70px',
              marginBottom: '24px'
            }}
          >
            🏭
          </div>

          <h2
            style={{
              fontSize: '36px',

              fontWeight:
                '800',

              color: '#111827',

              marginBottom:
                '14px'
            }}
          >
            Produção
          </h2>

          <p
            style={{
              color: '#6b7280',
              fontSize: '18px'
            }}
          >
            Consolidados e impressão
          </p>

        </Link>

      </div>

    </div>

  )

}
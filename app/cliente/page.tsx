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

export default function ClientePage() {

  const router =
    useRouter()

  const [
    emailCliente,

    setEmailCliente

  ] = useState('')

  useEffect(() => {

    verificarUsuario()

  }, [])

  async function verificarUsuario() {

    const {

      data: { user }

    } = await supabase.auth
      .getUser()

    if (!user) {

      router.push('/login')

      return

    }

    // PEGA O EMAIL DO LOGIN

    setEmailCliente(

      user.email || ''

    )

  }

  async function sair() {

    await supabase.auth.signOut()

    router.push('/login')

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
          display: 'flex',
          justifyContent:
            'space-between',

          alignItems: 'center',

          marginBottom: '50px'
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
              color: '#000',

              wordBreak:
                'break-word'
            }}
          >
            {emailCliente}
          </h1>

          <p
            style={{
              color: '#6b7280',
              marginTop: '10px',
              fontSize: '18px'
            }}
          >
            Gestão de pedidos
          </p>

        </div>

        <button
          onClick={sair}
          style={{
            backgroundColor: '#ef4444',
            color: '#fff',
            border: 'none',
            padding:
              '14px 24px',

            borderRadius: '14px',

            fontWeight: '700',

            cursor: 'pointer'
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

        {/* NOVO PEDIDO */}

        <Link
          href="/novo-pedido"
          style={{
            backgroundColor: '#ffffff',

            borderRadius: '28px',

            padding: '40px',

            textDecoration: 'none',

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
            🛒
          </div>

          <h2
            translate="no"
            style={{
              fontSize: '36px',

              fontWeight: '800',

              color: '#111827',

              marginBottom: '14px'
            }}
          >
            Fazer Pedido
          </h2>

          <p
            style={{
              color: '#6b7280',
              fontSize: '18px'
            }}
          >
            Crie novos pedidos rapidamente
          </p>

        </Link>

        {/* MEUS PEDIDOS */}

        <Link
          href="/meus-pedidos"
          style={{
            backgroundColor: '#ffffff',

            borderRadius: '28px',

            padding: '40px',

            textDecoration: 'none',

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
            translate="no"
            style={{
              fontSize: '36px',

              fontWeight: '800',

              color: '#111827',

              marginBottom: '14px'
            }}
          >
            Meus Pedidos
          </h2>

          <p
            style={{
              color: '#6b7280',
              fontSize: '18px'
            }}
          >
            Acompanhe seus pedidos
          </p>

        </Link>

      </div>

    </div>

  )

}
'use client'

import { useState }
from 'react'

import { useRouter }
from 'next/navigation'

import { supabase }
from '@/lib/supabase'

export default function LoginPage() {

  const router =
    useRouter()

  const [email, setEmail] =
    useState('')

  const [senha, setSenha] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [erro, setErro] =
    useState('')

  async function fazerLogin() {

    setLoading(true)

    setErro('')

    const { error } =

      await supabase.auth
        .signInWithPassword({

          email,
          password: senha

        })

    if (error) {

      setErro(
        'Email ou senha inválidos'
      )

      setLoading(false)

      return
    }

    // EMAIL FORMATADO

    const emailFormatado =
      email.toLowerCase()

    // CLIENTES

    if (

      emailFormatado ===
      'richardson_fernando@outlook.com'

      ||

      emailFormatado ===
      'amanda_cristina@gmail.com'

    ) {

      router.push('/cliente')

    }

    // INDÚSTRIA / ADMIN

    else {

      router.push('/industria')

    }

  }

  return (

    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '28px',
          padding: '40px',
          width: '100%',
          maxWidth: '420px',
          boxShadow:
            '0 10px 30px rgba(0,0,0,0.08)'
        }}
      >

        {/* TÍTULO */}

        <h1
          style={{
            fontSize: '42px',
            fontWeight: '800',
            color: '#000',
            marginBottom: '8px'
          }}
        >
          Login
        </h1>

        <p
          style={{
            color: '#6b7280',
            marginBottom: '36px'
          }}
        >
          Acesse sua conta
        </p>

        {/* EMAIL */}

        <div
          style={{
            marginBottom: '20px'
          }}
        >

          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              color: '#4b5563',
              fontSize: '14px'
            }}
          >
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '14px',
              border:
                '2px solid #d1d5db',
              backgroundColor: '#fff',
              color: '#111827',
              fontSize: '15px',
              outline: 'none'
            }}
          />

        </div>

        {/* SENHA */}

        <div
          style={{
            marginBottom: '28px'
          }}
        >

          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              color: '#4b5563',
              fontSize: '14px'
            }}
          >
            Senha
          </label>

          <input
            type="password"
            value={senha}
            onChange={(e) =>
              setSenha(
                e.target.value
              )
            }
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '14px',
              border:
                '2px solid #d1d5db',
              backgroundColor: '#fff',
              color: '#111827',
              fontSize: '15px',
              outline: 'none'
            }}
          />

        </div>

        {/* ERRO */}

        {erro && (

          <div
            style={{
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              padding: '14px',
              borderRadius: '14px',
              marginBottom: '24px',
              fontWeight: '600'
            }}
          >
            {erro}
          </div>

        )}

        {/* BOTÃO */}

        <button
          onClick={fazerLogin}
          disabled={loading}
          style={{
            width: '100%',
            backgroundColor: '#000000',
            color: '#ffffff',
            padding: '16px',
            borderRadius: '14px',
            fontWeight: '700',
            fontSize: '16px',
            border: 'none',
            cursor: 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >

          {loading
            ? 'Entrando...'
            : 'Entrar'}

        </button>

      </div>

    </div>

  )
}
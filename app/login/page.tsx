'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function fazerLogin() {
    setLoading(true)
    setErro('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      setErro('Email ou senha inválidos')
      setLoading(false)
      return
    }

    const { data: cliente, error: erroCliente } = await supabase
      .from('clientes')
      .select('tipo')
      .eq('email', email.toLowerCase())
      .single()

    if (erroCliente || !cliente) {
      setErro('Usuário não encontrado no sistema. Contate o administrador.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    if (cliente.tipo === 'industria') {
      router.push('/industria')
    } else if (cliente.tipo === 'cliente') {
      router.push('/cliente')
    } else {
      setErro('Tipo de usuário inválido. Contate o administrador.')
      await supabase.auth.signOut()
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !loading) {
      fazerLogin()
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        border: '0.5px solid rgba(0,0,0,0.1)',
      }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <div style={{
            width: '36px', height: '36px',
            backgroundColor: '#EBF4FF',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px',
          }}>
            📦
          </div>
          <span style={{ fontSize: '16px', fontWeight: 600, color: '#111' }}>
            Gestão de Pedidos
          </span>
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 600, color: '#111', marginBottom: '6px' }}>
          Entrar na conta
        </h1>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '28px' }}>
          Use seu email e senha cadastrados
        </p>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="seu@email.com"
            style={{
              width: '100%', padding: '10px 14px',
              borderRadius: '8px', border: '0.5px solid rgba(0,0,0,0.2)',
              fontSize: '14px', color: '#111', outline: 'none', backgroundColor: '#fff',
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '6px' }}>
            Senha
          </label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="••••••••"
            style={{
              width: '100%', padding: '10px 14px',
              borderRadius: '8px', border: '0.5px solid rgba(0,0,0,0.2)',
              fontSize: '14px', color: '#111', outline: 'none', backgroundColor: '#fff',
            }}
          />
        </div>

        {erro && (
          <div style={{
            backgroundColor: '#FCEBEB', color: '#A32D2D',
            padding: '10px 14px', borderRadius: '8px',
            marginBottom: '16px', fontSize: '13px', fontWeight: 500,
          }}>
            {erro}
          </div>
        )}

        <button
          onClick={fazerLogin}
          disabled={loading}
          style={{
            width: '100%', backgroundColor: loading ? '#888' : '#111827',
            color: '#ffffff', padding: '11px',
            borderRadius: '8px', fontWeight: 600, fontSize: '14px',
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

      </div>
    </div>
  )
}
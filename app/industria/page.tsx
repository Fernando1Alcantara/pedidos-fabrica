'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function IndustriaPage() {
  const router = useRouter()
  const [emailUsuario, setEmailUsuario] = useState('')
  const [nomeUsuario, setNomeUsuario] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    verificarUsuario()
  }, [])

  async function verificarUsuario() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data } = await supabase
      .from('clientes')
      .select('tipo')
      .eq('email', user.email)
      .single()

    if (!data || data.tipo !== 'industria') {
      router.push('/cliente')
      return
    }

    const email = user.email || ''
    setEmailUsuario(email)

    const parteNome = email.split('@')[0]
    const nomeFormatado = parteNome
      .replace(/[._]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
    setNomeUsuario(nomeFormatado)

    setLoading(false)
  }

  function gerarIniciais(nome: string) {
    const partes = nome.trim().split(' ')
    if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase()
    return nome.slice(0, 2).toUpperCase()
  }

  async function sair() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: '#f5f5f3',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'sans-serif', color: '#888', fontSize: '15px',
      }}>
        Carregando...
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f3', fontFamily: 'sans-serif' }}>

      {/* TOPBAR */}
      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '0.5px solid rgba(0,0,0,0.1)',
        padding: '0 2rem',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px',
            backgroundColor: '#EBF4FF',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px',
          }}>
            🏭
          </div>
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#111' }}>
            Painel da industria
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#111', lineHeight: 1.3 }}>
              {nomeUsuario}
            </div>
            <div style={{ fontSize: '11px', color: '#888' }}>
              {emailUsuario}
            </div>
          </div>

          <div style={{
            width: '36px', height: '36px',
            borderRadius: '50%',
            backgroundColor: '#EBF4FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 600,
            color: '#185FA5',
            border: '0.5px solid rgba(0,0,0,0.1)',
            flexShrink: 0,
          }}>
            {gerarIniciais(nomeUsuario)}
          </div>

          <button
            onClick={sair}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', color: '#555',
              backgroundColor: 'transparent',
              border: '0.5px solid rgba(0,0,0,0.2)',
              borderRadius: '8px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            ↩ Sair
          </button>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main style={{ padding: '2rem', maxWidth: '860px', margin: '0 auto' }}>

        {/* SAUDAÇÃO */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111', margin: 0 }}>
              Bem-vindo{nomeUsuario ? `, ${nomeUsuario.split(' ')[0]}` : ''}
            </h1>
            <span style={{
              fontSize: '11px', padding: '3px 8px',
              borderRadius: '6px',
              backgroundColor: '#EBF4FF',
              color: '#185FA5',
              fontWeight: 500,
            }}>
              industria
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
            O que você deseja fazer hoje?
          </p>
        </div>

        {/* CARDS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '2rem',
        }}>

          {/* PEDIDOS */}
          <Link href="/pedidos" style={{ textDecoration: 'none' }}>
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '0.5px solid rgba(0,0,0,0.1)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex', flexDirection: 'column', gap: '12px',
                cursor: 'pointer', transition: 'border-color 0.15s', height: '100%',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#378ADD')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)')}
            >
              <div style={{
                width: '44px', height: '44px', borderRadius: '10px',
                backgroundColor: '#EBF4FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
              }}>📦</div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#111', marginBottom: '4px' }}>
                  Pedidos
                </div>
                <div style={{ fontSize: '13px', color: '#888', lineHeight: 1.5 }}>
                  Visualize e gerencie os pedidos recebidos
                </div>
              </div>
              <div style={{ marginTop: 'auto', fontSize: '12px', color: '#185FA5' }}>
                Acessar →
              </div>
            </div>
          </Link>

          {/* PRODUÇÃO */}
          <Link href="/producao" style={{ textDecoration: 'none' }}>
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '0.5px solid rgba(0,0,0,0.1)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex', flexDirection: 'column', gap: '12px',
                cursor: 'pointer', transition: 'border-color 0.15s', height: '100%',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#1D9E75')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)')}
            >
              <div style={{
                width: '44px', height: '44px', borderRadius: '10px',
                backgroundColor: '#E1F5EE',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
              }}>🏭</div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#111', marginBottom: '4px' }}>
                  Produção
                </div>
                <div style={{ fontSize: '13px', color: '#888', lineHeight: 1.5 }}>
                  Consolidados e impressão de pedidos
                </div>
              </div>
              <div style={{ marginTop: 'auto', fontSize: '12px', color: '#0F6E56' }}>
                Acessar →
              </div>
            </div>
          </Link>

          {/* DASHBOARD */}
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '0.5px solid rgba(0,0,0,0.1)',
                borderRadius: '12px',
                padding: '1.5rem',
                display: 'flex', flexDirection: 'column', gap: '12px',
                cursor: 'pointer', transition: 'border-color 0.15s', height: '100%',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#854F0B')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)')}
            >
              <div style={{
                width: '44px', height: '44px', borderRadius: '10px',
                backgroundColor: '#FAEEDA',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
              }}>📊</div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#111', marginBottom: '4px' }}>
                  Dashboard
                </div>
                <div style={{ fontSize: '13px', color: '#888', lineHeight: 1.5 }}>
                  Visão geral operacional do dia
                </div>
              </div>
              <div style={{ marginTop: 'auto', fontSize: '12px', color: '#854F0B' }}>
                Acessar →
              </div>
            </div>
          </Link>

        </div>
      </main>
    </div>
  )
}
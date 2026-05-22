'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function NovoPedidoPage() {
  const router = useRouter()

  const cores = ['Branco', 'Preto', 'Bege', 'Dourado', 'Rosa', 'Pink']
  const tamanhos = Array.from({ length: 21 }, (_, i) => i + 16)

  const [quantidades, setQuantidades] = useState<any>({})
  const [salvando, setSalvando] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [expandido, setExpandido] = useState<any>({})
  const [clienteId, setClienteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    function verificarTela() {
      setMobile(window.innerWidth < 768)
    }
    verificarTela()
    window.addEventListener('resize', verificarTela)
    return () => window.removeEventListener('resize', verificarTela)
  }, [])

  useEffect(() => {
    verificarAcesso()
  }, [])

  async function verificarAcesso() {
    // 1. VERIFICAR SE ESTÁ LOGADO
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // 2. VERIFICAR SE É CLIENTE
    const { data: clienteInfo } = await supabase
      .from('clientes')
      .select('id, tipo')
      .eq('email', user.email?.toLowerCase())
      .single()

    if (!clienteInfo) {
      router.push('/login')
      return
    }

    if (clienteInfo.tipo === 'industria') {
      router.push('/industria')
      return
    }

    // 3. GUARDAR ID DO CLIENTE PARA USAR NO ENVIO
    setClienteId(clienteInfo.id)
    setLoading(false)
  }

  function alterarQuantidade(cor: string, tamanho: number, valor: string) {
    setQuantidades((prev: any) => ({
      ...prev,
      [`${cor}-${tamanho}`]: valor,
    }))
  }

  function totalPares() {
    return Object.values(quantidades).reduce(
      (total: number, valor: any) => total + Number(valor || 0), 0
    ) as number
  }

  async function enviarPedido() {
    if (salvando) return

    if (totalPares() <= 0) {
      alert('Adicione ao menos 1 item')
      return
    }

    if (!clienteId) {
      alert('Erro: cliente não identificado')
      return
    }

    setSalvando(true)

    try {
      // CRIAR PEDIDO
      const { data: pedido, error } = await supabase
        .from('pedidos')
        .insert({
          cliente_id: clienteId,
          status: 'Recebido',
          consolidado_impresso: false,
        })
        .select()
        .single()

      if (error || !pedido) {
        alert('Erro ao criar pedido')
        setSalvando(false)
        return
      }

      // CRIAR ITENS
      const itens = Object.entries(quantidades)
        .filter(([_, valor]) => Number(valor) > 0)
        .map(([chave, valor]) => {
          const [cor, tamanho] = chave.split('-')
          return {
            pedido_id: pedido.id,
            cor,
            tamanho: Number(tamanho),
            quantidade: Number(valor),
          }
        })

      const { error: erroItens } = await supabase
        .from('itens_pedido')
        .insert(itens)

      if (erroItens) {
        alert('Erro ao salvar itens')
        setSalvando(false)
        return
      }

      router.push('/meus-pedidos')
    } catch (erro) {
      console.error(erro)
      alert('Erro inesperado')
    }

    setSalvando(false)
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
    <div style={{
      minHeight: '100vh', backgroundColor: '#f5f5f3', fontFamily: 'sans-serif',
      padding: mobile ? '1rem' : '2rem',
    }}>

      {/* HEADER */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => router.push('/cliente')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '13px', color: '#185FA5', padding: 0, marginBottom: '12px',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}
        >
          ← Voltar
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111', margin: 0 }}>
          Novo pedido
        </h1>
        <p style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
          Preencha as quantidades desejadas
        </p>
      </div>

      {/* MOBILE */}
      {mobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '120px' }}>
          {cores.map((cor) => {
            const expandidoCor = expandido[cor]
            const listaTamanhos = expandidoCor ? tamanhos : tamanhos.slice(0, 8)

            return (
              <div key={cor} style={{
                backgroundColor: '#fff', borderRadius: '12px',
                border: '0.5px solid rgba(0,0,0,0.1)', padding: '1rem',
              }}>
                <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#111', marginBottom: '12px' }}>
                  {cor}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {listaTamanhos.map((tamanho) => (
                    <div key={tamanho}>
                      <div style={{ textAlign: 'center', fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                        {tamanho}
                      </div>
                      <input
                        type="number" min="0"
                        value={quantidades[`${cor}-${tamanho}`] || ''}
                        onChange={(e) => alterarQuantidade(cor, tamanho, e.target.value)}
                        style={{
                          width: '100%', height: '44px', border: '0.5px solid rgba(0,0,0,0.2)',
                          borderRadius: '8px', textAlign: 'center', fontSize: '16px',
                          fontWeight: 500, color: '#111', backgroundColor: '#fff', outline: 'none',
                        }}
                      />
                    </div>
                  ))}
                </div>
                {!expandidoCor && (
                  <button
                    onClick={() => setExpandido((prev: any) => ({ ...prev, [cor]: true }))}
                    style={{
                      width: '100%', marginTop: '12px', backgroundColor: '#f5f5f3',
                      border: 'none', padding: '10px', borderRadius: '8px',
                      fontSize: '13px', fontWeight: 500, color: '#555', cursor: 'pointer',
                    }}
                  >
                    Ver mais tamanhos
                  </button>
                )}
              </div>
            )
          })}

          {/* RODAPÉ FIXO MOBILE */}
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            backgroundColor: '#fff', padding: '1rem 1.25rem',
            borderTop: '0.5px solid rgba(0,0,0,0.1)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#888' }}>Total de pares</div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: '#111' }}>{totalPares()}</div>
            </div>
            <button
              onClick={enviarPedido}
              disabled={salvando}
              style={{
                backgroundColor: salvando ? '#888' : '#111827', color: '#fff',
                border: 'none', borderRadius: '10px', padding: '12px 20px',
                fontSize: '14px', fontWeight: 600,
                cursor: salvando ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {salvando ? 'Enviando...' : 'Enviar pedido'}
            </button>
          </div>
        </div>

      ) : (
        /* DESKTOP */
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '0.5px solid rgba(0,0,0,0.1)', padding: '1.25rem' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
              <thead>
                <tr>
                  <th style={{
                    border: '1px solid #e5e7eb', padding: '10px 14px',
                    backgroundColor: '#111827', color: '#fff', minWidth: '100px', textAlign: 'left',
                  }}>Cor</th>
                  {tamanhos.map((tamanho) => (
                    <th key={tamanho} style={{
                      border: '1px solid #e5e7eb', padding: '10px',
                      backgroundColor: '#111827', color: '#fff', minWidth: '60px', textAlign: 'center',
                    }}>{tamanho}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cores.map((cor, index) => (
                  <tr key={cor} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9fafb' }}>
                    <td style={{
                      border: '1px solid #e5e7eb', padding: '10px 14px',
                      fontWeight: 500, color: '#111', backgroundColor: '#f5f5f3',
                    }}>{cor}</td>
                    {tamanhos.map((tamanho) => (
                      <td key={tamanho} style={{ border: '1px solid #e5e7eb', padding: '6px', textAlign: 'center' }}>
                        <input
                          type="number" min="0"
                          value={quantidades[`${cor}-${tamanho}`] || ''}
                          onChange={(e) => alterarQuantidade(cor, tamanho, e.target.value)}
                          style={{
                            width: '56px', padding: '6px', border: '0.5px solid rgba(0,0,0,0.15)',
                            borderRadius: '6px', textAlign: 'center', fontSize: '14px',
                            fontWeight: 500, color: '#111', backgroundColor: '#fff', outline: 'none',
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RODAPÉ DESKTOP */}
          <div style={{
            marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Total de pares</div>
              <div style={{ fontSize: '28px', fontWeight: 600, color: '#111' }}>{totalPares()}</div>
            </div>
            <button
              onClick={enviarPedido}
              disabled={salvando}
              style={{
                backgroundColor: salvando ? '#888' : '#111827', color: '#fff',
                padding: '10px 24px', border: 'none', borderRadius: '8px',
                fontWeight: 600, fontSize: '14px', cursor: salvando ? 'not-allowed' : 'pointer',
              }}
            >
              {salvando ? 'Enviando...' : 'Enviar pedido'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {

  const [paresHoje, setParesHoje] =
    useState(0)

  const [pedidosHoje, setPedidosHoje] =
    useState(0)

  const [clientesHoje, setClientesHoje] =
    useState(0)

  const [emProducao, setEmProducao] =
    useState(0)

  const [coresMaisVendidas, setCoresMaisVendidas] =
    useState<any[]>([])

  const [tamanhosMaisVendidos, setTamanhosMaisVendidos] =
    useState<any[]>([])

  useEffect(() => {

    carregarDashboard()

  }, [])

  async function carregarDashboard() {

    try {

      const hoje =
        new Date()
          .toISOString()
          .split('T')[0]

      // PEDIDOS
      const { data: pedidos } =
        await supabase
          .from('pedidos')
          .select('*')

      // ITENS
      const { data: itens } =
        await supabase
          .from('itens_pedido')
          .select(`
            quantidade,
            produtos (
              cor,
              tamanho
            ),
            pedidos (
              created_at,
              status,
              cliente_id
            )
          `)

      if (!pedidos || !itens) return

      // PEDIDOS HOJE
      const pedidosHojeLista =
        pedidos.filter((pedido) => {

          if (!pedido.created_at) {
            return false
          }

          const data =
            new Date(pedido.created_at)
              .toISOString()
              .split('T')[0]

          return data === hoje

        })

      setPedidosHoje(
        pedidosHojeLista.length
      )

      // CLIENTES HOJE
      const clientesUnicos =
        new Set(
          pedidosHojeLista.map(
            (pedido) => pedido.cliente_id
          )
        )

      setClientesHoje(
        clientesUnicos.size
      )

      // EM PRODUÇÃO
      const producao =
        pedidos.filter(
          (pedido) =>
            pedido.status ===
            'Em Produção'
        )

      setEmProducao(
        producao.length
      )

      // PARES HOJE
      let totalParesHoje = 0

      const cores: Record<string, number> = {}
      const tamanhos: Record<string, number> = {}

      itens.forEach((item: any) => {

        if (
          !item.produtos ||
          !item.pedidos
        ) {
          return
        }

        const quantidade =
          item.quantidade || 0

        const createdAt =
          item.pedidos?.created_at

        if (!createdAt) {
          return
        }

        const data =
          new Date(createdAt)
            .toISOString()
            .split('T')[0]

        // PARES HOJE
        if (data === hoje) {
          totalParesHoje += quantidade
        }

        // COR
        const cor =
          item.produtos?.cor

        if (cor) {

          if (!cores[cor]) {
            cores[cor] = 0
          }

          cores[cor] += quantidade

        }

        // TAMANHO
        const tamanho =
          item.produtos?.tamanho

        if (tamanho) {

          if (!tamanhos[tamanho]) {
            tamanhos[tamanho] = 0
          }

          tamanhos[tamanho] += quantidade

        }

      })

      setParesHoje(
        totalParesHoje
      )

      // TOP CORES
      const rankingCores =
        Object.entries(cores)
          .map(([nome, total]) => ({
            nome,
            total
          }))
          .sort(
            (a, b) =>
              Number(b.total) -
              Number(a.total)
          )
          .slice(0, 5)

      setCoresMaisVendidas(
        rankingCores
      )

      // TOP TAMANHOS
      const rankingTamanhos =
        Object.entries(tamanhos)
          .map(([nome, total]) => ({
            nome,
            total
          }))
          .sort(
            (a, b) =>
              Number(b.total) -
              Number(a.total)
          )
          .slice(0, 5)

      setTamanhosMaisVendidos(
        rankingTamanhos
      )

    } catch (error) {

      console.log(error)

    }
  }

  function Card({
    titulo,
    valor
  }: any) {

    return (

      <div className="bg-white rounded-2xl shadow-lg p-6 flex-1">

        <p className="text-gray-500 mb-2">
          {titulo}
        </p>

        <h2 className="text-4xl font-bold text-black">
          {valor}
        </h2>

      </div>

    )
  }

  return (

    <div className="min-h-screen bg-gray-100 p-10">

      <div className="max-w-7xl mx-auto">

        <div className="mb-8">

          <h1 className="text-4xl font-bold text-black mb-2">
            Dashboard
          </h1>

          <p className="text-gray-600">
            Visão geral operacional
          </p>

        </div>

        {/* KPIs */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

          <Card
            titulo="Pares Hoje"
            valor={paresHoje}
          />

          <Card
            titulo="Pedidos Hoje"
            valor={pedidosHoje}
          />

          <Card
            titulo="Clientes Hoje"
            valor={clientesHoje}
          />

          <Card
            titulo="Em Produção"
            valor={emProducao}
          />

        </div>

        {/* RANKINGS */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* CORES */}

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <h2 className="text-2xl font-bold text-black mb-6">
              Cores Mais Vendidas
            </h2>

            <div className="space-y-4">

              {coresMaisVendidas.map(
                (item, index) => (

                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-3"
                  >

                    <span className="text-black font-medium">
                      {item.nome}
                    </span>

                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-bold">
                      {item.total}
                    </span>

                  </div>

                )
              )}

            </div>

          </div>

          {/* TAMANHOS */}

          <div className="bg-white rounded-2xl shadow-lg p-6">

            <h2 className="text-2xl font-bold text-black mb-6">
              Tamanhos Mais Vendidos
            </h2>

            <div className="space-y-4">

              {tamanhosMaisVendidos.map(
                (item, index) => (

                  <div
                    key={index}
                    className="flex items-center justify-between border-b pb-3"
                  >

                    <span className="text-black font-medium">
                      {item.nome}
                    </span>

                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-bold">
                      {item.total}
                    </span>

                  </div>

                )
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}
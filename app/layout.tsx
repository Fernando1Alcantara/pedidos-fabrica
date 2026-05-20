import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {

  title:
    'Receba Fashion • Pedidos',

  description:
    'Plataforma de gestão e acompanhamento de pedidos'

}

export default function RootLayout({

  children,

}: Readonly<{

  children: React.ReactNode

}>) {

  return (

    <html lang="pt-BR">

      <body>

        {children}

      </body>

    </html>

  )

}
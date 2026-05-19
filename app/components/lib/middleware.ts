import { NextResponse }
from 'next/server'

import type { NextRequest }
from 'next/server'

export function middleware(
  request: NextRequest
) {

  const token =
    request.cookies.get(
      'sb-access-token'
    )

  const pathname =
    request.nextUrl.pathname

  // ROTAS PÚBLICAS

  const publicas = [

    '/login'

  ]

  // SE NÃO ESTÁ LOGADO

  if (

    !token &&

    !publicas.includes(
      pathname
    )

  ) {

    return NextResponse.redirect(

      new URL(
        '/login',
        request.url
      )

    )

  }

  return NextResponse.next()

}

export const config = {

  matcher: [

    '/cliente',

    '/cliente/:path*',

    '/industria',

    '/industria/:path*',

    '/pedidos',

    '/pedidos/:path*',

    '/producao',

    '/producao/:path*',

    '/novo-pedido',

    '/novo-pedido/:path*',

    '/meus-pedidos',

    '/meus-pedidos/:path*'

  ]

}
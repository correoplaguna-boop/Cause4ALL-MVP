import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cause4All - Campañas solidarias',
  description: 'Plataforma de campañas solidarias para escuelas y organizaciones',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  )
}

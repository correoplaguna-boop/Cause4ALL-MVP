'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-3">
          ¡Gracias por tu aportación!
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-8">
          Tu pago se ha procesado correctamente y ya estás participando en el sorteo.
          Recibirás un email de confirmación en breve.
        </p>

        {/* Session ID (for debugging) */}
        {sessionId && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-xs text-gray-500 mb-1">ID de sesión:</p>
            <p className="text-xs font-mono text-gray-700 break-all">{sessionId}</p>
          </div>
        )}

        {/* CTA Button */}
        <Link
          href="/"
          className="inline-block w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-4 px-6 rounded-xl hover:shadow-lg transition-all duration-200"
        >
          Volver al inicio
        </Link>

        {/* Footer */}
        <p className="text-sm text-gray-500 mt-6">
          ¿Problemas con tu pago?{' '}
          <a href="mailto:soporte@cause4all.com" className="text-primary-500 hover:underline">
            Contacta con soporte
          </a>
        </p>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}

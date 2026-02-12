'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [donationData, setDonationData] = useState<any>(null)

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      return
    }

    // Verify payment with backend
    fetch(`/api/verify-payment?session_id=${sessionId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDonationData(data)
          setStatus('success')
        } else {
          setStatus('error')
        }
      })
      .catch(() => setStatus('error'))
  }, [sessionId])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-warm-50 to-warm-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⏳</div>
          <p className="text-gray-600">Verificando tu pago...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-warm-50 to-warm-200 flex items-center justify-center p-6">
        <div className="card max-w-md text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">
            Algo salió mal
          </h1>
          <p className="text-gray-600 mb-6">
            No pudimos verificar tu pago. Si crees que es un error, contacta con nosotros.
          </p>
          <Link href="/" className="btn-primary inline-block">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-warm-100 flex items-center justify-center p-6">
      <div className="card max-w-md text-center">
        {/* Confetti effect */}
        <div className="relative">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-6xl animate-bounce">
            🎉
          </div>
        </div>

        <div className="pt-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg shadow-green-500/30">
            ✓
          </div>

          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">
            ¡Gracias por tu apoyo!
          </h1>
          
          <p className="text-gray-600 mb-6">
            Tu donación ha sido procesada correctamente. Estás participando en el sorteo solidario.
          </p>

          {donationData && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 text-left">
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-500">Importe</span>
                <span className="font-semibold text-gray-900">{donationData.amount}€</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-gray-500">Donación</span>
                <span className="font-semibold text-green-600">{donationData.donationAmount}€</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500">Sorteo</span>
                <span className="font-semibold text-gray-900">✓ Participando</span>
              </div>
            </div>
          )}

          <div className="bg-blue-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-blue-800">
              📧 Recibirás un email de confirmación con los detalles del sorteo.
            </p>
          </div>

          <Link href="/" className="btn-primary inline-block w-full">
            Volver al inicio
          </Link>

          <p className="text-xs text-gray-400 mt-4">
            ¿Problemas? Escríbenos a soporte@change4all.es
          </p>
        </div>
      </div>
    </div>
  )
}

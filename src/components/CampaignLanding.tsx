'use client'

import { useState, useEffect } from 'react'
import { Campaign } from '@/lib/supabase'

interface CampaignLandingProps {
  campaign: Campaign
  stats: {
    totalDonations: number
    totalAmount: number
    drawParticipants: number
  }
}

const PRICE_OPTIONS = [
  { price: 5, label: 'Donación', sublabel: '5€ a la causa', donation: 5, product: 0 },
  { price: 7.5, label: 'Solidario', sublabel: '2,50€ + 5€ donación', donation: 5, product: 2.5, featured: true },
  { price: 10, label: 'Generoso', sublabel: '2,50€ + 7,50€ donación', donation: 7.5, product: 2.5 },
]

export default function CampaignLanding({ campaign, stats }: CampaignLandingProps) {
  const [selectedOption, setSelectedOption] = useState(PRICE_OPTIONS[1])
  const [isLoading, setIsLoading] = useState(false)
  const [animatedAmount, setAnimatedAmount] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  const progress = (campaign.current_amount / campaign.goal_amount) * 100

  // Animate counter on load
  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = campaign.current_amount / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= campaign.current_amount) {
        setAnimatedAmount(campaign.current_amount)
        clearInterval(timer)
      } else {
        setAnimatedAmount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [campaign.current_amount])

  const handleDonate = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.id,
          campaignTitle: campaign.title,
          amount: selectedOption.price,
          donationAmount: selectedOption.donation,
          productAmount: selectedOption.product,
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        alert('Error al procesar el pago. Inténtalo de nuevo.')
        return
      }

      // Redirect to Stripe Checkout
      window.location.href = url
    } catch (error) {
      alert('Error al conectar con el servidor.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 via-warm-100 to-warm-200 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-gradient-radial from-orange-200/20 to-transparent rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-gradient-radial from-green-200/15 to-transparent rounded-full pointer-events-none" />

      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                width: `${8 + Math.random() * 8}px`,
                height: `${8 + Math.random() * 8}px`,
                background: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'][Math.floor(Math.random() * 6)],
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Header */}
      <header className="px-5 py-5 max-w-lg mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-6 animate-slide-up">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-primary-500/30">
            💝
          </div>
          <span className="font-display font-bold text-xl text-gray-800">Cause4All</span>
        </div>

        {/* Main image */}
        <div className="rounded-3xl overflow-hidden mb-6 shadow-2xl shadow-black/10 relative animate-slide-up animate-delay-100">
          <div className="w-full h-56 bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center relative overflow-hidden">
            {campaign.image_url ? (
              <img 
                src={campaign.image_url} 
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                {/* Mountain illustration placeholder */}
                <svg viewBox="0 0 400 220" className="absolute bottom-0 w-full">
                  <defs>
                    <linearGradient id="mountain1" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#E8F5E9" />
                      <stop offset="100%" stopColor="#C8E6C9" />
                    </linearGradient>
                    <linearGradient id="mountain2" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor="#E3F2FD" />
                    </linearGradient>
                  </defs>
                  <polygon points="0,220 100,80 200,220" fill="url(#mountain1)" opacity="0.7" />
                  <polygon points="80,220 200,60 320,220" fill="url(#mountain2)" />
                  <polygon points="200,60 180,90 220,90" fill="white" />
                  <polygon points="250,220 350,100 450,220" fill="url(#mountain1)" opacity="0.5" />
                </svg>
                {/* Sun */}
                <div className="absolute top-8 right-10 w-12 h-12 bg-gradient-radial from-yellow-200 to-yellow-400 rounded-full shadow-lg shadow-yellow-400/50 animate-float" />
              </>
            )}
          </div>
          {/* Badge */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-green-600 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Campaña activa
          </div>
        </div>

        {/* Title */}
        <div className="animate-slide-up animate-delay-200">
          <h1 className="font-display text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
            {campaign.title}
          </h1>
          {campaign.subtitle && (
            <p className="text-sm text-gray-500 font-medium mb-5">
              {campaign.subtitle}
            </p>
          )}
        </div>

        {/* Progress card */}
        <div className="card mb-4 animate-slide-up animate-delay-300">
          <div className="flex justify-between items-end mb-3">
            <div>
              <span className="font-display text-3xl font-bold text-gray-900">
                {animatedAmount.toLocaleString('es-ES')} €
              </span>
              <span className="text-sm text-gray-400 ml-2">recaudados</span>
            </div>
            <span className="text-sm text-gray-500 font-medium">
              Meta: {campaign.goal_amount.toLocaleString('es-ES')} €
            </span>
          </div>
          {/* Progress bar */}
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div 
              className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full progress-shine transition-all duration-1000"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>👥 {stats.totalDonations} apoyos</span>
            <span>{Math.round(progress)}% conseguido</span>
          </div>
        </div>

        {/* Main CTA */}
        <button
          onClick={handleDonate}
          disabled={isLoading}
          className="w-full btn-primary text-lg py-4 animate-pulse-glow animate-slide-up animate-delay-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '⏳ Procesando...' : '👉 APOYA LA CAUSA'}
        </button>
      </header>

      {/* Content sections */}
      <main className="max-w-lg mx-auto px-5 pb-10 space-y-4">
        {/* About */}
        <section className="card">
          <h2 className="font-display text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center text-base">💚</span>
            ¿Cuál es nuestra causa?
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {campaign.description}
          </p>
        </section>

        {/* How it works */}
        <section className="card">
          <h2 className="font-display text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-base">✨</span>
            Cómo funciona
          </h2>
          <div className="space-y-3">
            {[
              { emoji: '🛒', text: 'Compra un producto solidario (desde 5€)' },
              { emoji: '💝', text: 'Apoyas la causa y ayudas a las familias' },
              { emoji: '🎁', text: 'Participas en el sorteo del premio' },
            ].map((step, i) => (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-xl ${i % 2 === 0 ? 'bg-gray-50' : ''}`}>
                <div className="w-11 h-11 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl flex items-center justify-center text-xl shrink-0">
                  {step.emoji}
                </div>
                <p className="text-gray-800 font-medium">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Product selection */}
        <section className="card-warm">
          <h2 className="font-display text-xl font-bold text-gray-900 mb-2">
            🎗️ Producto solidario
          </h2>
          <p className="text-sm text-amber-700 mb-5">
            Elige tu aportación y participa en el sorteo
          </p>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {PRICE_OPTIONS.map((option) => (
              <button
                key={option.price}
                onClick={() => setSelectedOption(option)}
                className={`relative p-4 rounded-2xl border-2 transition-all duration-200 ${
                  selectedOption.price === option.price
                    ? 'border-primary-500 bg-white shadow-lg shadow-primary-500/20'
                    : 'border-transparent bg-white/70 hover:bg-white'
                }`}
              >
                {option.featured && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    POPULAR
                  </div>
                )}
                <div className="font-display text-2xl font-bold text-gray-900">
                  {option.price}€
                </div>
                <div className="text-xs font-semibold text-gray-500 mt-1">
                  {option.label}
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleDonate}
            disabled={isLoading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '⏳ Procesando...' : `APOYAR CON ${selectedOption.price}€`}
          </button>

          <p className="text-xs text-amber-700 text-center mt-3">
            Valor simbólico del producto; tu apoyo se destina íntegramente a la causa.
          </p>
        </section>

        {/* Prize draw */}
        {campaign.prize_title && (
          <section className="card-success relative overflow-hidden">
            <div className="absolute -top-5 -right-5 text-7xl opacity-10">🎉</div>
            <h2 className="font-display text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              🎉 Sorteo solidario
            </h2>
            <div className="bg-white rounded-2xl p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-300 to-blue-400 rounded-xl flex items-center justify-center text-3xl shrink-0">
                🎁
              </div>
              <div>
                <p className="font-bold text-gray-900">{campaign.prize_title}</p>
                {campaign.draw_date && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    📅 Fecha: {new Date(campaign.draw_date).toLocaleDateString('es-ES')}
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-green-700 text-center mt-3">
              Se anunciará el ganador por email
            </p>
          </section>
        )}

        {/* Organizer */}
        {campaign.organization && (
          <section className="card">
            <h2 className="font-display text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center text-base">🏫</span>
              Quién organiza
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-display font-bold text-lg shrink-0">
                {campaign.organization.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-900">{campaign.organization.name}</p>
                {campaign.organization.description && (
                  <p className="text-sm text-gray-500 mt-1">{campaign.organization.description}</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center pt-6">
          <div className="flex justify-center gap-4 flex-wrap mb-4">
            {['Bases del sorteo', 'Política de privacidad', 'Aviso legal'].map((link) => (
              <a key={link} href="#" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                {link}
              </a>
            ))}
          </div>
          <p className="text-xs text-gray-400 mb-5">
            *La participación en el sorteo queda vinculada al email facilitado en la compra.*
          </p>
          <div className="flex items-center justify-center gap-2 opacity-60">
            <div className="w-6 h-6 bg-gradient-to-br from-primary-400 to-primary-500 rounded-md flex items-center justify-center text-xs">
              💝
            </div>
            <span className="font-display font-semibold text-xs text-gray-500">Cause4All</span>
          </div>
        </footer>
      </main>
    </div>
  )
}

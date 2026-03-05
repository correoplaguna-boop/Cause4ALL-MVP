'use client'

import { useState, useEffect, useRef } from 'react'
import { Campaign, getCurrentMilestone } from '@/lib/supabase'

interface CampaignLandingProps {
  campaign: Campaign
  stats: {
    totalDonations: number
    totalAmount: number
    drawParticipants: number
  }
}

const PRICE_OPTIONS = [
  { 
    price: 5, 
    label: 'Donación directa', 
    icon: '🟢',
    details: '❤️ 5€ donación • 🎟 1 participación',
    donation: 5, 
    product: 0,
    tickets: 1
  },
  { 
    price: 7.5, 
    label: 'Opción estándar', 
    icon: '⭐',
    details: '🧴 1 atomizador recargable  • ❤️ 5€ apoyo • 🎟 1 participación',
    donation: 5, 
    product: 2.5,
    tickets: 1,
    featured: true 
  },
  { 
    price: 10, 
    label: 'Generoso', 
    icon: '💚',
    details: '🧴 atomizador recargable • ❤️ 7,5€ apoyo • 🎟 1 participación',
    donation: 7.5, 
    product: 2.5,
    tickets: 1
  },
  { 
    price: 15, 
    label: 'Doble apoyo', 
    icon: '🎁',
    details: '🧴🧴 atomizadores recargables • ❤️ 10€ apoyo • 🎟 2 participaciones',
    donation: 10, 
    product: 5,
    tickets: 2
  },
  { 
    price: 20, 
    label: 'Muy generoso', 
    icon: '🌟',
    details: '🧴 atomizador recargable • ❤️ 17,5€ apoyo • 🎟 2 participaciones',
    donation: 17.5, 
    product: 2.5,
    tickets: 2
  },
  { 
    price: 22.5, 
    label: 'Triple apoyo', 
    icon: '💎',
    details: '🧴🧴🧴 atomizadores recargables • ❤️ 15€ apoyo • 🎟 3 participaciones',
    donation: 15, 
    product: 7.5,
    tickets: 3
  },
]

export default function CampaignLanding({ campaign, stats }: CampaignLandingProps) {
  const [selectedOption, setSelectedOption] = useState(PRICE_OPTIONS[1])
  const [isLoading, setIsLoading] = useState(false)
  const [animatedAmount, setAnimatedAmount] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const selectionRef = useRef<HTMLElement>(null)

  const milestone = getCurrentMilestone(campaign)
  const progress = milestone.progress

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

  const scrollToSelection = () => {
    selectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

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

      window.location.href = url
    } catch (error) {
      alert('Error al conectar con el servidor.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 via-warm-100 to-warm-200 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-gradient-radial from-orange-200/20 to-transparent rounded-full pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-gradient-radial from-green-200/15 to-transparent rounded-full pointer-events-none" />

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

      <header className="px-5 py-5 max-w-lg mx-auto">
        <div className="flex items-center justify-center gap-2 mb-6 animate-slide-up">
          <img 
            src="/logo.svg" 
            alt="Cause4All" 
            className="h-12 w-auto"
          />
        </div>

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
                <div className="absolute top-8 right-10 w-12 h-12 bg-gradient-radial from-yellow-200 to-yellow-400 rounded-full shadow-lg shadow-yellow-400/50 animate-float" />
              </>
            )}
          </div>
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-green-600 flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Campaña activa
          </div>
        </div>

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

        <div className="card mb-4 animate-slide-up animate-delay-300">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {milestone.phaseLabel}
            </span>
            {milestone.phase < 3 && (
              <span className="text-xs text-gray-400">
                Siguiente: {milestone.currentGoal.toLocaleString('es-ES')}€
              </span>
            )}
          </div>

          <div className="flex justify-between items-end mb-3">
            <div>
              <span className="font-display text-3xl font-bold text-gray-900">
                {animatedAmount.toLocaleString('es-ES')} €
              </span>
              <span className="text-sm text-gray-400 ml-2">recaudados</span>
            </div>
            <span className="text-sm text-gray-500 font-medium">
              Meta: {milestone.currentGoal.toLocaleString('es-ES')} €
            </span>
          </div>

          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2 relative">
            <div 
              className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full progress-shine transition-all duration-1000"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-400">
            <span>👥 {stats.totalDonations} apoyos</span>
            <span>{Math.round(progress)}% de este objetivo</span>
          </div>

          {(milestone.phase === 2 || milestone.phase === 3) && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex gap-2">
                {milestone.phase >= 1 && campaign.goal_milestone_1 && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</span>
                    {campaign.goal_milestone_1.toLocaleString('es-ES')}€
                  </div>
                )}
                {milestone.phase >= 2 && campaign.goal_milestone_2 && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</span>
                    {campaign.goal_milestone_2.toLocaleString('es-ES')}€
                  </div>
                )}
                {milestone.phase === 3 && (
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px]">→</span>
                    {milestone.currentGoal.toLocaleString('es-ES')}€ (Final)
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={scrollToSelection}
          className="w-full btn-primary text-lg py-4 animate-pulse-glow animate-slide-up animate-delay-400"
        >
          👇 Elige tu aportación
        </button>
      </header>

      <main className="max-w-lg mx-auto px-5 pb-10 space-y-4">
        <section className="card">
          <h2 className="font-display text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center text-base">💚</span>
            ¿Cuál es nuestra causa?
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {campaign.description}
          </p>
        </section>

        <section className="card bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-100">
          <h2 className="font-display text-xl font-bold text-gray-900 mb-4 text-center">
            Cómo funciona
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-white/80 p-4 rounded-xl">
              <span className="text-3xl">🔵</span>
              <p className="text-gray-800 font-semibold">Aportas desde 5€</p>
            </div>
            <div className="flex items-center gap-3 bg-white/80 p-4 rounded-xl">
              <span className="text-3xl">🎁</span>
              <p className="text-gray-800 font-semibold">Participas en el sorteo</p>
            </div>
            <div className="flex items-center gap-3 bg-white/80 p-4 rounded-xl">
              <span className="text-3xl">❤️</span>
              <p className="text-gray-800 font-semibold">Ayudas a {campaign.organization?.name || 'la causa'}</p>
            </div>
          </div>
        </section>

        {/* Producto Solidario - VERSIÓN MEJORADA */}
        {campaign.product_name && (
          <section className="card-warm">
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-4 text-center">
              🧴 El producto solidario
            </h2>
            
            {/* Imagen grande horizontal como la principal */}
            {campaign.product_image_url && (
              <div className="rounded-2xl overflow-hidden mb-5 shadow-xl">
                <img 
                  src={campaign.product_image_url} 
                  alt={campaign.product_name}
                  className="w-full h-56 object-cover"
                />
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 mb-5">
              
              <h3 className="font-display text-xl font-bold text-gray-900 mb-3 text-center">
                {campaign.product_name}
              </h3>
              
              {campaign.product_description && (
                <p className="text-gray-700 leading-relaxed text-center mb-4 whitespace-pre-line">
  {campaign.product_description}
</p>
```

---

## 📝 En el Admin, escribe así (SIN `\n*`):
```
Compra un producto muy útil, de uso diario a precio de mercado y ayúdanos a conseguir nuestro objetivo

Recarga directa desde tu perfume
Perfecto para bolso, viaje, gimnasio
Producto útil de uso diario
Precio de mercado
💚 Apoyas la causa
              )}

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <p className="text-sm text-amber-900 text-center font-medium">
                  💰 Precio del producto 2,5€ Valor del producto: 7,50€<br/>
                  <span className="text-xs">La mayor parte de tu aportación va directamente a la causa</span>
                </p>
              </div>
            </div>

            {/* Elige tu aportación - INTEGRADO AQUÍ */}
            <h3 className="font-display text-xl font-bold text-gray-900 mb-3 text-center">
              💝 Elige tu aportación
            </h3>
            <p className="text-sm text-amber-800 text-center mb-5 font-medium">
              Incluye el producto + apoyas la causa + participas en el sorteo
            </p>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {PRICE_OPTIONS.map((option) => (
                <button
                  key={option.price}
                  onClick={() => setSelectedOption(option)}
                  className={`relative p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                    selectedOption.price === option.price
                      ? 'border-primary-500 bg-white shadow-xl shadow-primary-500/30 scale-105'
                      : 'border-gray-200 bg-white/70 hover:bg-white hover:border-primary-300'
                  }`}
                >
                  {option.featured && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                      RECOMENDADO
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{option.icon}</span>
                    <div>
                      <div className="font-display text-2xl font-bold text-gray-900">
                        {option.price}€
                      </div>
                      <div className="text-xs font-bold text-gray-700">
                        {option.label}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-[10px] text-gray-600 leading-relaxed">
                    {option.details}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleDonate}
              disabled={isLoading}
              className="w-full btn-primary text-lg py-4 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '⏳ Procesando...' : `APORTAR ${selectedOption.price}€`}
            </button>

            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-xs text-green-800 text-center font-medium">
                ✓ Pago 100% seguro con Stripe
              </p>
            </div>
          </section>
        )}

        {campaign.prize_title && (
          <section className="card-success relative overflow-hidden">
            <div className="absolute -top-5 -right-5 text-7xl opacity-10">🎉</div>
            <h2 className="font-display text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              🎉 Sorteo solidario
            </h2>
            <div className="bg-white rounded-2xl p-4 flex items-center gap-4">
              {campaign.prize_image_url ? (
                <img 
                  src={campaign.prize_image_url} 
                  alt={campaign.prize_title}
                  className="w-24 h-24 rounded-xl object-cover shrink-0"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-300 to-blue-400 rounded-xl flex items-center justify-center text-3xl shrink-0">
                  🎁
                </div>
              )}
              <div>
                <p className="font-bold text-gray-900">{campaign.prize_title}</p>
                {campaign.draw_date && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    📅 Sorteo: {new Date(campaign.draw_date).toLocaleDateString('es-ES')}
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-green-700 text-center mt-3 font-medium">
              Se anunciará el ganador por email
            </p>
          </section>
        )}

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
          <div className="flex items-center justify-center opacity-60">
            <img 
              src="/logo.svg" 
              alt="Cause4All" 
              className="h-6 w-auto"
            />
          </div>
        </footer>
      </main>
    </div>
  )
}

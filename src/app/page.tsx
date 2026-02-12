import Link from 'next/link'
import { getAllActiveCampaigns } from '@/lib/supabase'

export const revalidate = 60 // Revalidate every 60 seconds

export default async function HomePage() {
  const campaigns = await getAllActiveCampaigns()

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 via-warm-100 to-warm-200">
      {/* Header */}
      <header className="px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-primary-500/30">
              💝
            </div>
            <span className="font-display font-bold text-2xl text-gray-800">Cause4All</span>
          </div>
          <Link href="/admin" className="btn-secondary text-sm">
            Panel Admin
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-12 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-balance">
            Apoya causas solidarias de tu comunidad
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Ayuda a colegios, AMPAs y asociaciones a financiar sus proyectos. 
            Cada aportación cuenta y te da la oportunidad de ganar premios.
          </p>
        </div>
      </section>

      {/* Campaigns Grid */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-gray-800 mb-8">
            Campañas activas
          </h2>

          {campaigns.length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="font-display text-xl font-bold text-gray-800 mb-2">
                Próximamente
              </h3>
              <p className="text-gray-600">
                Estamos preparando nuevas campañas solidarias. ¡Vuelve pronto!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <Link 
                  key={campaign.id} 
                  href={`/c/${campaign.slug}`}
                  className="card group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-48 -mx-6 -mt-6 mb-4 rounded-t-3xl overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600">
                    {campaign.image_url ? (
                      <img 
                        src={campaign.image_url} 
                        alt={campaign.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        {campaign.cause_type === 'escolar' ? '🎓' : 
                         campaign.cause_type === 'deportiva' ? '⚽' : '💚'}
                      </div>
                    )}
                    {/* Badge */}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-green-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Activa
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-display text-lg font-bold text-gray-900 group-hover:text-primary-500 transition-colors">
                        {campaign.title}
                      </h3>
                      {campaign.subtitle && (
                        <p className="text-sm text-gray-500">{campaign.subtitle}</p>
                      )}
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-gray-900">
                          {campaign.current_amount.toLocaleString('es-ES')}€
                        </span>
                        <span className="text-gray-500">
                          Meta: {campaign.goal_amount.toLocaleString('es-ES')}€
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full progress-shine"
                          style={{ width: `${Math.min((campaign.current_amount / campaign.goal_amount) * 100, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Organization */}
                    {campaign.organization && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span>🏫</span>
                        {campaign.organization.name}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-200/50">
        <div className="max-w-6xl mx-auto text-center text-sm text-gray-500">
          <p>© 2024 Cause4All. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

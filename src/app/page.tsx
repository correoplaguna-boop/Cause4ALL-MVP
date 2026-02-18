import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export const revalidate = 60 // Revalidar cada minuto

async function getActiveCampaigns() {
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*, organization:organizations(*)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(6)

  return campaigns || []
}

export default async function HomePage() {
  const campaigns = await getActiveCampaigns()

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img 
              src="/logo.svg" 
              alt="Cause4All" 
              className="h-12 w-auto"
            />
          </Link>
          
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Compras un producto.<br />
          Impulsas una causa
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          Ayudamos a colegios, AMPAs y asociaciones a financiar sus proyectos mediante la venta de productos con donación incluida y seguimiento en tiempo real de la recaudación
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="#campanas"
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            Ver campañas activas
          </Link>
                  </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: '🎯',
              title: 'Simple y efectivo',
              description: 'Crea tu campaña en minutos y empieza a recaudar fondos hoy mismo',
            },
            {
              icon: '💰',
              title: 'Sin complicaciones',
              description: 'Producto + donación opcional. Todo legal y transparente',
            },
            {
              icon: '📊',
              title: 'Seguimiento en tiempo real',
              description: 'Controla tu recaudación y participantes al instante',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="font-display text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Active Campaigns */}
      <section id="campanas" className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="font-display text-4xl font-bold text-gray-900 mb-4">
          Campañas activas
        </h2>
        <p className="text-gray-600 mb-10">
          Apoya estas causas y participa en sus sorteos
        </p>

        {campaigns.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
            <p className="text-gray-500 mb-4">
              No hay campañas activas en este momento
            </p>
            <Link
              href="/admin"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
            >
              Crea la primera campaña
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => {
              const progress = (campaign.current_amount / campaign.goal_amount) * 100
              const causeIcons: Record<string, string> = {
  escolar: '🎓',
  deportiva: '⚽',
  social: '💚',
}

              return (
                <Link
                  key={campaign.id}
                  href={`/c/${campaign.slug}`}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  {/* Badge */}
                  <div className="relative">
                    <div className="absolute top-4 left-4 z-10">
                      <span className="inline-flex items-center gap-2 bg-green-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                        Activa
                      </span>
                    </div>

                    {/* Image */}
                    <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center relative overflow-hidden">
                      {campaign.image_url ? (
                        <img
                          src={campaign.image_url}
                          alt={campaign.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <>
                          {/* Placeholder SVG */}
                          <svg
                            viewBox="0 0 400 220"
                            className="absolute bottom-0 w-full"
                          >
                            <defs>
                              <linearGradient
                                id={`mountain1-${campaign.id}`}
                                x1="0%"
                                y1="0%"
                                x2="0%"
                                y2="100%"
                              >
                                <stop offset="0%" stopColor="#E8F5E9" />
                                <stop offset="100%" stopColor="#C8E6C9" />
                              </linearGradient>
                              <linearGradient
                                id={`mountain2-${campaign.id}`}
                                x1="0%"
                                y1="0%"
                                x2="0%"
                                y2="100%"
                              >
                                <stop offset="0%" stopColor="#FFFFFF" />
                                <stop offset="100%" stopColor="#E3F2FD" />
                              </linearGradient>
                            </defs>
                            <polygon
                              points="0,220 100,80 200,220"
                              fill={`url(#mountain1-${campaign.id})`}
                              opacity="0.7"
                            />
                            <polygon
                              points="80,220 200,60 320,220"
                              fill={`url(#mountain2-${campaign.id})`}
                            />
                            <polygon
                              points="200,60 180,90 220,90"
                              fill="white"
                            />
                            <polygon
                              points="250,220 350,100 450,220"
                              fill={`url(#mountain1-${campaign.id})`}
                              opacity="0.5"
                            />
                          </svg>
                          <div className="absolute top-8 right-12 w-12 h-12 bg-yellow-300 rounded-full opacity-80"></div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {campaign.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {campaign.subtitle}
                    </p>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-gray-900">
                          {campaign.current_amount.toLocaleString('es-ES')}€
                        </span>
                        <span className="text-gray-500">
                          Meta: {campaign.goal_amount.toLocaleString('es-ES')}€
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="text-lg">
                          {causeIcons[campaign.cause_type]}
                        </span>
                        {campaign.organization?.name || 'Organización'}
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="font-display text-4xl font-bold mb-4">
            ¿Listo para impulsar tu causa?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Crea tu campaña en minutos y empieza a recaudar fondos hoy
          </p>
          
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.svg" 
                alt="Cause4All" 
                className="h-10 w-auto"
              />
            </div>
            <p className="text-sm text-gray-500">
              © 2024 Cause4All. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

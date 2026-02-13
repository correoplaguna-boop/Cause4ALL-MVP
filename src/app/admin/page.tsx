'use client'

import { useState, useEffect } from 'react'
import { supabase, Campaign, Organization } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminPage() {
  // Authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')

  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    organization_id: '',
    organization_name: '',
    title: '',
    subtitle: '',
    slug: '',
    description: '',
    cause_type: 'escolar' as 'escolar' | 'deportiva' | 'social',
    goal_amount: 3000,
    product_price: 7.5,
    donation_amount: 5,
    image_url: '',
    prize_title: '',
    prize_image_url: '',
    prize_type: 'material' as 'material' | 'experiencia' | 'digital',
    draw_date: '',
    end_date: '',
  })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'Cause4All@98') { // Cambia esta contraseña por una más segura
      setIsAuthenticated(true)
      localStorage.setItem('admin_auth', 'true')
    } else {
      alert('Contraseña incorrecta')
    }
  }

  useEffect(() => {
    // Check if already authenticated
    const authStored = localStorage.getItem('admin_auth')
    if (authStored === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated])

  const loadData = async () => {
    setIsLoading(true)
    
    const [campaignsRes, orgsRes] = await Promise.all([
      supabase.from('campaigns').select('*, organization:organizations(*)').order('created_at', { ascending: false }),
      supabase.from('organizations').select('*').order('name'),
    ])

    if (campaignsRes.data) setCampaigns(campaignsRes.data)
    if (orgsRes.data) setOrganizations(orgsRes.data)
    
    setIsLoading(false)
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // First, create or find organization
    let orgId = formData.organization_id

    if (!orgId && formData.organization_name) {
      // Create new organization
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: formData.organization_name,
          type: 'asociacion',
          email: 'info@' + generateSlug(formData.organization_name) + '.com',
          location: 'España',
        })
        .select()
        .single()

      if (orgError) {
        alert('Error al crear organización: ' + orgError.message)
        return
      }

      orgId = newOrg.id
    }

    const campaignData = {
      organization_id: orgId,
      title: formData.title,
      subtitle: formData.subtitle,
      slug: formData.slug,
      description: formData.description,
      cause_type: formData.cause_type,
      goal_amount: formData.goal_amount,
      product_price: formData.product_price,
      donation_amount: formData.donation_amount,
      image_url: formData.image_url || null,
      prize_title: formData.prize_title || null,
      prize_image_url: formData.prize_image_url || null,
      prize_type: formData.prize_type,
      draw_date: formData.draw_date || null,
      end_date: formData.end_date || null,
      current_amount: editingCampaign?.current_amount || 0,
      status: 'active',
      start_date: new Date().toISOString(),
    }

    if (editingCampaign) {
      const { error } = await supabase
        .from('campaigns')
        .update(campaignData)
        .eq('id', editingCampaign.id)

      if (error) {
        alert('Error al actualizar: ' + error.message)
        return
      }
    } else {
      const { error } = await supabase
        .from('campaigns')
        .insert(campaignData)

      if (error) {
        alert('Error al crear: ' + error.message)
        return
      }
    }

    setShowForm(false)
    setEditingCampaign(null)
    resetForm()
    loadData()
  }

  const resetForm = () => {
    setFormData({
      organization_id: '',
      organization_name: '',
      title: '',
      subtitle: '',
      slug: '',
      description: '',
      cause_type: 'escolar' as 'escolar' | 'deportiva' | 'social',
      goal_amount: 3000,
      product_price: 7.5,
      donation_amount: 5,
      image_url: '',
      prize_title: '',
      prize_image_url: '',
      prize_type: 'material' as 'material' | 'experiencia' | 'digital',
      draw_date: '',
      end_date: '',
    })
  }

  const handleEdit = (campaign: Campaign) => {
    setFormData({
      organization_id: campaign.organization_id,
      organization_name: campaign.organization?.name || '',
      title: campaign.title,
      subtitle: campaign.subtitle || '',
      slug: campaign.slug,
      description: campaign.description,
      cause_type: campaign.cause_type,
      goal_amount: campaign.goal_amount,
      product_price: campaign.product_price,
      donation_amount: campaign.donation_amount,
      image_url: campaign.image_url || '',
      prize_title: campaign.prize_title || '',
      prize_image_url: campaign.prize_image_url || '',
      prize_type: campaign.prize_type || 'material' as 'material' | 'experiencia' | 'digital',
      draw_date: campaign.draw_date ? new Date(campaign.draw_date).toISOString().split('T')[0] : '',
      end_date: campaign.end_date ? new Date(campaign.end_date).toISOString().split('T')[0] : '',
    })
    setEditingCampaign(campaign)
    setShowForm(true)
  }

  const handleStatusChange = async (campaign: Campaign, newStatus: string) => {
    const { error } = await supabase
      .from('campaigns')
      .update({ status: newStatus })
      .eq('id', campaign.id)

    if (error) {
      alert('Error: ' + error.message)
      return
    }

    loadData()
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl flex items-center justify-center text-3xl mx-auto mb-4">
              💝
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Panel Admin</h1>
            <p className="text-gray-500 text-sm mt-2">Ingresa la contraseña para continuar</p>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none mb-4"
              autoFocus
            />
            <button type="submit" className="w-full btn-primary">
              Acceder
            </button>
          </form>
          <p className="text-xs text-gray-400 mt-4 text-center">
            Contraseña predeterminada: cause4all2025
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl flex items-center justify-center text-xl">
                💝
              </div>
              <span className="font-display font-bold text-xl text-gray-800">Cause4All</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600 font-medium">Panel Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                resetForm()
                setEditingCampaign(null)
                setShowForm(true)
              }}
              className="btn-primary text-sm"
            >
              + Nueva Campaña
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('admin_auth')
                setIsAuthenticated(false)
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Campañas activas', value: campaigns.filter(c => c.status === 'active').length, icon: '🚀' },
            { label: 'Total recaudado', value: `${campaigns.reduce((sum, c) => sum + c.current_amount, 0).toLocaleString('es-ES')}€`, icon: '💰' },
            { label: 'Organizaciones', value: organizations.length, icon: '🏫' },
            { label: 'Campañas totales', value: campaigns.length, icon: '📊' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{stat.icon}</div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Campaigns table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-display text-lg font-bold text-gray-900">Campañas</h2>
          </div>

          {campaigns.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 mb-4">No hay campañas todavía</p>
              <button
                onClick={() => {
                  resetForm()
                  setEditingCampaign(null)
                  setShowForm(true)
                }}
                className="btn-primary text-sm"
              >
                Crear primera campaña
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Campaña</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Organización</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Meta</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Recaudado</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{campaign.title}</p>
                          <p className="text-sm text-gray-500">{campaign.subtitle}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {campaign.organization?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {campaign.goal_amount.toLocaleString('es-ES')}€
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {campaign.current_amount.toLocaleString('es-ES')}€
                          </p>
                          <p className="text-xs text-gray-500">
                            {((campaign.current_amount / campaign.goal_amount) * 100).toFixed(0)}%
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={campaign.status}
                          onChange={(e) => handleStatusChange(campaign, e.target.value)}
                          className="text-sm rounded-lg border border-gray-200 px-3 py-1.5 outline-none focus:border-primary-400"
                        >
                          <option value="draft">Borrador</option>
                          <option value="active">Activa</option>
                          <option value="ended">Finalizada</option>
                          <option value="cancelled">Cancelada</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(campaign)}
                            className="text-sm text-primary-500 hover:underline"
                          >
                            Editar
                          </button>
                          <Link
                            href={`/c/${campaign.slug}`}
                            target="_blank"
                            className="text-sm text-gray-500 hover:underline"
                          >
                            Ver
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Campaign Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl">
              <h2 className="font-display text-xl font-bold text-gray-900">
                {editingCampaign ? 'Editar campaña' : 'Nueva campaña'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingCampaign(null)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Organization Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre de la Organización *
                </label>
                <input
                  type="text"
                  required
                  value={formData.organization_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, organization_name: e.target.value }))}
                  placeholder="Ej: Club Deportivo Barcelona"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se creará automáticamente si no existe
                </p>
              </div>

              {/* Title & Subtitle */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Ej: Esquiada solidaria"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subtítulo
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Ej: Colegio Pare Manyanet"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
                  />
                </div>
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  URL (slug) *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">cause4all.com/c/</span>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción * <span className="text-gray-400 font-normal">(máx. 400 caracteres)</span>
                </label>
                <textarea
                  required
                  maxLength={400}
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Esta campaña recauda fondos para..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">{formData.description.length}/400</p>
              </div>

              {/* Campaign Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🖼️ Imagen de campaña
                  <span className="text-gray-400 font-normal ml-2">(URL de la imagen)</span>
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
                />
                {formData.image_url && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-gray-200">
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  💡 <strong>Sugerencias:</strong> Usar <a href="https://imgur.com" target="_blank" rel="noopener" className="text-primary-500 hover:underline">Imgur</a>, 
                  {' '}<a href="https://cloudinary.com" target="_blank" rel="noopener" className="text-primary-500 hover:underline">Cloudinary</a>, o 
                  {' '}<a href="https://supabase.com/storage" target="_blank" rel="noopener" className="text-primary-500 hover:underline">Supabase Storage</a>
                </p>
              </div>

              {/* Cause type & Goal */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de causa
                  </label>
                  <select
                    value={formData.cause_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, cause_type: e.target.value as any }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
                  >
                    <option value="escolar">🎓 Escolar</option>
                    <option value="deportiva">⚽ Deportiva</option>
                    <option value="social">💚 Social</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Meta de recaudación (€)
                  </label>
                  <input
                    type="number"
                    min={100}
                    value={formData.goal_amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, goal_amount: parseInt(e.target.value) }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
                  />
                </div>
              </div>

              {/* Prize */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Premio del sorteo
                  </label>
                  <input
                    type="text"
                    value={formData.prize_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, prize_title: e.target.value }))}
                    placeholder="Ej: Tablet + auriculares"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fecha del sorteo
                  </label>
                  <input
                    type="date"
                    value={formData.draw_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, draw_date: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
                  />
                </div>
              </div>

              {/* Prize Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🎁 Imagen del premio
                  <span className="text-gray-400 font-normal ml-2">(URL de la imagen)</span>
                </label>
                <input
                  type="url"
                  value={formData.prize_image_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, prize_image_url: e.target.value }))}
                  placeholder="https://ejemplo.com/premio.jpg"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none"
                />
                {formData.prize_image_url && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center p-4">
                    <img 
                      src={formData.prize_image_url} 
                      alt="Preview premio" 
                      className="max-h-32 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingCampaign(null)
                    resetForm()
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  {editingCampaign ? 'Guardar cambios' : 'Crear campaña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

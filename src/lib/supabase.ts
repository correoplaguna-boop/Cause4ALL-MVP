import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Organization {
  id: string
  name: string
  type: 'colegio' | 'ampa' | 'asociacion' | 'fundacion'
  logo_url?: string
  location?: string
  description?: string
  email: string
  created_at: string
}

export interface Campaign {
  id: string
  organization_id: string
  organization?: Organization
  title: string
  subtitle: string | null
  slug: string
  description: string
  cause_type: 'escolar' | 'deportiva' | 'social'
  goal_amount: number
  goal_milestone_1?: number
  goal_milestone_2?: number
  goal_milestone_3?: number
  current_amount: number
  product_price: number
  donation_amount: number
  image_url: string | null
  // ⭐ NUEVOS CAMPOS DE PRODUCTO
  product_name: string | null
  product_description: string | null
  product_image_url: string | null
  // FIN NUEVOS CAMPOS
  prize_title: string | null
  prize_image_url: string | null
  prize_type: 'material' | 'experiencia' | 'digital' | null
  draw_date: string | null
  start_date: string
  end_date: string | null
  status: 'draft' | 'active' | 'ended' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface Donation {
  id: string
  campaign_id: string
  amount: number
  donation_portion: number
  product_portion: number
  email: string | null
  name?: string
  stripe_payment_id: string
  stripe_session_id?: string
  enters_draw: boolean
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  created_at: string
}

// Helper functions
export async function getCampaignBySlug(slug: string): Promise<Campaign | null> {
  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      organization:organizations(*)
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (error) {
    console.error('Error fetching campaign:', error)
    return null
  }

  return data
}

export async function getAllActiveCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      organization:organizations(*)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching campaigns:', error)
    return []
  }

  return data || []
}

export async function recordDonation(donation: Omit<Donation, 'id' | 'created_at'>): Promise<Donation | null> {
  const { data, error } = await supabase
    .from('donations')
    .insert(donation)
    .select()
    .single()

  if (error) {
    console.error('Error recording donation:', error)
    return null
  }

  return data
}

export async function updateCampaignAmount(campaignId: string, donationAmount: number): Promise<boolean> {
  const { error } = await supabase.rpc('increment_campaign_amount', {
    campaign_id: campaignId,
    amount: donationAmount
  })

  if (error) {
    console.error('Error updating campaign amount:', error)
    return false
  }

  return true
}

export async function getDonationsByCampaign(campaignId: string): Promise<Donation[]> {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching donations:', error)
    return []
  }

  return data || []
}

export async function getCampaignStats(campaignId: string) {
  const { data, error } = await supabase
    .from('donations')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('status', 'completed')

  if (error) {
    console.error('Error fetching stats:', error)
    return { totalDonations: 0, totalAmount: 0, drawParticipants: 0 }
  }

  return {
    totalDonations: data?.length || 0,
    totalAmount: data?.reduce((sum, d) => sum + d.donation_portion, 0) || 0,
    drawParticipants: data?.filter(d => d.enters_draw).length || 0
  }
}

export async function getGlobalStats() {
  const { data, error } = await supabase
    .from('donations')
    .select('donation_portion')
    .eq('status', 'completed')

  if (error) {
    console.error('Error fetching global stats:', error)
    return { totalRaised: 0, totalParticipants: 0 }
  }

  return {
    totalRaised: data?.reduce((sum, d) => sum + d.donation_portion, 0) || 0,
    totalParticipants: data?.length || 0
  }
}

// Helper para calcular el objetivo y progreso actual según milestones
export function getCurrentMilestone(campaign: Campaign) {
  const current = campaign.current_amount
  const m1 = campaign.goal_milestone_1 || 0
  const m2 = campaign.goal_milestone_2 || 0
  const m3 = campaign.goal_milestone_3 || campaign.goal_amount

  // Si no hay milestones configurados, usar el sistema antiguo
  if (!m1 && !m2) {
    return {
      phase: 1,
      currentGoal: m3,
      previousGoal: 0,
      progress: (current / m3) * 100,
      phaseLabel: 'Objetivo Final'
    }
  }

  // Fase 1: Hasta milestone 1
  if (current < m1) {
    return {
      phase: 1,
      currentGoal: m1,
      previousGoal: 0,
      progress: (current / m1) * 100,
      phaseLabel: 'Objetivo 1'
    }
  }

  // Fase 2: Entre milestone 1 y 2
  if (m2 && current < m2) {
    return {
      phase: 2,
      currentGoal: m2,
      previousGoal: m1,
      progress: ((current - m1) / (m2 - m1)) * 100,
      phaseLabel: 'Objetivo 2'
    }
  }

  // Fase 3: Entre milestone 2 y 3 (final)
  return {
    phase: 3,
    currentGoal: m3,
    previousGoal: m2 || m1,
    progress: ((current - (m2 || m1)) / (m3 - (m2 || m1))) * 100,
    phaseLabel: 'Objetivo 3'
  }
}

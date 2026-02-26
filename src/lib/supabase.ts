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
  slug: string
  title: string
  subtitle?: string
  description: string
  cause_type: 'escolar' | 'deportiva' | 'social'
  image_url?: string
  goal_amount: number
  current_amount: number
  product_price: number
  donation_amount: number
  prize_title?: string
  prize_description?: string
  prize_image_url?: string
  prize_type?: 'material' | 'experiencia' | 'digital'
  draw_date?: string
  start_date: string
  end_date?: string
  status: 'draft' | 'active' | 'ended' | 'cancelled'
  created_at: string
  // Joined data
  organization?: Organization
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
    .select('donation_amount')
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

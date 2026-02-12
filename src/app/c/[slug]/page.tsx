import { notFound } from 'next/navigation'
import { getCampaignBySlug, getCampaignStats } from '@/lib/supabase'
import CampaignLanding from '@/components/CampaignLanding'

export const revalidate = 30 // Revalidate every 30 seconds

interface PageProps {
  params: { slug: string }
}

export default async function CampaignPage({ params }: PageProps) {
  const campaign = await getCampaignBySlug(params.slug)

  if (!campaign) {
    notFound()
  }

  const stats = await getCampaignStats(campaign.id)

  return <CampaignLanding campaign={campaign} stats={stats} />
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const campaign = await getCampaignBySlug(params.slug)

  if (!campaign) {
    return { title: 'Campaña no encontrada' }
  }

  return {
    title: `${campaign.title} | Cause4All`,
    description: campaign.description,
    openGraph: {
      title: campaign.title,
      description: campaign.description,
      images: campaign.image_url ? [campaign.image_url] : [],
    },
  }
}

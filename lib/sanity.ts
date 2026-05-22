import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: process.env.NODE_ENV === 'production',
  token: process.env.SANITY_API_TOKEN,
})

const builder = imageUrlBuilder(sanityClient)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

// ─── Queries ─────────────────────────────────────────────────────

export async function getArtists() {
  return sanityClient.fetch(`
    *[_type == "artist"] | order(name asc) {
      _id, name, slug, bio, genre, photo, socialLinks, featured
    }
  `)
}

export async function getArtistBySlug(slug: string) {
  return sanityClient.fetch(
    `*[_type == "artist" && slug.current == $slug][0] {
      _id, name, slug, bio, genre, photo, socialLinks, releases
    }`,
    { slug }
  )
}

export async function getEvents(limit = 20) {
  return sanityClient.fetch(`
    *[_type == "event"] | order(eventDate asc) [0...$limit] {
      _id, title, slug, eventDate, venue, ticketUrl, image, description
    }
  `, { limit })
}

export async function getUpcomingEvents(limit = 4) {
  const now = new Date().toISOString()
  return sanityClient.fetch(`
    *[_type == "event" && eventDate >= $now] | order(eventDate asc) [0...$limit] {
      _id, title, slug, eventDate, venue, ticketUrl, image
    }
  `, { now, limit })
}

export async function getNewsPosts(limit = 20) {
  return sanityClient.fetch(`
    *[_type == "newsPost"] | order(publishedAt desc) [0...$limit] {
      _id, title, slug, publishedAt, excerpt, coverImage, category
    }
  `, { limit })
}

export async function getNewsPostBySlug(slug: string) {
  return sanityClient.fetch(
    `*[_type == "newsPost" && slug.current == $slug][0] {
      _id, title, slug, publishedAt, body, coverImage, category
    }`,
    { slug }
  )
}

export async function getMembershipTiers() {
  return sanityClient.fetch(`
    *[_type == "membershipTier"] | order(order asc) {
      _id, name, price, interval, perks, stripePriceId, highlighted
    }
  `)
}

export async function getFeaturedArtists(limit = 6) {
  return sanityClient.fetch(`
    *[_type == "artist" && featured == true] | order(name asc) [0...$limit] {
      _id, name, slug, genre, photo
    }
  `, { limit })
}

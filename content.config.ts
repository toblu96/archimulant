import { defineContentConfig, defineCollection, z } from '@nuxt/content'

// The four metric-aligned catalog groups plus the beginner on-ramp.
// `group` drives how /learn buckets the catalog.
const LearnGroup = z.enum([
  'foundations',
  'availability',
  'performance',
  'decoupling',
  'cost'
])

export default defineContentConfig({
  collections: {
    learn: defineCollection({
      type: 'page',
      source: 'learn/**.md',
      // Frontmatter contract for every learn page. `title` and `description`
      // come from the built-in page schema; the rest is Archimulant-specific.
      schema: z.object({
        group: LearnGroup,
        summary: z.string(),
        tags: z.array(z.string()).default([]),
        // Canonical industry pattern name, for credibility + external linking.
        canonicalPattern: z.string().optional(),
        // Scenario ids that exercise this concept - the reverse of an
        // improvement's `learnMoreSlug`. Powers the "In Archimulant" backlink.
        usedIn: z.array(z.string()).default([]),
        goDeeper: z.array(z.object({
          label: z.string(),
          url: z.string()
        })).default([]),
        order: z.number().default(100)
      })
    })
  }
})

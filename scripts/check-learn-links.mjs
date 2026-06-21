// Guard: every `learnMoreSlug` referenced by a scenario improvement must have a
// matching learn page at content/learn/<slug>.md. Prevents dead "Learn more"
// links when scenarios are edited. Run with: pnpm check:learn-links
//
// Zero dependencies so it runs in CI without a test runner. Can be promoted to
// a vitest case later if/when a test runner is added.

import { readdirSync, readFileSync } from 'node:fs'
import { join, basename } from 'node:path'

const SCENARIOS_DIR = 'server/data/scenarios'
const LEARN_DIR = 'content/learn'

// Collect every learnMoreSlug referenced by scenarios, with its source scenario.
const referenced = new Map() // slug -> Set<scenarioFile>
for (const file of readdirSync(SCENARIOS_DIR).filter(f => f.endsWith('.json'))) {
  const scenario = JSON.parse(readFileSync(join(SCENARIOS_DIR, file), 'utf8'))
  for (const improvement of scenario.improvements ?? []) {
    const slug = improvement.learnMoreSlug
    if (!slug) continue
    if (!referenced.has(slug)) referenced.set(slug, new Set())
    referenced.get(slug).add(file)
  }
}

// Slugs that actually have a content page.
const existing = new Set(
  readdirSync(LEARN_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => basename(f, '.md'))
)

const missing = [...referenced.keys()].filter(slug => !existing.has(slug)).sort()
const orphans = [...existing].filter(slug => !referenced.has(slug)).sort()

if (orphans.length) {
  // Informational only - foundations and catalog-expansion pages legitimately
  // aren't referenced by any scenario yet.
  console.log(`ℹ ${orphans.length} learn page(s) not referenced by any scenario: ${orphans.join(', ')}`)
}

if (missing.length) {
  console.error('\n✖ Missing learn pages for referenced learnMoreSlug values:')
  for (const slug of missing) {
    const sources = [...referenced.get(slug)].join(', ')
    console.error(`  - ${slug}  →  expected ${LEARN_DIR}/${slug}.md  (used by ${sources})`)
  }
  console.error('')
  process.exit(1)
}

console.log(`✓ All ${referenced.size} referenced learnMoreSlug value(s) resolve to a learn page.`)

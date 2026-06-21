// Display metadata for the learn catalog groups, in presentation order.
// `key` matches the `group` field in each learn page's frontmatter
// (see content.config.ts).
export interface LearnGroup {
  key: 'foundations' | 'availability' | 'performance' | 'decoupling' | 'cost'
  label: string
  icon: string
  description: string
}

export const LEARN_GROUPS: LearnGroup[] = [
  {
    key: 'foundations',
    label: 'Foundations',
    icon: 'i-tabler-compass',
    description: 'New to architecture? Start here for the core ideas the game builds on.'
  },
  {
    key: 'availability',
    label: 'Availability & Resilience',
    icon: 'i-tabler-heartbeat',
    description: 'Keep the system serving requests even when parts of it fail.'
  },
  {
    key: 'performance',
    label: 'Performance & Scale',
    icon: 'i-tabler-bolt',
    description: 'Lower latency and raise throughput as load grows.'
  },
  {
    key: 'decoupling',
    label: 'Decoupling & Evolvability',
    icon: 'i-tabler-puzzle',
    description: 'Keep services independent so the system stays easy to change.'
  },
  {
    key: 'cost',
    label: 'Cost & Trade-offs',
    icon: 'i-tabler-coin',
    description: 'Every improvement has a price - learn to spend the budget well.'
  }
]

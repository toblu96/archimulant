<script setup lang="ts">
definePageMeta({
  layout: 'landing',
  auth: false
})
</script>

<template>
  <div>
    <UPageHero
      orientation="horizontal"
      headline="Interactive Architecture Simulator"
      title="Think in systems. Design under pressure."
      description="Apply architectural patterns to a live system topology and watch your decisions impact availability, latency, and cost — in real time, under a fixed budget."
      :links="[
        {
          label: 'Try a scenario',
          to: '/play',
          trailingIcon: 'i-tabler-arrow-right',
          size: 'lg'
        },
        {
          label: 'Explore concepts',
          to: '/learn',
          size: 'lg',
          color: 'neutral',
          variant: 'ghost'
        }
      ]"
    >
      <TopologyPreview />
    </UPageHero>

    <UPageSection
      title="How it works"
      description="Archimulant makes software architecture tangible. No theory slides — just a system to improve and metrics that respond to every decision."
      :features="[
        {
          icon: 'i-tabler-network',
          title: 'Simulate a live system',
          description: 'Work with an interactive topology of services, databases, and queues. Apply improvements like caching, replication, and circuit breakers under a fixed budget and watch the numbers move.'
        },
        {
          icon: 'i-tabler-school',
          title: 'Learn the patterns behind it',
          description: 'Every improvement links to the architectural theory. Understand availability math, latency paths, and throughput bottlenecks — not just which button clicks.'
        },
        {
          icon: 'i-tabler-trophy',
          title: 'Compete in tournaments',
          description: 'Create a tournament room, share a join code, and challenge your team or class to solve the same scenario. Who builds the best architecture under the same constraints?'
        }
      ]"
    />

    <UPageSection>
      <UPageCTA
        title="No account needed to start"
        description="Jump into a predefined scenario right now. Create an account later to build your own scenarios or run a tournament with your team."
        variant="subtle"
        :links="[
          {
            label: 'Play now',
            to: '/play',
            trailingIcon: 'i-tabler-arrow-right'
          },
          {
            label: 'Read the docs',
            to: '/learn',
            color: 'neutral',
            variant: 'ghost'
          }
        ]"
      />
    </UPageSection>
  </div>
</template>

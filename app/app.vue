<script setup>
useSeoMeta({
  title: 'Archimulant',
  description: 'An interactive architecture simulator. Design distributed systems under budget constraints and see how your decisions impact availability, latency, and cost.',
  ogTitle: 'Archimulant',
  ogDescription: 'An interactive architecture simulator. Design distributed systems under budget constraints and see how your decisions impact availability, latency, and cost.',
  twitterCard: 'summary_large_image'
})

useHead({
  htmlAttrs: { lang: 'en' },
  link: [{ rel: 'icon', href: '/favicon.ico' }]
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

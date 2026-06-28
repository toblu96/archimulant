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
  link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]
})

onMounted(() => {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')

  const updateFavicon = (e) => {
    const link = document.querySelector('link[rel=\'icon\'][type=\'image/svg+xml\']')
    if (!link) return
    // Force browser to re-fetch by busting the cache
    link.href = `/favicon.svg?v=${e.matches ? 'dark' : 'light'}`
  }

  mq.addEventListener('change', updateFavicon)
  onUnmounted(() => mq.removeEventListener('change', updateFavicon))
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

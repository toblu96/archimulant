<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import { authClient } from '~~/lib/auth-client'

definePageMeta({
  auth: false
})

const route = useRoute()
const callbackURL = computed(() => (route.query.redirect as string | undefined) ?? '/')

const providers = ref<ButtonProps[]>([
  {
    label: 'GitHub',
    icon: 'i-simple-icons-github',
    color: 'neutral',
    variant: 'subtle',
    onClick: () => { authClient.signIn.social({ provider: 'github', callbackURL: callbackURL.value }) }
  },
  {
    label: 'Google',
    icon: 'i-simple-icons-google',
    color: 'neutral',
    variant: 'subtle',
    onClick: () => { authClient.signIn.social({ provider: 'google', callbackURL: callbackURL.value }) },
    disabled: true
  }
])
</script>

<template>
  <div class="flex items-center justify-center p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        title="Welcome back!"
        description="Choose your favorite provider to login."
        icon="i-lucide-user"
        :providers="providers"
        class="max-w-md"
      />
    </UPageCard>
  </div>
</template>

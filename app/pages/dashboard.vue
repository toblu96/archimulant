<script setup lang="ts">
import { authClient } from '~~/lib/auth-client'

// const { data: session } = await authClient.getSession()

const signOut = async () => {
  const signedOut = await authClient.signOut()
  if (signedOut.data?.success) navigateTo('/')
}
</script>

<template>
  <div class="flex items-center justify-center p-4 pt-20">
    <div class="w-full max-w-md">
      <UAlert
        title="🚧 Under construction.."
        description="Features like tournament and creation of own scenarios are still under construction."
        color="warning"
        variant="subtle"
        orientation="horizontal"
        :actions="[
          {
            label: 'Log Out',
            color: 'neutral',
            variant: 'subtle',
            onClick: () => signOut()
          }
        ]"
      />
    </div>
  </div>
</template>

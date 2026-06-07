<script setup lang="ts">
import { authClient } from '~~/lib/auth-client'

// const { data: session } = await authClient.getSession()

const signOut = async () => {
  const signedOut = await authClient.signOut()
  if (signedOut.data?.success) navigateTo('/')
}
</script>

<template>
  <div>
    <UButton @click="signOut()">
      Log Out
    </UButton>
  </div>
</template>

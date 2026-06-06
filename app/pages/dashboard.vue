<script setup lang="ts">
import { authClient } from '~~/lib/auth-client'

// const { data: session } = await authClient.getSession()
</script>

<template>
  <div>
    <UButton @click="authClient.signOut()">
      Log Out
    </UButton>
  </div>
</template>

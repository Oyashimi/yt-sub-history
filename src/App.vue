<script setup lang="ts">
import AppFooter from '@/components/AppFooter.vue'
</script>

<template>
  <div class="bg-aurora min-h-dvh flex flex-col">
    <RouterView v-slot="{ Component }">
      <component :is="Component" class="flex-1" />
    </RouterView>
    <AppFooter />
  </div>
</template>

<template>
  <div class="bg-aurora min-h-dvh flex flex-col">
    <RouterView v-slot="{ Component }">
      <component :is="Component" class="flex-1" />
    </RouterView>
  </div>
</template>

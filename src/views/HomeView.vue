<script setup lang="ts">
import { ref } from 'vue'
import LandingHero from '@/components/LandingHero.vue'
import LoadingPanel from '@/components/LoadingPanel.vue'
import ErrorPanel from '@/components/ErrorPanel.vue'
import ResultDashboard from '@/components/ResultDashboard.vue'
import { useAuth } from '@/composables/useAuth'
import { useSubscriptions } from '@/composables/useSubscriptions'
import { isAppError } from '@/lib/errors'

const { signIn, signOut, isConfigured } = useAuth()
const { status, errorKind, progress, load, reset } = useSubscriptions()

const configError = ref<string | null>(null)

async function start() {
  configError.value = null
  try {
    const token = await signIn()
    await load(token)
  } catch (e) {
    if (isAppError(e)) {
      // errorKind は load 内で設定済み。signIn 段階の失敗はここで拾う
      if (status.value !== 'error') {
        status.value = 'error'
        errorKind.value = e.kind
      }
      if (e.kind === 'unknown' && !isConfigured) configError.value = e.message
    } else {
      status.value = 'error'
      errorKind.value = 'unknown'
    }
  }
}

function retry() {
  reset()
  void start()
}

function logout() {
  signOut()
  reset()
}
</script>

<template>
  <main>
    <LandingHero v-if="status === 'idle'" :config-error="configError" @start="start" />
    <LoadingPanel v-else-if="status === 'loading'" :progress="progress" />
    <ErrorPanel
      v-else-if="status === 'error'"
      :kind="errorKind ?? 'unknown'"
      :detail="configError"
      @retry="retry"
      @back="reset"
    />
    <ResultDashboard v-else @logout="logout" />
  </main>
</template>

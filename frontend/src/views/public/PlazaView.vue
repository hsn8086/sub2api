<template>
  <div
    class="relative flex min-h-screen flex-col bg-gradient-to-br from-gray-50 via-primary-50/30 to-gray-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950"
  >
    <!-- Header -->
    <header class="relative z-20 px-6 py-4">
      <nav class="mx-auto flex max-w-6xl items-center justify-between">
        <router-link to="/home" class="flex items-center gap-3">
          <div class="h-10 w-10 overflow-hidden rounded-xl shadow-md">
            <img :src="siteLogo || '/logo.png'" alt="Logo" class="h-full w-full object-contain" />
          </div>
          <span class="text-lg font-semibold text-gray-800 dark:text-white">{{ siteName }}</span>
        </router-link>
        <div class="flex items-center gap-3">
          <LocaleSwitcher />
          <router-link
            to="/login"
            class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700"
          >
            {{ t('home.login') }}
          </router-link>
        </div>
      </nav>
    </header>

    <!-- Body -->
    <main class="relative z-10 mx-auto w-full max-w-6xl flex-1 px-6 pb-16 pt-4">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
          {{ t('plaza.title') }}
        </h1>
        <p class="mt-2 text-gray-500 dark:text-dark-400">{{ t('plaza.subtitle') }}</p>
      </div>

      <!-- Controls -->
      <div class="mb-6 space-y-3 rounded-xl border border-gray-200 bg-white/60 p-4 dark:border-dark-700 dark:bg-dark-800/40">
        <!-- Search -->
        <div class="relative">
          <input
            v-model="search"
            type="text"
            :placeholder="t('plaza.searchPlaceholder')"
            class="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-900 dark:text-white"
          />
        </div>

        <!-- Platform filter -->
        <div class="flex flex-wrap items-center gap-2">
          <span class="w-14 shrink-0 text-xs font-medium text-gray-400 dark:text-dark-500">{{ t('plaza.platform') }}</span>
          <button
            v-for="p in platformOptions"
            :key="p"
            type="button"
            class="rounded-full px-3 py-1 text-xs font-medium transition-colors"
            :class="
              activePlatform === p
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-700 dark:text-dark-300 dark:hover:bg-dark-600'
            "
            @click="activePlatform = p"
          >
            {{ p === 'all' ? t('plaza.allPlatforms') : p }}
          </button>
        </div>

        <!-- Group filter -->
        <div v-if="groupOptions.length > 2" class="flex flex-wrap items-center gap-2">
          <span class="w-14 shrink-0 text-xs font-medium text-gray-400 dark:text-dark-500">{{ t('plaza.group') }}</span>
          <button
            v-for="grp in groupOptions"
            :key="grp"
            type="button"
            class="rounded-full px-3 py-1 text-xs font-medium transition-colors"
            :class="
              activeGroup === grp
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-700 dark:text-dark-300 dark:hover:bg-dark-600'
            "
            @click="activeGroup = grp"
          >
            {{ grp === 'all' ? t('plaza.allGroups') : grp }}
          </button>
        </div>

        <!-- Count + clear -->
        <div class="flex items-center justify-between pt-1 text-xs text-gray-400 dark:text-dark-500">
          <span>{{ t('plaza.countLabel', { n: filteredModels.length, total: models.length }) }}</span>
          <button
            v-if="search || activePlatform !== 'all' || activeGroup !== 'all'"
            type="button"
            class="text-primary-600 hover:underline dark:text-primary-400"
            @click="resetFilters"
          >
            {{ t('plaza.clearFilters') }}
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="py-20 text-center text-gray-500 dark:text-dark-400">
        {{ t('plaza.loading') }}
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-600 dark:border-red-900/40 dark:bg-red-900/10 dark:text-red-400"
      >
        {{ t('plaza.loadError') }}
      </div>

      <!-- Empty -->
      <div v-else-if="filteredModels.length === 0" class="py-20 text-center text-gray-500 dark:text-dark-400">
        {{ t('plaza.empty') }}
      </div>

      <!-- Model grid -->
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="m in filteredModels"
          :key="m.platform + '::' + m.name"
          class="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-dark-700 dark:bg-dark-800"
        >
          <div class="mb-3 flex items-start justify-between gap-2">
            <span class="break-all font-mono text-sm font-semibold text-gray-900 dark:text-white">{{ m.name }}</span>
            <span
              class="shrink-0 rounded-md bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300"
            >{{ m.platform }}</span>
          </div>

          <div class="mb-3">
            <div class="mb-1 text-[11px] uppercase tracking-wide text-gray-400 dark:text-dark-500">
              {{ t('plaza.groupsLabel', { n: m.groups.length }) }}
            </div>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="g in m.groups"
                :key="g.name"
                class="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs"
                :class="
                  g.subscription_type === 'subscription'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    : 'bg-gray-100 text-gray-600 dark:bg-dark-700 dark:text-dark-300'
                "
              >
                {{ g.name }}
                <span v-if="g.rate_multiplier && g.rate_multiplier !== 1" class="font-mono opacity-70">×{{ g.rate_multiplier }}</span>
              </span>
            </div>
          </div>

          <div class="mt-auto space-y-1 border-t border-gray-100 pt-3 text-xs dark:border-dark-700">
            <template v-if="m.pricing && m.pricing.billing_mode === 'per_request'">
              <div class="flex justify-between">
                <span class="text-gray-500 dark:text-dark-400">{{ t('plaza.perRequest') }}</span>
                <span class="font-medium text-gray-800 dark:text-white">{{ perRequest(m.pricing) }}</span>
              </div>
            </template>
            <template v-else-if="m.pricing && (m.pricing.input_price != null || m.pricing.output_price != null)">
              <div class="flex justify-between">
                <span class="text-gray-500 dark:text-dark-400">{{ t('plaza.input') }}</span>
                <span class="font-medium text-gray-800 dark:text-white">{{ perM(m.pricing.input_price) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 dark:text-dark-400">{{ t('plaza.output') }}</span>
                <span class="font-medium text-gray-800 dark:text-white">{{ perM(m.pricing.output_price) }}</span>
              </div>
            </template>
            <div v-else class="text-gray-400 dark:text-dark-500">{{ t('plaza.priceUnknown') }}</div>
          </div>
        </div>
      </div>
    </main>

    <footer class="relative z-10 border-t border-gray-200 px-6 py-6 text-center text-xs text-gray-400 dark:border-dark-800 dark:text-dark-500">
      {{ siteName }}
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import { getPlazaModels, type PlazaModel } from '@/api/plaza'
import type { UserSupportedModelPricing } from '@/api/channels'

const { t } = useI18n()
const appStore = useAppStore()

const siteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'Sub2API')
const siteLogo = computed(() => appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '')

const loading = ref(true)
const error = ref(false)
const search = ref('')
const activePlatform = ref('all')
const activeGroup = ref('all')
const models = ref<PlazaModel[]>([])

let controller: AbortController | null = null

const platformOptions = computed(() => {
  const set = new Set<string>()
  for (const m of models.value) set.add(m.platform)
  return ['all', ...Array.from(set).sort()]
})

const groupOptions = computed(() => {
  const set = new Set<string>()
  for (const m of models.value) for (const g of m.groups) set.add(g.name)
  return ['all', ...Array.from(set).sort()]
})

const filteredModels = computed(() => {
  const q = search.value.trim().toLowerCase()
  return models.value.filter((m) => {
    if (activePlatform.value !== 'all' && m.platform !== activePlatform.value) return false
    if (activeGroup.value !== 'all' && !m.groups.some((g) => g.name === activeGroup.value)) return false
    if (q && !m.name.toLowerCase().includes(q)) return false
    return true
  })
})

function resetFilters() {
  search.value = ''
  activePlatform.value = 'all'
  activeGroup.value = 'all'
}

function perM(v: number | null | undefined): string {
  if (v == null) return '-'
  return '$' + (v * 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' /1M'
}

function perRequest(p: UserSupportedModelPricing): string {
  if (p.per_request_price == null) return '-'
  return '$' + p.per_request_price.toLocaleString(undefined, { maximumFractionDigits: 4 })
}

async function load() {
  loading.value = true
  error.value = false
  controller = new AbortController()
  try {
    models.value = await getPlazaModels({ signal: controller.signal })
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(load)
onBeforeUnmount(() => controller?.abort())
</script>

import type { Endpoint } from '~/types'
import { defineStore } from 'pinia'

export const useEndpointStore = defineStore('endpoint', () => {
  // State
  const selectedEndpoint = useLocalStorage<string>('selectedEndpoint', '')
  const endpointList = useLocalStorage<Endpoint[]>('endpointList', [])

  // Non-persisted temporary endpoint (used for URL-param silent login)
  const tempEndpoint = ref<Endpoint | null>(null)

  // Getters
  const currentEndpoint = computed(() => {
    // Temporary endpoint takes highest priority (bypasses localStorage)
    if (tempEndpoint.value) return tempEndpoint.value
    return endpointList.value.find(({ id }) => id === selectedEndpoint.value)
  })

  const wsEndpointURL = computed(() => {
    const endpoint = currentEndpoint.value
    if (!endpoint) return ''
    try {
      return new URL(endpoint.url).href
        .replace(/^http/, 'ws')
        .replace(/\/$/, '')
    } catch {
      return ''
    }
  })

  // Actions
  const setSelectedEndpoint = (id: string) => {
    selectedEndpoint.value = id
  }

  const setEndpointList = (list: Endpoint[]) => {
    endpointList.value = list
  }

  const addEndpoint = (endpoint: Endpoint) => {
    endpointList.value = [endpoint, ...endpointList.value]
  }

  const removeEndpoint = (id: string) => {
    endpointList.value = endpointList.value.filter((e) => e.id !== id)
    if (selectedEndpoint.value === id) {
      selectedEndpoint.value = ''
    }
  }

  const updateEndpoint = (id: string, updates: Partial<Endpoint>) => {
    const index = endpointList.value.findIndex((e) => e.id === id)
    const existing = endpointList.value[index]
    if (index !== -1 && existing) {
      endpointList.value[index] = { ...existing, ...updates } as Endpoint
    }
  }

  // Actions for temporary endpoint (URL-param silent login)
  const setTempEndpoint = (endpoint: { url: string; secret: string }) => {
    tempEndpoint.value = { id: '__url_params__', ...endpoint }
  }

  const clearTempEndpoint = () => {
    tempEndpoint.value = null
  }

  return {
    selectedEndpoint,
    endpointList,
    currentEndpoint,
    wsEndpointURL,
    setSelectedEndpoint,
    setEndpointList,
    addEndpoint,
    removeEndpoint,
    updateEndpoint,
    setTempEndpoint,
    clearTempEndpoint,
  }
})

export default defineNuxtRouteMiddleware((to) => {
  // Skip middleware on server
  if (import.meta.server) return

  // Skip endpoint check in mock mode
  const config = useRuntimeConfig()
  if (config.public.mockMode) {
    return
  }

  const endpointStore = useEndpointStore()

  // ── URL 参数静默直连 (Step 2: 注入静默登录逻辑) ──
  // 优先级最高: 检测 URL Query 中的 hostname/port/secret
  // 一旦命中, 立即创建临时端点并跳过 /setup 重定向
  const hostname = to.query.hostname
  const port = to.query.port
  if (hostname && port) {
    const secret = (to.query.secret as string) || ''
    const protocol =
      typeof window !== 'undefined' ? window.location.protocol : 'http:'
    const url = `${protocol}//${hostname}:${port}`

    // 设置非持久化临时端点, 覆盖 LocalStorage 中残留的旧设备数据
    endpointStore.setTempEndpoint({ url, secret })

    // 直接放行, 跳过所有后续的 /setup 重定向逻辑
    return
  }

  const hasEndpoint = !!endpointStore.currentEndpoint

  // Allow access to setup page without endpoint
  if (to.path === '/setup') {
    return
  }

  // Redirect to setup if no endpoint configured
  if (!hasEndpoint) {
    return navigateTo('/setup', { replace: true })
  }
})

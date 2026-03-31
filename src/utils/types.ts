export type HttpResponse = Promise<{
  success: boolean
  error?: string
  data?: Record<string, any>
}>

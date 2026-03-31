export type HttpResponse = Promise<{
  success: boolean
  error?: string
  data?: Record<string, any>
}>

export type AuthOptions = {
  refresh?: boolean
  isOpen?: boolean
}

export type User = {
  id: string
}

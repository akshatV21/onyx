import { SetMetadata } from '@nestjs/common'
import { AUTH_OPTIONS_KEY } from 'src/utils/constants'
import { AuthOptions } from 'src/utils/types'

export const Auth = (options?: AuthOptions) => {
  const final: AuthOptions = {
    isOpen: options?.isOpen ?? false,
    refresh: options?.refresh ?? false,
  }

  return SetMetadata(AUTH_OPTIONS_KEY, final)
}

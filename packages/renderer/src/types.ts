import type { App } from 'vue'
import type { Router } from 'vue-router'

interface CustomContext {
  app: App<Element>
  router: Router
}

export type UserModule = (ctx: CustomContext) => void

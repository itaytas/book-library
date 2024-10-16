import { Router } from 'express'

import { auth } from './auth'
import { books } from './book'
import { loans } from './loan'

const router: Router = Router()

const routes: {
  [key: string]: (router: Router) => void
} = { auth, books, loans }

for (const route in routes) {
  routes[route](router)
}

export { router }

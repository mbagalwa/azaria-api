/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
import transmit from '@adonisjs/transmit/services/main'

// Temps réel (SSE) : /__transmit/events, /subscribe, /unsubscribe.
transmit.registerRoutes()

router.get('/', () => {
  return { hello: 'world' }
})

router
  .group(() => {
    /**
     * Espace PUBLIC — aucune authentification. Le client commande sans compte :
     * il consulte le menu, poste sa commande et la suit avec son code.
     */
    router
      .group(() => {
        router.get('menu', [controllers.PublicMenu, 'show'])
        router.get('menu/week', [controllers.PublicMenu, 'week'])
        router.get('ordering-window', [controllers.PublicMenu, 'window'])
        router.post('orders', [controllers.PublicOrders, 'store'])
        router.get('orders/:code', [controllers.PublicOrders, 'show'])
      })
      .prefix('public')
      .as('public')

    // Auth STAFF uniquement (back-office).
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessTokens, 'store'])
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        router.get('profile', [controllers.Profile, 'show'])
        router.post('logout', [controllers.AccessTokens, 'destroy'])
      })
      .prefix('account')
      .as('profile')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('', [controllers.Dishes, 'index'])
        router.post('', [controllers.Dishes, 'store'])
        router.get(':id', [controllers.Dishes, 'show'])
        router.put(':id', [controllers.Dishes, 'update'])
        router.delete(':id', [controllers.Dishes, 'destroy'])
      })
      .prefix('dishes')
      .as('dishes')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('', [controllers.Accompaniments, 'index'])
        router.post('', [controllers.Accompaniments, 'store'])
        router.get(':id', [controllers.Accompaniments, 'show'])
        router.put(':id', [controllers.Accompaniments, 'update'])
        router.delete(':id', [controllers.Accompaniments, 'destroy'])
      })
      .prefix('accompaniments')
      .as('accompaniments')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('', [controllers.Users, 'index'])
        router.post('', [controllers.Users, 'store'])
        router.get(':id', [controllers.Users, 'show'])
        router.put(':id', [controllers.Users, 'update'])
        router.delete(':id', [controllers.Users, 'destroy'])
      })
      .prefix('users')
      .as('users')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('', [controllers.Settings, 'show'])
        router.put('restaurant', [controllers.Settings, 'updateRestaurant'])
        router.put('notifications', [controllers.Settings, 'updateNotifications'])
      })
      .prefix('settings')
      .as('settings')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('', [controllers.Programs, 'index'])
        router.post('', [controllers.Programs, 'store'])
        router.get(':id', [controllers.Programs, 'show'])
        router.put(':id', [controllers.Programs, 'update'])
        router.delete(':id', [controllers.Programs, 'destroy'])
      })
      .prefix('programs')
      .as('programs')
      .use(middleware.auth())

    router
      .group(() => {
        router.get('', [controllers.Orders, 'index'])
        router.get('stats', [controllers.Orders, 'stats'])
        router.get(':id', [controllers.Orders, 'show'])
        router.put(':id/status', [controllers.Orders, 'updateStatus'])
        router.put(':id/payment', [controllers.Orders, 'updatePayment'])
      })
      .prefix('orders')
      .as('orders')
      .use(middleware.auth())
  })
  .prefix('/api/v1')

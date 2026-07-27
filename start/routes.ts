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
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessTokens, 'store'])
        // Auth CLIENT (app) : par numéro WhatsApp.
        router.post('customer/signup', [controllers.CustomerAuth, 'signup'])
        router.post('customer/login', [controllers.CustomerAuth, 'login'])
      })
      .prefix('auth')
      .as('auth')

    router
      .group(() => {
        router.get('profile', [controllers.Profile, 'show'])
        router.post('logout', [controllers.AccessTokens, 'destroy'])
        // Espace client : menu du jour + ses commandes.
        router.get('menu', [controllers.Menu, 'show'])
        router.get('ordering-window', [controllers.Menu, 'window'])
        router.get('orders', [controllers.CustomerOrders, 'index'])
        router.post('orders', [controllers.CustomerOrders, 'store'])
        router.get('orders/:id', [controllers.CustomerOrders, 'show'])
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

/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'event_stream': {
    methods: ["GET","HEAD"],
    pattern: '/__transmit/events',
    tokens: [{"old":"/__transmit/events","type":0,"val":"__transmit","end":""},{"old":"/__transmit/events","type":0,"val":"events","end":""}],
    types: placeholder as Registry['event_stream']['types'],
  },
  'subscribe': {
    methods: ["POST"],
    pattern: '/__transmit/subscribe',
    tokens: [{"old":"/__transmit/subscribe","type":0,"val":"__transmit","end":""},{"old":"/__transmit/subscribe","type":0,"val":"subscribe","end":""}],
    types: placeholder as Registry['subscribe']['types'],
  },
  'unsubscribe': {
    methods: ["POST"],
    pattern: '/__transmit/unsubscribe',
    tokens: [{"old":"/__transmit/unsubscribe","type":0,"val":"__transmit","end":""},{"old":"/__transmit/unsubscribe","type":0,"val":"unsubscribe","end":""}],
    types: placeholder as Registry['unsubscribe']['types'],
  },
  'public.public_menu.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/public/menu',
    tokens: [{"old":"/api/v1/public/menu","type":0,"val":"api","end":""},{"old":"/api/v1/public/menu","type":0,"val":"v1","end":""},{"old":"/api/v1/public/menu","type":0,"val":"public","end":""},{"old":"/api/v1/public/menu","type":0,"val":"menu","end":""}],
    types: placeholder as Registry['public.public_menu.show']['types'],
  },
  'public.public_menu.week': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/public/menu/week',
    tokens: [{"old":"/api/v1/public/menu/week","type":0,"val":"api","end":""},{"old":"/api/v1/public/menu/week","type":0,"val":"v1","end":""},{"old":"/api/v1/public/menu/week","type":0,"val":"public","end":""},{"old":"/api/v1/public/menu/week","type":0,"val":"menu","end":""},{"old":"/api/v1/public/menu/week","type":0,"val":"week","end":""}],
    types: placeholder as Registry['public.public_menu.week']['types'],
  },
  'public.public_menu.window': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/public/ordering-window',
    tokens: [{"old":"/api/v1/public/ordering-window","type":0,"val":"api","end":""},{"old":"/api/v1/public/ordering-window","type":0,"val":"v1","end":""},{"old":"/api/v1/public/ordering-window","type":0,"val":"public","end":""},{"old":"/api/v1/public/ordering-window","type":0,"val":"ordering-window","end":""}],
    types: placeholder as Registry['public.public_menu.window']['types'],
  },
  'public.public_orders.store': {
    methods: ["POST"],
    pattern: '/api/v1/public/orders',
    tokens: [{"old":"/api/v1/public/orders","type":0,"val":"api","end":""},{"old":"/api/v1/public/orders","type":0,"val":"v1","end":""},{"old":"/api/v1/public/orders","type":0,"val":"public","end":""},{"old":"/api/v1/public/orders","type":0,"val":"orders","end":""}],
    types: placeholder as Registry['public.public_orders.store']['types'],
  },
  'public.public_orders.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/public/orders/:code',
    tokens: [{"old":"/api/v1/public/orders/:code","type":0,"val":"api","end":""},{"old":"/api/v1/public/orders/:code","type":0,"val":"v1","end":""},{"old":"/api/v1/public/orders/:code","type":0,"val":"public","end":""},{"old":"/api/v1/public/orders/:code","type":0,"val":"orders","end":""},{"old":"/api/v1/public/orders/:code","type":1,"val":"code","end":""}],
    types: placeholder as Registry['public.public_orders.show']['types'],
  },
  'auth.new_account.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/signup',
    tokens: [{"old":"/api/v1/auth/signup","type":0,"val":"api","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['auth.new_account.store']['types'],
  },
  'auth.access_tokens.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.access_tokens.store']['types'],
  },
  'profile.profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/profile',
    tokens: [{"old":"/api/v1/account/profile","type":0,"val":"api","end":""},{"old":"/api/v1/account/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/account/profile","type":0,"val":"account","end":""},{"old":"/api/v1/account/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.profile.show']['types'],
  },
  'profile.access_tokens.destroy': {
    methods: ["POST"],
    pattern: '/api/v1/account/logout',
    tokens: [{"old":"/api/v1/account/logout","type":0,"val":"api","end":""},{"old":"/api/v1/account/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/account/logout","type":0,"val":"account","end":""},{"old":"/api/v1/account/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['profile.access_tokens.destroy']['types'],
  },
  'dishes.dishes.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/dishes',
    tokens: [{"old":"/api/v1/dishes","type":0,"val":"api","end":""},{"old":"/api/v1/dishes","type":0,"val":"v1","end":""},{"old":"/api/v1/dishes","type":0,"val":"dishes","end":""}],
    types: placeholder as Registry['dishes.dishes.index']['types'],
  },
  'dishes.dishes.store': {
    methods: ["POST"],
    pattern: '/api/v1/dishes',
    tokens: [{"old":"/api/v1/dishes","type":0,"val":"api","end":""},{"old":"/api/v1/dishes","type":0,"val":"v1","end":""},{"old":"/api/v1/dishes","type":0,"val":"dishes","end":""}],
    types: placeholder as Registry['dishes.dishes.store']['types'],
  },
  'dishes.dishes.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/dishes/:id',
    tokens: [{"old":"/api/v1/dishes/:id","type":0,"val":"api","end":""},{"old":"/api/v1/dishes/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/dishes/:id","type":0,"val":"dishes","end":""},{"old":"/api/v1/dishes/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['dishes.dishes.show']['types'],
  },
  'dishes.dishes.update': {
    methods: ["PUT"],
    pattern: '/api/v1/dishes/:id',
    tokens: [{"old":"/api/v1/dishes/:id","type":0,"val":"api","end":""},{"old":"/api/v1/dishes/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/dishes/:id","type":0,"val":"dishes","end":""},{"old":"/api/v1/dishes/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['dishes.dishes.update']['types'],
  },
  'dishes.dishes.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/dishes/:id',
    tokens: [{"old":"/api/v1/dishes/:id","type":0,"val":"api","end":""},{"old":"/api/v1/dishes/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/dishes/:id","type":0,"val":"dishes","end":""},{"old":"/api/v1/dishes/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['dishes.dishes.destroy']['types'],
  },
  'accompaniments.accompaniments.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/accompaniments',
    tokens: [{"old":"/api/v1/accompaniments","type":0,"val":"api","end":""},{"old":"/api/v1/accompaniments","type":0,"val":"v1","end":""},{"old":"/api/v1/accompaniments","type":0,"val":"accompaniments","end":""}],
    types: placeholder as Registry['accompaniments.accompaniments.index']['types'],
  },
  'accompaniments.accompaniments.store': {
    methods: ["POST"],
    pattern: '/api/v1/accompaniments',
    tokens: [{"old":"/api/v1/accompaniments","type":0,"val":"api","end":""},{"old":"/api/v1/accompaniments","type":0,"val":"v1","end":""},{"old":"/api/v1/accompaniments","type":0,"val":"accompaniments","end":""}],
    types: placeholder as Registry['accompaniments.accompaniments.store']['types'],
  },
  'accompaniments.accompaniments.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/accompaniments/:id',
    tokens: [{"old":"/api/v1/accompaniments/:id","type":0,"val":"api","end":""},{"old":"/api/v1/accompaniments/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/accompaniments/:id","type":0,"val":"accompaniments","end":""},{"old":"/api/v1/accompaniments/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['accompaniments.accompaniments.show']['types'],
  },
  'accompaniments.accompaniments.update': {
    methods: ["PUT"],
    pattern: '/api/v1/accompaniments/:id',
    tokens: [{"old":"/api/v1/accompaniments/:id","type":0,"val":"api","end":""},{"old":"/api/v1/accompaniments/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/accompaniments/:id","type":0,"val":"accompaniments","end":""},{"old":"/api/v1/accompaniments/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['accompaniments.accompaniments.update']['types'],
  },
  'accompaniments.accompaniments.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/accompaniments/:id',
    tokens: [{"old":"/api/v1/accompaniments/:id","type":0,"val":"api","end":""},{"old":"/api/v1/accompaniments/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/accompaniments/:id","type":0,"val":"accompaniments","end":""},{"old":"/api/v1/accompaniments/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['accompaniments.accompaniments.destroy']['types'],
  },
  'users.users.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/users',
    tokens: [{"old":"/api/v1/users","type":0,"val":"api","end":""},{"old":"/api/v1/users","type":0,"val":"v1","end":""},{"old":"/api/v1/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['users.users.index']['types'],
  },
  'users.users.store': {
    methods: ["POST"],
    pattern: '/api/v1/users',
    tokens: [{"old":"/api/v1/users","type":0,"val":"api","end":""},{"old":"/api/v1/users","type":0,"val":"v1","end":""},{"old":"/api/v1/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['users.users.store']['types'],
  },
  'users.users.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/users/:id',
    tokens: [{"old":"/api/v1/users/:id","type":0,"val":"api","end":""},{"old":"/api/v1/users/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/users/:id","type":0,"val":"users","end":""},{"old":"/api/v1/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['users.users.show']['types'],
  },
  'users.users.update': {
    methods: ["PUT"],
    pattern: '/api/v1/users/:id',
    tokens: [{"old":"/api/v1/users/:id","type":0,"val":"api","end":""},{"old":"/api/v1/users/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/users/:id","type":0,"val":"users","end":""},{"old":"/api/v1/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['users.users.update']['types'],
  },
  'users.users.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/users/:id',
    tokens: [{"old":"/api/v1/users/:id","type":0,"val":"api","end":""},{"old":"/api/v1/users/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/users/:id","type":0,"val":"users","end":""},{"old":"/api/v1/users/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['users.users.destroy']['types'],
  },
  'settings.settings.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/settings',
    tokens: [{"old":"/api/v1/settings","type":0,"val":"api","end":""},{"old":"/api/v1/settings","type":0,"val":"v1","end":""},{"old":"/api/v1/settings","type":0,"val":"settings","end":""}],
    types: placeholder as Registry['settings.settings.show']['types'],
  },
  'settings.settings.update_restaurant': {
    methods: ["PUT"],
    pattern: '/api/v1/settings/restaurant',
    tokens: [{"old":"/api/v1/settings/restaurant","type":0,"val":"api","end":""},{"old":"/api/v1/settings/restaurant","type":0,"val":"v1","end":""},{"old":"/api/v1/settings/restaurant","type":0,"val":"settings","end":""},{"old":"/api/v1/settings/restaurant","type":0,"val":"restaurant","end":""}],
    types: placeholder as Registry['settings.settings.update_restaurant']['types'],
  },
  'settings.settings.update_notifications': {
    methods: ["PUT"],
    pattern: '/api/v1/settings/notifications',
    tokens: [{"old":"/api/v1/settings/notifications","type":0,"val":"api","end":""},{"old":"/api/v1/settings/notifications","type":0,"val":"v1","end":""},{"old":"/api/v1/settings/notifications","type":0,"val":"settings","end":""},{"old":"/api/v1/settings/notifications","type":0,"val":"notifications","end":""}],
    types: placeholder as Registry['settings.settings.update_notifications']['types'],
  },
  'programs.programs.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/programs',
    tokens: [{"old":"/api/v1/programs","type":0,"val":"api","end":""},{"old":"/api/v1/programs","type":0,"val":"v1","end":""},{"old":"/api/v1/programs","type":0,"val":"programs","end":""}],
    types: placeholder as Registry['programs.programs.index']['types'],
  },
  'programs.programs.store': {
    methods: ["POST"],
    pattern: '/api/v1/programs',
    tokens: [{"old":"/api/v1/programs","type":0,"val":"api","end":""},{"old":"/api/v1/programs","type":0,"val":"v1","end":""},{"old":"/api/v1/programs","type":0,"val":"programs","end":""}],
    types: placeholder as Registry['programs.programs.store']['types'],
  },
  'programs.programs.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/programs/:id',
    tokens: [{"old":"/api/v1/programs/:id","type":0,"val":"api","end":""},{"old":"/api/v1/programs/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/programs/:id","type":0,"val":"programs","end":""},{"old":"/api/v1/programs/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['programs.programs.show']['types'],
  },
  'programs.programs.update': {
    methods: ["PUT"],
    pattern: '/api/v1/programs/:id',
    tokens: [{"old":"/api/v1/programs/:id","type":0,"val":"api","end":""},{"old":"/api/v1/programs/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/programs/:id","type":0,"val":"programs","end":""},{"old":"/api/v1/programs/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['programs.programs.update']['types'],
  },
  'programs.programs.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/programs/:id',
    tokens: [{"old":"/api/v1/programs/:id","type":0,"val":"api","end":""},{"old":"/api/v1/programs/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/programs/:id","type":0,"val":"programs","end":""},{"old":"/api/v1/programs/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['programs.programs.destroy']['types'],
  },
  'orders.orders.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/orders',
    tokens: [{"old":"/api/v1/orders","type":0,"val":"api","end":""},{"old":"/api/v1/orders","type":0,"val":"v1","end":""},{"old":"/api/v1/orders","type":0,"val":"orders","end":""}],
    types: placeholder as Registry['orders.orders.index']['types'],
  },
  'orders.orders.stats': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/orders/stats',
    tokens: [{"old":"/api/v1/orders/stats","type":0,"val":"api","end":""},{"old":"/api/v1/orders/stats","type":0,"val":"v1","end":""},{"old":"/api/v1/orders/stats","type":0,"val":"orders","end":""},{"old":"/api/v1/orders/stats","type":0,"val":"stats","end":""}],
    types: placeholder as Registry['orders.orders.stats']['types'],
  },
  'orders.orders.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/orders/:id',
    tokens: [{"old":"/api/v1/orders/:id","type":0,"val":"api","end":""},{"old":"/api/v1/orders/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/orders/:id","type":0,"val":"orders","end":""},{"old":"/api/v1/orders/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['orders.orders.show']['types'],
  },
  'orders.orders.update_status': {
    methods: ["PUT"],
    pattern: '/api/v1/orders/:id/status',
    tokens: [{"old":"/api/v1/orders/:id/status","type":0,"val":"api","end":""},{"old":"/api/v1/orders/:id/status","type":0,"val":"v1","end":""},{"old":"/api/v1/orders/:id/status","type":0,"val":"orders","end":""},{"old":"/api/v1/orders/:id/status","type":1,"val":"id","end":""},{"old":"/api/v1/orders/:id/status","type":0,"val":"status","end":""}],
    types: placeholder as Registry['orders.orders.update_status']['types'],
  },
  'orders.orders.update_payment': {
    methods: ["PUT"],
    pattern: '/api/v1/orders/:id/payment',
    tokens: [{"old":"/api/v1/orders/:id/payment","type":0,"val":"api","end":""},{"old":"/api/v1/orders/:id/payment","type":0,"val":"v1","end":""},{"old":"/api/v1/orders/:id/payment","type":0,"val":"orders","end":""},{"old":"/api/v1/orders/:id/payment","type":1,"val":"id","end":""},{"old":"/api/v1/orders/:id/payment","type":0,"val":"payment","end":""}],
    types: placeholder as Registry['orders.orders.update_payment']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}

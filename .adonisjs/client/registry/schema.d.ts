/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'event_stream': {
    methods: ["GET","HEAD"]
    pattern: '/__transmit/events'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'subscribe': {
    methods: ["POST"]
    pattern: '/__transmit/subscribe'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'unsubscribe': {
    methods: ["POST"]
    pattern: '/__transmit/unsubscribe'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'public.public_menu.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/public/menu'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/public_menu_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/public_menu_controller').default['show']>>>
    }
  }
  'public.public_menu.week': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/public/menu/week'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/public_menu_controller').default['week']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/public_menu_controller').default['week']>>>
    }
  }
  'public.public_menu.window': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/public/ordering-window'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/public_menu_controller').default['window']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/public_menu_controller').default['window']>>>
    }
  }
  'public.public_orders.store': {
    methods: ["POST"]
    pattern: '/api/v1/public/orders'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/public_order').createPublicOrderValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/public_order').createPublicOrderValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/public_orders_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/public_orders_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'public.public_orders.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/public/orders/:code'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { code: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/public_orders_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/public_orders_controller').default['show']>>>
    }
  }
  'auth.new_account.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.access_tokens.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').loginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').loginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'profile.profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
    }
  }
  'profile.access_tokens.destroy': {
    methods: ["POST"]
    pattern: '/api/v1/account/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/access_tokens_controller').default['destroy']>>>
    }
  }
  'dishes.dishes.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/dishes'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dishes_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dishes_controller').default['index']>>>
    }
  }
  'dishes.dishes.store': {
    methods: ["POST"]
    pattern: '/api/v1/dishes'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/dish').createDishValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/dish').createDishValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dishes_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dishes_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'dishes.dishes.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/dishes/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dishes_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dishes_controller').default['show']>>>
    }
  }
  'dishes.dishes.update': {
    methods: ["PUT"]
    pattern: '/api/v1/dishes/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/dish').updateDishValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/dish').updateDishValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dishes_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dishes_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'dishes.dishes.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/dishes/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/dishes_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/dishes_controller').default['destroy']>>>
    }
  }
  'accompaniments.accompaniments.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/accompaniments'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/accompaniments_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/accompaniments_controller').default['index']>>>
    }
  }
  'accompaniments.accompaniments.store': {
    methods: ["POST"]
    pattern: '/api/v1/accompaniments'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/accompaniment').createAccompanimentValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/accompaniment').createAccompanimentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/accompaniments_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/accompaniments_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'accompaniments.accompaniments.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/accompaniments/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/accompaniments_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/accompaniments_controller').default['show']>>>
    }
  }
  'accompaniments.accompaniments.update': {
    methods: ["PUT"]
    pattern: '/api/v1/accompaniments/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/accompaniment').updateAccompanimentValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/accompaniment').updateAccompanimentValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/accompaniments_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/accompaniments_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'accompaniments.accompaniments.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/accompaniments/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/accompaniments_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/accompaniments_controller').default['destroy']>>>
    }
  }
  'users.users.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['index']>>>
    }
  }
  'users.users.store': {
    methods: ["POST"]
    pattern: '/api/v1/users'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').createUserValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').createUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'users.users.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/users/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['show']>>>
    }
  }
  'users.users.update': {
    methods: ["PUT"]
    pattern: '/api/v1/users/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').updateUserValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/user').updateUserValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'users.users.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/users/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/users_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/users_controller').default['destroy']>>>
    }
  }
  'settings.settings.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['show']>>>
    }
  }
  'settings.settings.update_restaurant': {
    methods: ["PUT"]
    pattern: '/api/v1/settings/restaurant'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/settings').restaurantSettingsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/settings').restaurantSettingsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['updateRestaurant']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['updateRestaurant']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'settings.settings.update_notifications': {
    methods: ["PUT"]
    pattern: '/api/v1/settings/notifications'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/settings').notificationsSettingsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/settings').notificationsSettingsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['updateNotifications']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/settings_controller').default['updateNotifications']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'programs.programs.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/programs'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/programs_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/programs_controller').default['index']>>>
    }
  }
  'programs.programs.store': {
    methods: ["POST"]
    pattern: '/api/v1/programs'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/program').programValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/program').programValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/programs_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/programs_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'programs.programs.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/programs/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/programs_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/programs_controller').default['show']>>>
    }
  }
  'programs.programs.update': {
    methods: ["PUT"]
    pattern: '/api/v1/programs/:id'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/program').programValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/program').programValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/programs_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/programs_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'programs.programs.destroy': {
    methods: ["DELETE"]
    pattern: '/api/v1/programs/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/programs_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/programs_controller').default['destroy']>>>
    }
  }
  'orders.orders.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/orders'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['index']>>>
    }
  }
  'orders.orders.stats': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/orders/stats'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['stats']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['stats']>>>
    }
  }
  'orders.orders.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/orders/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['show']>>>
    }
  }
  'orders.orders.update_status': {
    methods: ["PUT"]
    pattern: '/api/v1/orders/:id/status'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['updateStatus']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['updateStatus']>>>
    }
  }
  'orders.orders.update_payment': {
    methods: ["PUT"]
    pattern: '/api/v1/orders/:id/payment'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['updatePayment']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/orders_controller').default['updatePayment']>>>
    }
  }
}

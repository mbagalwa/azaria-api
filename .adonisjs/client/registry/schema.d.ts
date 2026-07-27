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
  'auth.customer_auth.signup': {
    methods: ["POST"]
    pattern: '/api/v1/auth/customer/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').customerSignupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').customerSignupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/customer_auth_controller').default['signup']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/customer_auth_controller').default['signup']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth.customer_auth.login': {
    methods: ["POST"]
    pattern: '/api/v1/auth/customer/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').customerLoginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').customerLoginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/customer_auth_controller').default['login']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/customer_auth_controller').default['login']>>> | { status: 422; response: { errors: SimpleError[] } }
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
  'profile.menu.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/menu'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/menu_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/menu_controller').default['show']>>>
    }
  }
  'profile.menu.window': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/ordering-window'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/menu_controller').default['window']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/menu_controller').default['window']>>>
    }
  }
  'profile.customer_orders.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/orders'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/customer_orders_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/customer_orders_controller').default['index']>>>
    }
  }
  'profile.customer_orders.store': {
    methods: ["POST"]
    pattern: '/api/v1/account/orders'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/order').createCustomerOrderValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/order').createCustomerOrderValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/customer_orders_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/customer_orders_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'profile.customer_orders.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/account/orders/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/customer_orders_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/customer_orders_controller').default['show']>>>
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

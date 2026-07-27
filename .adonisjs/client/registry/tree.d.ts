/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  eventStream: typeof routes['event_stream']
  subscribe: typeof routes['subscribe']
  unsubscribe: typeof routes['unsubscribe']
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessTokens: {
      store: typeof routes['auth.access_tokens.store']
    }
    customerAuth: {
      signup: typeof routes['auth.customer_auth.signup']
      login: typeof routes['auth.customer_auth.login']
    }
  }
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
    }
    accessTokens: {
      destroy: typeof routes['profile.access_tokens.destroy']
    }
    menu: {
      show: typeof routes['profile.menu.show']
      window: typeof routes['profile.menu.window']
    }
    customerOrders: {
      index: typeof routes['profile.customer_orders.index']
      store: typeof routes['profile.customer_orders.store']
      show: typeof routes['profile.customer_orders.show']
    }
  }
  dishes: {
    dishes: {
      index: typeof routes['dishes.dishes.index']
      store: typeof routes['dishes.dishes.store']
      show: typeof routes['dishes.dishes.show']
      update: typeof routes['dishes.dishes.update']
      destroy: typeof routes['dishes.dishes.destroy']
    }
  }
  users: {
    users: {
      index: typeof routes['users.users.index']
      store: typeof routes['users.users.store']
      show: typeof routes['users.users.show']
      update: typeof routes['users.users.update']
      destroy: typeof routes['users.users.destroy']
    }
  }
  settings: {
    settings: {
      show: typeof routes['settings.settings.show']
      updateRestaurant: typeof routes['settings.settings.update_restaurant']
      updateNotifications: typeof routes['settings.settings.update_notifications']
    }
  }
  programs: {
    programs: {
      index: typeof routes['programs.programs.index']
      store: typeof routes['programs.programs.store']
      show: typeof routes['programs.programs.show']
      update: typeof routes['programs.programs.update']
      destroy: typeof routes['programs.programs.destroy']
    }
  }
  orders: {
    orders: {
      index: typeof routes['orders.orders.index']
      stats: typeof routes['orders.orders.stats']
      show: typeof routes['orders.orders.show']
      updateStatus: typeof routes['orders.orders.update_status']
      updatePayment: typeof routes['orders.orders.update_payment']
    }
  }
}

/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  eventStream: typeof routes['event_stream']
  subscribe: typeof routes['subscribe']
  unsubscribe: typeof routes['unsubscribe']
  public: {
    publicMenu: {
      show: typeof routes['public.public_menu.show']
      week: typeof routes['public.public_menu.week']
      window: typeof routes['public.public_menu.window']
    }
    publicOrders: {
      store: typeof routes['public.public_orders.store']
      show: typeof routes['public.public_orders.show']
    }
  }
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessTokens: {
      store: typeof routes['auth.access_tokens.store']
    }
  }
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
    }
    accessTokens: {
      destroy: typeof routes['profile.access_tokens.destroy']
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
  accompaniments: {
    accompaniments: {
      index: typeof routes['accompaniments.accompaniments.index']
      store: typeof routes['accompaniments.accompaniments.store']
      show: typeof routes['accompaniments.accompaniments.show']
      update: typeof routes['accompaniments.accompaniments.update']
      destroy: typeof routes['accompaniments.accompaniments.destroy']
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

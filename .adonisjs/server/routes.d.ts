import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'event_stream': { paramsTuple?: []; params?: {} }
    'subscribe': { paramsTuple?: []; params?: {} }
    'unsubscribe': { paramsTuple?: []; params?: {} }
    'public.public_menu.show': { paramsTuple?: []; params?: {} }
    'public.public_menu.week': { paramsTuple?: []; params?: {} }
    'public.public_menu.window': { paramsTuple?: []; params?: {} }
    'public.public_orders.store': { paramsTuple?: []; params?: {} }
    'public.public_orders.show': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'dishes.dishes.index': { paramsTuple?: []; params?: {} }
    'dishes.dishes.store': { paramsTuple?: []; params?: {} }
    'dishes.dishes.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'dishes.dishes.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'dishes.dishes.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'accompaniments.accompaniments.index': { paramsTuple?: []; params?: {} }
    'accompaniments.accompaniments.store': { paramsTuple?: []; params?: {} }
    'accompaniments.accompaniments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'accompaniments.accompaniments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'accompaniments.accompaniments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.users.index': { paramsTuple?: []; params?: {} }
    'users.users.store': { paramsTuple?: []; params?: {} }
    'users.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'settings.settings.show': { paramsTuple?: []; params?: {} }
    'settings.settings.update_restaurant': { paramsTuple?: []; params?: {} }
    'settings.settings.update_notifications': { paramsTuple?: []; params?: {} }
    'programs.programs.index': { paramsTuple?: []; params?: {} }
    'programs.programs.store': { paramsTuple?: []; params?: {} }
    'programs.programs.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'programs.programs.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'programs.programs.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'orders.orders.index': { paramsTuple?: []; params?: {} }
    'orders.orders.stats': { paramsTuple?: []; params?: {} }
    'orders.orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'orders.orders.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'orders.orders.update_payment': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'event_stream': { paramsTuple?: []; params?: {} }
    'public.public_menu.show': { paramsTuple?: []; params?: {} }
    'public.public_menu.week': { paramsTuple?: []; params?: {} }
    'public.public_menu.window': { paramsTuple?: []; params?: {} }
    'public.public_orders.show': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'dishes.dishes.index': { paramsTuple?: []; params?: {} }
    'dishes.dishes.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'accompaniments.accompaniments.index': { paramsTuple?: []; params?: {} }
    'accompaniments.accompaniments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.users.index': { paramsTuple?: []; params?: {} }
    'users.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'settings.settings.show': { paramsTuple?: []; params?: {} }
    'programs.programs.index': { paramsTuple?: []; params?: {} }
    'programs.programs.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'orders.orders.index': { paramsTuple?: []; params?: {} }
    'orders.orders.stats': { paramsTuple?: []; params?: {} }
    'orders.orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'event_stream': { paramsTuple?: []; params?: {} }
    'public.public_menu.show': { paramsTuple?: []; params?: {} }
    'public.public_menu.week': { paramsTuple?: []; params?: {} }
    'public.public_menu.window': { paramsTuple?: []; params?: {} }
    'public.public_orders.show': { paramsTuple: [ParamValue]; params: {'code': ParamValue} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'dishes.dishes.index': { paramsTuple?: []; params?: {} }
    'dishes.dishes.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'accompaniments.accompaniments.index': { paramsTuple?: []; params?: {} }
    'accompaniments.accompaniments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.users.index': { paramsTuple?: []; params?: {} }
    'users.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'settings.settings.show': { paramsTuple?: []; params?: {} }
    'programs.programs.index': { paramsTuple?: []; params?: {} }
    'programs.programs.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'orders.orders.index': { paramsTuple?: []; params?: {} }
    'orders.orders.stats': { paramsTuple?: []; params?: {} }
    'orders.orders.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'subscribe': { paramsTuple?: []; params?: {} }
    'unsubscribe': { paramsTuple?: []; params?: {} }
    'public.public_orders.store': { paramsTuple?: []; params?: {} }
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_tokens.store': { paramsTuple?: []; params?: {} }
    'profile.access_tokens.destroy': { paramsTuple?: []; params?: {} }
    'dishes.dishes.store': { paramsTuple?: []; params?: {} }
    'accompaniments.accompaniments.store': { paramsTuple?: []; params?: {} }
    'users.users.store': { paramsTuple?: []; params?: {} }
    'programs.programs.store': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'dishes.dishes.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'accompaniments.accompaniments.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'settings.settings.update_restaurant': { paramsTuple?: []; params?: {} }
    'settings.settings.update_notifications': { paramsTuple?: []; params?: {} }
    'programs.programs.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'orders.orders.update_status': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'orders.orders.update_payment': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'dishes.dishes.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'accompaniments.accompaniments.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'programs.programs.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}
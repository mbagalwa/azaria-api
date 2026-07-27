import { DishSchema } from '#database/schema'

/**
 * Un plat vendable du menu, à prix unique (nom, description, prix, catégorie,
 * image). L'à-la-carte (composants + stock) et les boissons viendront plus tard.
 */
export default class Dish extends DishSchema {}

import type Dish from '#models/dish'
import { BaseTransformer } from '@adonisjs/core/transformers'

/**
 * Forme publique d'un plat renvoyée par l'API. `imagePublicId` reste interne
 * (gestion Cloudinary) et n'est pas exposé.
 */
export default class DishTransformer extends BaseTransformer<Dish> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'name',
      'description',
      'priceCents',
      'category',
      'imageUrl',
      'isAvailable',
      'createdAt',
      'updatedAt',
    ])
  }
}

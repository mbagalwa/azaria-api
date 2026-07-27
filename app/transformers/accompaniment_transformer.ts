import type Accompaniment from '#models/accompaniment'
import { BaseTransformer } from '@adonisjs/core/transformers'

/** Forme publique d'un accompagnement (`imagePublicId` reste interne). */
export default class AccompanimentTransformer extends BaseTransformer<Accompaniment> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'name',
      'description',
      'priceCents',
      'imageUrl',
      'isAvailable',
      'createdAt',
      'updatedAt',
    ])
  }
}

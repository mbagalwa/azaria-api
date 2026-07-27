import Dish from '#models/dish'
import DishTransformer from '#transformers/dish_transformer'
import { createDishValidator, updateDishValidator } from '#validators/dish'
import { destroyDishImage, uploadDishImage } from '#services/cloudinary'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/** Contraintes de l'image de plat acceptée à l'upload. */
const IMAGE_OPTIONS = { size: '5mb', extnames: ['jpg', 'jpeg', 'png', 'webp'] }

export default class DishesController {
  /** Liste des plats, du plus récent au plus ancien. */
  async index({ serialize }: HttpContext) {
    const dishes = await Dish.query().orderBy('created_at', 'desc')
    return serialize(DishTransformer.transform(dishes))
  }

  /** Détail d'un plat. */
  async show({ params, serialize }: HttpContext) {
    const dish = await Dish.findOrFail(params.id)
    return serialize(DishTransformer.transform(dish))
  }

  /** Crée un plat, avec image Cloudinary optionnelle. */
  async store(ctx: HttpContext) {
    this.ensureManager(ctx)
    const { request, serialize } = ctx

    const data = await request.validateUsing(createDishValidator)
    const uploaded = await this.consumeImage(ctx)

    const dish = await Dish.create({
      ...data,
      imageUrl: uploaded?.url ?? null,
      imagePublicId: uploaded?.publicId ?? null,
    })

    return serialize(DishTransformer.transform(dish))
  }

  /** Met à jour un plat (patch partiel). Remplace l'image si un fichier est fourni. */
  async update(ctx: HttpContext) {
    this.ensureManager(ctx)
    const { request, params, serialize } = ctx

    const dish = await Dish.findOrFail(params.id)
    const data = await request.validateUsing(updateDishValidator)
    const uploaded = await this.consumeImage(ctx)

    if (uploaded) {
      const previous = dish.imagePublicId
      dish.imageUrl = uploaded.url
      dish.imagePublicId = uploaded.publicId
      if (previous) await destroyDishImage(previous)
    }

    dish.merge(data)
    await dish.save()

    return serialize(DishTransformer.transform(dish))
  }

  /** Supprime un plat et son image Cloudinary. */
  async destroy(ctx: HttpContext) {
    this.ensureManager(ctx)
    const dish = await Dish.findOrFail(ctx.params.id)
    if (dish.imagePublicId) await destroyDishImage(dish.imagePublicId)
    await dish.delete()
    return { message: 'Plat supprimé.' }
  }

  /**
   * Récupère et téléverse l'éventuel fichier `image` de la requête. Renvoie
   * `null` si aucun fichier n'est joint ; lève une 422 si le fichier est invalide.
   */
  private async consumeImage({ request }: HttpContext) {
    const image = request.file('image', IMAGE_OPTIONS)
    if (!image) return null
    if (!image.isValid) {
      throw new Exception(image.errors[0]?.message ?? 'Image invalide.', {
        status: 422,
        code: 'E_INVALID_IMAGE',
      })
    }
    return uploadDishImage(image.tmpPath!)
  }

  /** Réserve les écritures aux comptes manager (V1 : un seul rôle admin). */
  private ensureManager({ auth }: HttpContext) {
    const user = auth.getUserOrFail()
    if (user.role !== 'manager') {
      throw new Exception("Action réservée à l'administration.", {
        status: 403,
        code: 'E_FORBIDDEN',
      })
    }
  }
}

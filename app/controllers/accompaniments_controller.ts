import Accompaniment from '#models/accompaniment'
import AccompanimentTransformer from '#transformers/accompaniment_transformer'
import {
  createAccompanimentValidator,
  updateAccompanimentValidator,
} from '#validators/accompaniment'
import { destroyImage, uploadAccompanimentImage } from '#services/cloudinary'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/** Contraintes de l'image acceptée à l'upload (identiques aux plats). */
const IMAGE_OPTIONS = { size: '5mb', extnames: ['jpg', 'jpeg', 'png', 'webp'] }

/**
 * Catalogue des accompagnements réutilisables. L'admin les crée ici une fois,
 * puis les rattache aux plats du jour depuis la programmation.
 */
export default class AccompanimentsController {
  /** Liste des accompagnements, par nom. */
  async index({ serialize }: HttpContext) {
    const rows = await Accompaniment.query().orderBy('name', 'asc')
    return serialize(AccompanimentTransformer.transform(rows))
  }

  async show({ params, serialize }: HttpContext) {
    const row = await Accompaniment.findOrFail(params.id)
    return serialize(AccompanimentTransformer.transform(row))
  }

  async store(ctx: HttpContext) {
    this.ensureManager(ctx)
    const { request, serialize } = ctx

    const data = await request.validateUsing(createAccompanimentValidator)
    const uploaded = await this.consumeImage(ctx)

    const row = await Accompaniment.create({
      ...data,
      priceCents: data.priceCents ?? 0,
      imageUrl: uploaded?.url ?? null,
      imagePublicId: uploaded?.publicId ?? null,
    })

    return serialize(AccompanimentTransformer.transform(row))
  }

  async update(ctx: HttpContext) {
    this.ensureManager(ctx)
    const { request, params, serialize } = ctx

    const row = await Accompaniment.findOrFail(params.id)
    const data = await request.validateUsing(updateAccompanimentValidator)
    const uploaded = await this.consumeImage(ctx)

    if (uploaded) {
      const previous = row.imagePublicId
      row.imageUrl = uploaded.url
      row.imagePublicId = uploaded.publicId
      if (previous) await destroyImage(previous)
    }

    row.merge(data)
    await row.save()

    return serialize(AccompanimentTransformer.transform(row))
  }

  /**
   * Supprime un accompagnement. Les programmes qui le proposaient perdent la
   * ligne (CASCADE) ; les commandes déjà passées gardent leur libellé et leur
   * prix figés (SET NULL + snapshot).
   */
  async destroy(ctx: HttpContext) {
    this.ensureManager(ctx)
    const row = await Accompaniment.findOrFail(ctx.params.id)
    if (row.imagePublicId) await destroyImage(row.imagePublicId)
    await row.delete()
    return { message: 'Accompagnement supprimé.' }
  }

  private async consumeImage({ request }: HttpContext) {
    const image = request.file('image', IMAGE_OPTIONS)
    if (!image) return null
    if (!image.isValid) {
      throw new Exception(image.errors[0]?.message ?? 'Image invalide.', {
        status: 422,
        code: 'E_INVALID_IMAGE',
      })
    }
    return uploadAccompanimentImage(image.tmpPath!)
  }

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

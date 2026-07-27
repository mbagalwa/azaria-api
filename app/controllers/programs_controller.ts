import Program from '#models/program'
import ProgramDetailTransformer from '#transformers/program_detail_transformer'
import ProgramSummaryTransformer from '#transformers/program_summary_transformer'
import { createProgram, updateProgram } from '#services/programs'
import { programValidator } from '#validators/program'
import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProgramsController {
  /** Liste paginée des programmes (`?page=&limit=`), du plus récent au plus ancien. */
  async index(ctx: HttpContext) {
    this.ensureManager(ctx)
    const page = Math.max(1, Number(ctx.request.input('page', 1)) || 1)
    const limit = Math.min(100, Math.max(1, Number(ctx.request.input('limit', 20)) || 20))
    const paginator = await Program.query()
      .preload('entries')
      .orderBy('start_date', 'desc')
      .paginate(page, limit)
    return ctx.serialize(ProgramSummaryTransformer.paginate(paginator.all(), paginator.getMeta()))
  }

  /** Détail d'un programme : plats par date + stats. */
  async show(ctx: HttpContext) {
    this.ensureManager(ctx)
    const program = await this.findWithEntries(ctx.params.id)
    return ctx.serialize(ProgramDetailTransformer.transform(program))
  }

  /** Crée un programme (avec ses entrées) et renvoie son détail. */
  async store(ctx: HttpContext) {
    this.ensureManager(ctx)
    const data = await ctx.request.validateUsing(programValidator)
    const created = await createProgram(data)
    const program = await this.findWithEntries(created.id)
    return ctx.serialize(ProgramDetailTransformer.transform(program))
  }

  /** Met à jour un programme (remplace ses entrées) et renvoie son détail. */
  async update(ctx: HttpContext) {
    this.ensureManager(ctx)
    const program = await Program.find(ctx.params.id)
    if (!program) this.notFound()
    const data = await ctx.request.validateUsing(programValidator)
    await updateProgram(program, data)
    const fresh = await this.findWithEntries(program.id)
    return ctx.serialize(ProgramDetailTransformer.transform(fresh))
  }

  /** Supprime un programme (les entrées sont supprimées en cascade). */
  async destroy(ctx: HttpContext) {
    this.ensureManager(ctx)
    const program = await Program.find(ctx.params.id)
    if (!program) this.notFound()
    await program.delete()
    return { message: 'Programme supprimé.' }
  }

  private async findWithEntries(id: number | string): Promise<Program> {
    const program = await Program.query()
      .where('id', id)
      .preload('entries', (q) =>
        q
          .preload('dish')
          .preload('accompaniments', (a) => a.preload('accompaniment'))
          .orderBy('scheduled_date')
      )
      .first()
    if (!program) this.notFound()
    return program
  }

  private notFound(): never {
    throw new Exception('Programme introuvable.', { status: 404, code: 'E_NOT_FOUND' })
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

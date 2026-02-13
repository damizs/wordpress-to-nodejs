import type { HttpContext } from '@adonisjs/core/http'

export default class PrivacyPolicyController {
  async index({ inertia }: HttpContext) {
    return inertia.render('public/privacy-policy/index')
  }
}

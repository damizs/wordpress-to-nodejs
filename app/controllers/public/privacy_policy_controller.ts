import type { HttpContext } from '@adonisjs/core/http'
import SiteSetting from '#models/site_setting'

export default class PrivacyPolicyController {
  async index({ inertia }: HttpContext) {
    const dpoOrdinanceUrl = await SiteSetting.getValue('dpo_ordinance_pdf_url')

    return inertia.render('public/privacy-policy/index', { dpoOrdinanceUrl })
  }
}

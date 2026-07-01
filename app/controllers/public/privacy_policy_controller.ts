import type { HttpContext } from '@adonisjs/core/http'
import SiteSetting from '#models/site_setting'

export default class PrivacyPolicyController {
  async index({ inertia }: HttpContext) {
    const dpoOrdinanceUrl = await SiteSetting.getValue('dpo_ordinance_pdf_url')
    const content = await SiteSetting.getValue('privacy_policy_content')

    return inertia.render('public/privacy-policy/index', { content, dpoOrdinanceUrl })
  }
}

import vine from '@vinejs/vine'

export const satisfactionSurveyValidator = vine.compile(
  vine.object({
    cpf: vine.string().trim().minLength(11).maxLength(14),
    answers: vine.record(vine.number().min(1).max(5)).optional(),
    suggestion: vine.string().trim().maxLength(2000).optional(),
  })
)

import vine from '@vinejs/vine'

export const newsValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),
    excerpt: vine.string().trim().maxLength(500).optional(),
    content: vine.string().maxLength(100000).optional(),
    status: vine.enum(['draft', 'published']).optional(),
    category_id: vine.number().optional(),
    published_at: vine.string().optional(),
  })
)

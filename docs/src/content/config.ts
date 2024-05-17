import { defineCollection } from 'astro:content'
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema'

export const collections: Record<string, ReturnType<typeof defineCollection>> = {
  docs: defineCollection({ schema: docsSchema() }),
  i18n: defineCollection({ type: 'data', schema: i18nSchema() }),
}

import { defineType, defineField } from 'sanity'

export const stapleItem = defineType({
  name: 'stapleItem',
  title: 'Staple Item (Essentials)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Item Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
    }),
    defineField({
      name: 'sku',
      title: 'Shopify SKU/ID',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'image',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true }
    }),
    defineField({
      name: 'isMemberExclusive',
      title: 'Member Exclusive',
      type: 'boolean',
      initialValue: true,
    })
  ]
})

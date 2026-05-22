import { defineType, defineField } from 'sanity'

export const archiveItem = defineType({
  name: 'archiveItem',
  title: 'Archive Item',
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
      description: 'The exact SKU mapping to Shopify for Digital Closet syncing.',
    }),
    defineField({
      name: 'releaseYear',
      title: 'Release Year',
      type: 'number',
    }),
    defineField({
      name: 'lore',
      title: 'Item Lore / History',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'images',
      title: 'Gallery Images',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }]
    }),
    defineField({
      name: 'tierRequirement',
      title: 'Required Tier to View/Buy',
      type: 'string',
      options: {
        list: [
          { title: 'The Block', value: 'the_block' },
          { title: 'Frontline', value: 'frontline' },
          { title: 'Glory Circle', value: 'glory_circle' }
        ]
      },
      initialValue: 'glory_circle'
    })
  ]
})

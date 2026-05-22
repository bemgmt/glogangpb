import { defineType, defineField } from 'sanity'

export const affiliate = defineType({
  name: 'affiliate',
  title: 'Affiliate',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role / Title',
      type: 'string',
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'platform', type: 'string', title: 'Platform (e.g. Instagram, Twitter)' },
          { name: 'url', type: 'url', title: 'URL' }
        ]
      }]
    })
  ]
})

import { defineType, defineField } from 'sanity'

export const portalAssets = defineType({
  name: 'portalAssets',
  title: 'Portal Assets (UI/UX)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Asset Group Title',
      type: 'string',
    }),
    defineField({
      name: 'assetType',
      title: 'Asset Type',
      type: 'string',
      options: {
        list: [
          { title: 'Digital Closet Avatar Base', value: 'avatar_base' },
          { title: 'Easter Egg Media', value: 'easter_egg' },
          { title: 'Aesthetic Overlay', value: 'overlay' }
        ]
      }
    }),
    defineField({
      name: 'media',
      title: 'Media File',
      type: 'file',
      options: {
        accept: 'image/*,video/*,model/gltf-binary'
      }
    }),
    defineField({
      name: 'active',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
    })
  ]
})

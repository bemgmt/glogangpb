import { defineType, defineField } from 'sanity'

export const membershipTier = defineType({
  name: 'membershipTier',
  title: 'Membership Tier',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price (USD)',
      type: 'number',
      description: 'Monthly or annual price in USD.',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'interval',
      title: 'Billing Interval',
      type: 'string',
      options: {
        list: [
          { title: 'Monthly', value: 'month' },
          { title: 'Yearly', value: 'year' },
        ],
        layout: 'radio',
      },
      initialValue: 'month',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'perks',
      title: 'Perks',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List of perks included in this tier.',
    }),
    defineField({
      name: 'highlighted',
      title: 'Highlighted (Most Popular)',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'stripePriceId',
      title: 'Stripe Price ID',
      type: 'string',
      description: 'The Stripe price_XXXX ID for this tier.',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first.',
      initialValue: 0,
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'name',
      price: 'price',
      interval: 'interval',
    },
    prepare({ title, price, interval }) {
      return {
        title,
        subtitle: price != null ? `$${price}/${interval}` : 'Free',
      }
    },
  },
})

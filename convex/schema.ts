import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  products: defineTable({
    title: v.string(),
    imageId: v.string(),
    price: v.number(),
  }),
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }),
  questions: defineTable({
    question: v.string(),
    answer: v.string(),
    category: v.string(),
    views: v.number(),
    helpful: v.number(),
    tags: v.array(v.string()),
    createdAt: v.number(),
  })
    .index('by_category', ['category'])
    .index('by_views', ['views'])
    .index('by_helpful', ['helpful'])
    .index('by_created', ['createdAt']),
})

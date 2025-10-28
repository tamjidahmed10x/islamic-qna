import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  })
    .index('by_clerk_id', ['clerkId'])
    .index('by_email', ['email']),

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

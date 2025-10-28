import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    role: v.optional(v.union(v.literal('user'), v.literal('admin'))), // Made optional, defaults to 'user'
    isActive: v.optional(v.boolean()), // Made optional, defaults to true
  })
    .index('by_clerk_id', ['clerkId'])
    .index('by_email', ['email'])
    .index('by_role', ['role']),

  questions: defineTable({
    question: v.string(),
    answer: v.string(),
    category: v.string(),
    views: v.number(),
    helpful: v.number(),
    tags: v.array(v.string()),
    createdAt: v.number(),
    // New fields for unified table approach
    userId: v.optional(v.id('users')), // null for admin-created questions
    status: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('approved'),
        v.literal('rejected'),
      ),
    ),
    answeredBy: v.optional(v.id('users')), // admin who answered
    answeredAt: v.optional(v.number()),
    rejectionReason: v.optional(v.string()),
    source: v.optional(v.union(v.literal('admin'), v.literal('user'))), // Made optional for backward compatibility
  })
    .index('by_category', ['category'])
    .index('by_views', ['views'])
    .index('by_helpful', ['helpful'])
    .index('by_created', ['createdAt'])
    .index('by_status', ['status'])
    .index('by_user', ['userId'])
    .index('by_status_and_created', ['status', 'createdAt']),
})

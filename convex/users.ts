import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

// Get all users (for debugging)
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('users').collect()
  },
})

// Get current user from Clerk
export const current = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return null
    }

    // Find user in our database
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first()

    return user
  },
})

// Alias for getCurrentUser
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return null
    }

    // Find user in our database
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first()

    return user
  },
})

// Store/Update user from Clerk
export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()

    console.log('🔐 users.store called', {
      hasIdentity: !!identity,
      identitySubject: identity?.subject,
      identityEmail: identity?.email,
    })

    if (!identity) {
      throw new Error('Not authenticated')
    }

    // Check if user already exists
    const existing = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first()

    console.log('📊 Existing user check:', {
      found: !!existing,
      existingId: existing?._id,
    })

    if (existing) {
      // Update existing user
      await ctx.db.patch(existing._id, {
        name: identity.name,
        email: identity.email!,
        imageUrl: identity.pictureUrl,
      })
      console.log('✅ Updated existing user:', existing._id)
      return existing._id
    }

    // Create new user with default role
    const userId = await ctx.db.insert('users', {
      clerkId: identity.subject,
      email: identity.email!,
      name: identity.name,
      imageUrl: identity.pictureUrl,
      role: 'user', // Default role
      isActive: true, // Default active status
    })

    console.log('✅ Created new user:', userId)
    return userId
  },
})

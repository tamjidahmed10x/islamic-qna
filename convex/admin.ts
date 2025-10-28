import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { requireAdmin } from './rbac'

// Promote user to admin (only existing admins can do this)
export const promoteToAdmin = mutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    // Check if there are any admins in the system
    const existingAdmins = await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'admin'))
      .collect()

    // If no admins exist, allow the operation (first admin setup)
    if (existingAdmins.length > 0) {
      // If admins exist, require admin authentication
      await requireAdmin(ctx)
    }

    // Get the user to promote
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('User not found')
    }

    // Update user role to admin
    await ctx.db.patch(args.userId, {
      role: 'admin',
      isActive: true,
    })

    return { success: true, user: args.userId }
  },
})

// Get all users (admin only)
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx)

    const users = await ctx.db.query('users').order('desc').collect()
    return users
  },
})

// Update user role (admin only)
export const updateUserRole = mutation({
  args: {
    userId: v.id('users'),
    role: v.union(v.literal('user'), v.literal('admin')),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    await ctx.db.patch(args.userId, {
      role: args.role,
    })

    return { success: true }
  },
})

// Toggle user active status (admin only)
export const toggleUserStatus = mutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('User not found')
    }

    const currentStatus = user.isActive ?? true

    await ctx.db.patch(args.userId, {
      isActive: !currentStatus,
    })

    return { success: true }
  },
})

// Fix existing data (NO AUTH - one-time migration)
export const fixExistingData = mutation({
  args: {},
  handler: async (ctx) => {
    // Temporarily remove auth requirement for initial setup
    // await requireAdmin(ctx)

    const users = await ctx.db.query('users').collect()
    const questions = await ctx.db.query('questions').collect()

    let usersUpdated = 0
    let questionsUpdated = 0

    // Fix users
    for (const user of users) {
      const updates: any = {}

      if (user.role === undefined) {
        updates.role = 'user'
      }

      if (user.isActive === undefined) {
        updates.isActive = true
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(user._id, updates)
        usersUpdated++
      }
    }

    // Fix questions with enhanced defaults
    for (const question of questions) {
      const updates: any = {}

      if (!question.source) {
        updates.source = question.userId ? 'user' : 'admin'
      }

      if (!question.status) {
        updates.status =
          question.answer && question.answer.length > 0 ? 'approved' : 'pending'
      }

      // Reset views and helpful to 0
      updates.views = 0
      updates.helpful = 0

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(question._id, updates)
        questionsUpdated++
      }
    }

    return {
      success: true,
      usersTotal: users.length,
      usersUpdated,
      questionsTotal: questions.length,
      questionsUpdated,
    }
  },
})

// Public migration - no auth required (one-time setup)
export const migrateData = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect()
    const questions = await ctx.db.query('questions').collect()

    let usersUpdated = 0
    let questionsUpdated = 0

    // Fix users
    for (const user of users) {
      const updates: any = {}

      if (user.role === undefined) {
        updates.role = 'user'
      }

      if (user.isActive === undefined) {
        updates.isActive = true
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(user._id, updates)
        usersUpdated++
      }
    }

    // Fix questions
    for (const question of questions) {
      const updates: any = {}

      if (!question.source) {
        updates.source = question.userId ? 'user' : 'admin'
      }

      if (!question.status) {
        updates.status =
          question.answer && question.answer.length > 0 ? 'approved' : 'pending'
      }

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(question._id, updates)
        questionsUpdated++
      }
    }

    return {
      success: true,
      usersTotal: users.length,
      usersUpdated,
      questionsTotal: questions.length,
      questionsUpdated,
      message: 'Migration completed successfully!',
    }
  },
})

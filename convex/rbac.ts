import type { MutationCtx, QueryCtx } from './_generated/server'
import type { Id } from './_generated/dataModel'

// Helper to get current user from Clerk authentication
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    return null
  }

  const user = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
    .unique()

  return user
}

// Check if current user is admin
export async function isAdmin(ctx: QueryCtx | MutationCtx): Promise<boolean> {
  const user = await getCurrentUser(ctx)
  // Default to 'user' role if not set, and isActive defaults to true
  const userRole = user?.role ?? 'user'
  const userIsActive = user?.isActive ?? true
  return userRole === 'admin' && userIsActive === true
}

// Require admin access - throws error if not admin
export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx)

  if (!user) {
    throw new Error('Authentication required')
  }

  const userRole = user.role ?? 'user'
  const userIsActive = user.isActive ?? true

  if (userRole !== 'admin' || !userIsActive) {
    throw new Error('Admin access required')
  }

  return user
}

// Require authentication
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx)

  if (!user) {
    throw new Error('Authentication required')
  }

  const userIsActive = user.isActive ?? true

  if (!userIsActive) {
    throw new Error('Account is not active')
  }

  return user
}

// Check if user owns a resource
export async function isOwner(
  ctx: QueryCtx | MutationCtx,
  userId: Id<'users'>,
): Promise<boolean> {
  const currentUser = await getCurrentUser(ctx)
  return currentUser?._id === userId
}

// Require user to be owner or admin
export async function requireOwnerOrAdmin(
  ctx: QueryCtx | MutationCtx,
  resourceUserId: Id<'users'>,
) {
  const user = await getCurrentUser(ctx)

  if (!user) {
    throw new Error('Authentication required')
  }

  const isOwnerUser = user._id === resourceUserId
  const userRole = user.role ?? 'user'
  const userIsActive = user.isActive ?? true
  const isAdminUser = userRole === 'admin' && userIsActive

  if (!isOwnerUser && !isAdminUser) {
    throw new Error("You don't have permission to access this resource")
  }

  return user
}

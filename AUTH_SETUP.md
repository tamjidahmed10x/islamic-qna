# Authentication Setup with Clerk

This project uses [Clerk](https://clerk.com/) for authentication integrated with Convex backend.

## Environment Variables

### Frontend (.env.local)

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_cXVpZXQtb3gtNDYuY2xlcmsuYWNjb3VudHMuZGV2JA
```

### Backend (Convex Dashboard)

Set these in your Convex deployment:

```bash
CLERK_SECRET_KEY=sk_test_NOJbZVqGtwn4NSLZMdnUyqYskN0qbKf662iuL6Qm2T
CLERK_JWT_ISSUER_DOMAIN=https://quiet-ox-46.clerk.accounts.dev
```

## Features

### ✅ Implemented

- **Sign In/Sign Up Modal**: Users can sign in or create an account using Clerk's modal interface
- **User Profile**: Authenticated users can view their profile at `/profile`
- **Protected Routes**: Routes can be protected using `<SignedIn>` and `<SignedOut>` components
- **User Button**: Shows user avatar with dropdown menu for account settings and sign out
- **Convex Integration**: Clerk authentication is integrated with Convex backend for secure API calls

### 🔐 Authentication Flow

1. User clicks "লগইন" (Login) or "সাইন আপ" (Sign Up) button
2. Clerk modal appears with authentication options
3. After successful authentication, user is redirected back to the page
4. User profile and session are managed by Clerk
5. Convex functions can access authenticated user information

### 📝 Usage Examples

#### Protect a Route

```tsx
import { SignedIn, SignedOut } from '@clerk/clerk-react'

export default function MyPage() {
  return (
    <>
      <SignedIn>
        {/* Content for authenticated users */}
        <h1>Welcome, authenticated user!</h1>
      </SignedIn>
      <SignedOut>
        {/* Content for non-authenticated users */}
        <p>Please sign in to continue</p>
      </SignedOut>
    </>
  )
}
```

#### Access User Information

```tsx
import { useUser } from '@clerk/clerk-react'

export default function UserInfo() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) return <div>Loading...</div>
  if (!user) return <div>Not signed in</div>

  return (
    <div>
      <p>Name: {user.fullName}</p>
      <p>Email: {user.primaryEmailAddress?.emailAddress}</p>
    </div>
  )
}
```

#### Protected Convex Query

```ts
import { query } from './_generated/server'
import { getAuthUserId } from '@convex-dev/auth/server'

export const getUserData = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new Error('Not authenticated')
    }
    // Access user-specific data
    return await ctx.db
      .query('userdata')
      .filter((q) => q.eq(q.field('userId'), userId))
      .collect()
  },
})
```

## Clerk Dashboard Setup

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application or select existing one
3. Copy the Publishable Key and Secret Key
4. Set up authentication methods (Email, Google, GitHub, etc.)
5. Configure allowed redirect URLs if needed

## Testing Authentication

1. Run the development server: `npm run dev`
2. Click on "লগইন" button in the header
3. Sign up with email or social providers
4. After signing in, you should see your profile icon in the header
5. Navigate to `/profile` to view your profile information

## Security Notes

- Never commit `.env.local` file to version control
- Keep your `CLERK_SECRET_KEY` secure and only set it in Convex environment variables
- Use Clerk's built-in CSRF protection
- All Convex functions with authentication automatically validate JWT tokens

## Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Convex Auth Documentation](https://docs.convex.dev/auth)
- [Clerk + Convex Integration Guide](https://docs.convex.dev/auth/clerk)

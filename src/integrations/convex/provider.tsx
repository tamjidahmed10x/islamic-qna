import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'

const CONVEX_URL = (import.meta as any).env.VITE_CONVEX_URL
const CLERK_PUBLISHABLE_KEY = (import.meta as any).env
  .VITE_CLERK_PUBLISHABLE_KEY

if (!CONVEX_URL) {
  console.error('❌ Missing environment variable: VITE_CONVEX_URL')
} else {
  console.log('✅ Convex URL configured:', CONVEX_URL)
}

if (!CLERK_PUBLISHABLE_KEY) {
  console.error('❌ Missing environment variable: VITE_CLERK_PUBLISHABLE_KEY')
} else {
  console.log('✅ Clerk Publishable Key configured')
}

const convexClient = new ConvexReactClient(CONVEX_URL)

export default function AppConvexProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convexClient} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  )
}

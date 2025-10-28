import { useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useMutation } from 'convex/react'
import { api } from 'convex/_generated/api'

export function UserSync() {
  const { user, isLoaded } = useUser()
  const storeUser = useMutation(api.users.store)

  useEffect(() => {
    if (isLoaded && user) {
      console.log('🔄 UserSync: Attempting to sync user', {
        userId: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
      })

      // Sync user to Convex when they log in
      storeUser()
        .then((userId) => {
          console.log('✅ User synced successfully:', userId)
        })
        .catch((error) => {
          console.error('❌ Failed to sync user:', error)
        })
    } else {
      console.log('⏳ UserSync: Waiting for user data...', {
        isLoaded,
        hasUser: !!user,
      })
    }
  }, [isLoaded, user, storeUser])

  return null
}

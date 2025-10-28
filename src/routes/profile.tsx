import { createFileRoute } from '@tanstack/react-router'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import UserProfile from '@/components/UserProfile'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  return (
    <div className="py-8">
      <SignedIn>
        <UserProfile />
      </SignedIn>
      <SignedOut>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>প্রোফাইল</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              আপনার প্রোফাইল দেখতে লগইন করুন
            </p>
            <div className="flex gap-2">
              <Button>লগইন করুন</Button>
            </div>
          </CardContent>
        </Card>
      </SignedOut>
    </div>
  )
}

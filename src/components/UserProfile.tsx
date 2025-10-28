import { useUser } from '@clerk/clerk-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function UserProfile() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-pulse text-muted-foreground">লোড হচ্ছে...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>প্রোফাইল</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            আপনার প্রোফাইল দেখতে লগইন করুন
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ব্যবহারকারী প্রোফাইল</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {user.imageUrl && (
              <img
                src={user.imageUrl}
                alt={user.fullName || 'User'}
                className="w-16 h-16 rounded-full"
              />
            )}
            <div>
              <h2 className="text-xl font-semibold">{user.fullName}</h2>
              <p className="text-muted-foreground">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">ইউজার আইডি:</span>
                <Badge variant="secondary">{user.id}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">সদস্য হয়েছেন:</span>
                <span className="text-sm">
                  {new Date(user.createdAt!).toLocaleDateString('bn-BD', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

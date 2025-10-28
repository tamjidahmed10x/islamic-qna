import { useUser } from '@clerk/clerk-react'
import { useConvexQuery } from '@convex-dev/react-query'
import { api } from 'convex/_generated/api'
import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CheckCircle,
  Clock,
  FileQuestion,
  MessageCircle,
  Shield,
  XCircle,
} from 'lucide-react'

export default function UserProfile() {
  const { user, isLoaded } = useUser()
  const myQuestions = useConvexQuery(api.questions.getMyQuestions, {
    page: 1,
    limit: 10,
  })
  const currentUser = useConvexQuery(api.users.getCurrentUser, {})

  const isAdmin = currentUser?.role === 'admin'

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

  const pendingCount =
    myQuestions?.questions.filter((q) => q.status === 'pending').length || 0
  const approvedCount =
    myQuestions?.questions.filter((q) => q.status === 'approved').length || 0
  const rejectedCount =
    myQuestions?.questions.filter((q) => q.status === 'rejected').length || 0

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-700"
          >
            <Clock className="h-3 w-3 mr-1" />
            অপেক্ষমাণ
          </Badge>
        )
      case 'approved':
        return (
          <Badge variant="outline" className="border-green-500 text-green-700">
            <CheckCircle className="h-3 w-3 mr-1" />
            অনুমোদিত
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="outline" className="border-red-500 text-red-700">
            <XCircle className="h-3 w-3 mr-1" />
            প্রত্যাখ্যাত
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="py-8 space-y-6">
      {/* Profile Header */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>ব্যবহারকারী প্রোফাইল</span>
            {isAdmin && (
              <Badge variant="default" className="gap-1">
                <Shield className="h-4 w-4" />
                অ্যাডমিন
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {user.imageUrl && (
              <img
                src={user.imageUrl}
                alt={user.fullName || 'User'}
                className="w-20 h-20 rounded-full border-2"
              />
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-semibold">{user.fullName}</h2>
              <p className="text-muted-foreground">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
            <Link to="/questions" search={{ page: 1 }}>
              <Button size="lg">
                <MessageCircle className="mr-2 h-5 w-5" />
                নতুন প্রশ্ন করুন
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t">
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">সদস্য হয়েছেন:</span>
                <span className="text-sm font-medium">
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

      {/* Admin Quick Access */}
      {isAdmin && (
        <Card className="border-2 border-purple-500 bg-purple-50 dark:bg-purple-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              অ্যাডমিন প্যানেল
            </CardTitle>
            <CardDescription>
              প্রশ্নোত্তর পরিচালনা এবং পরিসংখ্যান দেখুন
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Link to="/admin">
                <Button variant="default">
                  <Shield className="mr-2 h-4 w-4" />
                  অ্যাডমিন প্যানেলে যান
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <FileQuestion className="h-4 w-4" />
              মোট প্রশ্ন
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-gray-900 dark:text-white">
              {myQuestions?.pagination.total || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-2 border-yellow-500">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              অপেক্ষমাণ
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-yellow-600">
              {pendingCount}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-2 border-green-500">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              উত্তরপ্রাপ্ত
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-green-600">
              {approvedCount}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-2 border-red-500">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-600" />
              প্রত্যাখ্যাত
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-red-600">
              {rejectedCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* My Questions */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">আমার প্রশ্নসমূহ</CardTitle>
          <CardDescription>আপনি যে প্রশ্নগুলি জিজ্ঞাসা করেছেন</CardDescription>
        </CardHeader>
        <CardContent>
          {!myQuestions ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="p-4 border rounded-lg animate-pulse space-y-3"
                >
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : myQuestions.questions.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <FileQuestion className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
              <div>
                <p className="text-lg font-medium">
                  আপনি এখনও কোন প্রশ্ন করেননি
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  ইসলাম সম্পর্কে আপনার প্রশ্ন জিজ্ঞাসা করুন
                </p>
              </div>
              <Link to="/questions" search={{ page: 1 }}>
                <Button size="lg">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  প্রথম প্রশ্ন করুন
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {myQuestions.questions.slice(0, 5).map((q) => (
                <div
                  key={q._id}
                  className="p-4 border-2 rounded-lg hover:border-gray-900 dark:hover:border-white transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(q.status)}
                          <Badge variant="outline">{q.category}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(q.createdAt).toLocaleDateString('bn-BD')}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg leading-relaxed">
                          {q.question}
                        </h3>
                      </div>
                    </div>

                    {q.status === 'approved' && q.answer && (
                      <div className="bg-green-50 dark:bg-green-950 p-3 rounded border border-green-200 dark:border-green-800">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                          উত্তর:
                        </p>
                        <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                          {q.answer.substring(0, 200)}
                          {q.answer.length > 200 && '...'}
                        </p>
                        {q.answer.length > 200 && (
                          <Link
                            to="/answer/$id"
                            params={{ id: q._id }}
                            className="text-sm text-green-700 dark:text-green-300 hover:underline mt-2 inline-block"
                          >
                            সম্পূর্ণ উত্তর পড়ুন →
                          </Link>
                        )}
                      </div>
                    )}

                    {q.status === 'rejected' && q.rejectionReason && (
                      <div className="bg-red-50 dark:bg-red-950 p-3 rounded border border-red-200 dark:border-red-800">
                        <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                          প্রত্যাখ্যানের কারণ:
                        </p>
                        <p className="text-sm text-red-800 dark:text-red-200">
                          {q.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {myQuestions.pagination.total > 5 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    আরও {myQuestions.pagination.total - 5}টি প্রশ্ন রয়েছে
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

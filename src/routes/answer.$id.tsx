import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useConvex, useConvexQuery } from '@convex-dev/react-query'
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Share2,
  Star,
  ThumbsUp,
  Users,
} from 'lucide-react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/answer/$id')({
  component: AnswerDetailPage,
})

const categoryIcons: Record<string, string> = {
  নামাজ: '🕌',
  রোজা: '🌙',
  যাকাত: '💰',
  হজ্জ: '🕋',
  কুরআন: '📖',
  হাদিস: '📚',
  বিবাহ: '💍',
  আমল: '✨',
  কোরবানি: '🐑',
}

function AnswerDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false)
  const [viewIncremented, setViewIncremented] = useState(false)
  const convex = useConvex()

  const question = useConvexQuery(api.questions.getById, {
    id: id as Id<'questions'>,
  })

  useEffect(() => {
    if (question && id && !viewIncremented) {
      convex.mutation(api.questions.incrementViews, {
        id: id as Id<'questions'>,
      })
      setViewIncremented(true)
    }
  }, [question, id, viewIncremented, convex])

  const handleMarkHelpful = () => {
    if (!hasMarkedHelpful && id) {
      convex.mutation(api.questions.incrementHelpful, {
        id: id as Id<'questions'>,
      })
      setHasMarkedHelpful(true)
    }
  }

  const handleShare = () => {
    const url = window.location.href
    if (typeof navigator.share !== 'undefined') {
      navigator.share({
        title: question?.question,
        text: question?.answer.substring(0, 100) + '...',
        url: url,
      })
    } else {
      navigator.clipboard.writeText(url)
      alert('লিংক কপি করা হয়েছে!')
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (question === undefined) {
    return (
      <div className="py-8 space-y-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (question === null) {
    return (
      <div className="py-8 space-y-8">
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <CardTitle className="mb-2">প্রশ্ন পাওয়া যায়নি</CardTitle>
            <CardDescription className="mb-4">
              এই প্রশ্নটি খুঁজে পাওয়া যায়নি বা মুছে ফেলা হয়েছে।
            </CardDescription>
            <Button onClick={() => navigate({ to: '/questions' })}>
              সব প্রশ্ন দেখুন
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="py-8 space-y-8">
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/questions' })}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          সব প্রশ্নে ফিরে যান
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary" className="text-base">
            <span className="mr-2">
              {categoryIcons[question.category] || '📌'}
            </span>
            {question.category}
          </Badge>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{question.views} বার দেখা হয়েছে</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span>{question.helpful} জন উপকৃত হয়েছেন</span>
            </div>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
          {question.question}
        </h1>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>প্রকাশিত: {formatDate(question.createdAt)}</span>
        </div>
      </div>

      {question.tags && question.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {question.tags.map((tag, idx) => (
            <Badge key={idx} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BookOpen className="h-6 w-6" />
            বিস্তারিত উত্তর
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-lg leading-relaxed whitespace-pre-line">
            {question.answer}
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          size="lg"
          onClick={handleMarkHelpful}
          disabled={hasMarkedHelpful}
          className="flex-1 sm:flex-none gap-2"
          variant={hasMarkedHelpful ? 'secondary' : 'default'}
        >
          <ThumbsUp className="h-5 w-5" />
          {hasMarkedHelpful ? 'উপকারী হিসেবে চিহ্নিত হয়েছে' : 'উপকারী'}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={handleShare}
          className="flex-1 sm:flex-none gap-2"
        >
          <Share2 className="h-5 w-5" />
          শেয়ার করুন
        </Button>
      </div>

      <div className="pt-8 border-t">
        <h2 className="text-2xl font-bold mb-6">সম্পর্কিত প্রশ্নসমূহ</h2>
        <div className="text-muted-foreground text-center py-8">
          শীঘ্রই আসছে...
        </div>
      </div>
    </div>
  )
}

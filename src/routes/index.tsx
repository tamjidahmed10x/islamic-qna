import { Link, createFileRoute } from '@tanstack/react-router'
import { BookOpen, MessageCircle, Star, Users } from 'lucide-react'
import { useConvexQuery } from '@convex-dev/react-query'
import { api } from 'convex/_generated/api'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/')({ component: App })

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

function App() {
  const featuredQuestionsData = useConvexQuery(api.questions.list, {
    page: 1,
    sortBy: 'helpful',
    limit: 6,
  })

  const categoriesData = useConvexQuery(api.questions.getCategories, {})

  const featuredQuestions = featuredQuestionsData?.questions || []
  const categories = categoriesData || []
  const isLoading = !featuredQuestionsData || !categoriesData

  return (
    <div className="py-8 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-8">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
          ইসলামিক প্রশ্ন ও উত্তর
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          ইসলাম সম্পর্কে আপনার যেকোনো প্রশ্নের উত্তর খুঁজুন। বিশ্বস্ত উৎস থেকে
          সঠিক তথ্য পান।
        </p>
      </section>

      {/* Featured Questions Section - Now First Priority */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold">জনপ্রিয় প্রশ্নসমূহ</h2>
            <p className="text-muted-foreground">
              সবচেয়ে বেশি পঠিত এবং উপকারী প্রশ্ন ও উত্তর
            </p>
          </div>
          <Link to="/questions">
            <Button variant="outline">সব দেখুন</Button>
          </Link>
        </div>

        {isLoading && (
          <div className="grid md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse h-full">
                <CardHeader>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && (
          <div className="grid md:grid-cols-2 gap-6">
            {featuredQuestions.map((item) => (
              <Link
                key={item._id}
                to="/answer/$id"
                params={{ id: item._id }}
                className="block"
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-gray-900 dark:hover:border-white h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <Badge variant="secondary" className="mb-2">
                          <span className="mr-1">
                            {categoryIcons[item.category] || '📌'}
                          </span>
                          {item.category}
                        </Badge>
                        <CardTitle className="text-xl leading-relaxed">
                          {item.question}
                        </CardTitle>
                      </div>
                      <BookOpen className="h-5 w-5 text-muted-foreground shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{item.views} বার পড়া হয়েছে</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-gray-900 text-gray-900 dark:fill-white dark:text-white" />
                        <span>{item.helpful} উপকারী</span>
                      </div>
                    </div>
                    <Button variant="link" className="p-0 h-auto">
                      সম্পূর্ণ উত্তর পড়ুন →
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Categories Section */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">বিষয়ভিত্তিক প্রশ্নাবলী</h2>
          <p className="text-muted-foreground">
            আপনার পছন্দের বিষয় নির্বাচন করুন
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              to="/questions"
              search={{ category: category.name, page: 1 }}
              className="block"
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:border-gray-900 dark:hover:border-white border-2 h-full">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">
                    {categoryIcons[category.name] || '📌'}
                  </div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <CardDescription>{category.count} প্রশ্ন</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
              1,245
            </CardTitle>
            <CardDescription>মোট প্রশ্ন</CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
              980
            </CardTitle>
            <CardDescription>উত্তর দেওয়া হয়েছে</CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
              5,420
            </CardTitle>
            <CardDescription>সক্রিয় ব্যবহারকারী</CardDescription>
          </CardHeader>
        </Card>
        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
              45
            </CardTitle>
            <CardDescription>ইসলামিক স্কলার</CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 dark:bg-white rounded-lg p-8 md:p-12 text-white dark:text-gray-900 text-center space-y-4 border-2">
        <h2 className="text-3xl md:text-4xl font-bold">
          আপনার প্রশ্ন জিজ্ঞাসা করুন
        </h2>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          ইসলাম সম্পর্কে আপনার যেকোনো প্রশ্ন জিজ্ঞাসা করুন। আমাদের যোগ্য
          স্কলাররা আপনাকে সঠিক উত্তর প্রদান করবেন।
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/questions" search={{ page: 1 }}>
            <Button size="lg" variant="secondary">
              <MessageCircle className="mr-2 h-5 w-5" />
              প্রশ্ন জিজ্ঞাসা করুন
            </Button>
          </Link>
          <Link to="/questions" search={{ page: 1 }}>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent hover:bg-white/10 dark:hover:bg-gray-900/10"
            >
              আরও জানুন
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

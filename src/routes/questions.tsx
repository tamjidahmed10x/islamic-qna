import { useEffect, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useConvexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from 'convex/_generated/api'
import {
  BookOpen,
  Filter,
  Search,
  Star,
  Users,
  MessageCircle,
  Plus,
  X,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface QuestionsSearchParams {
  page?: number
  category?: string
  search?: string
  sortBy?: string
}

const questionSchema = z.object({
  question: z
    .string()
    .min(10, 'প্রশ্ন কমপক্ষে ১০ অক্ষরের হতে হবে')
    .max(500, 'প্রশ্ন সর্বোচ্চ ৫০০ অক্ষরের হতে পারে'),
  category: z.string().min(1, 'অনুগ্রহ করে একটি বিভাগ নির্বাচন করুন'),
})

type QuestionForm = z.infer<typeof questionSchema>

const categoryOptions = [
  'নামাজ',
  'রোজা',
  'যাকাত',
  'হজ্জ',
  'কুরআন',
  'হাদিস',
  'বিবাহ',
  'আমল',
  'কোরবানি',
  'অন্যান্য',
]

export const Route = createFileRoute('/questions')({
  component: QuestionsPage,
  validateSearch: (search: Record<string, unknown>): QuestionsSearchParams => {
    return {
      page: Number(search.page) || 1,
      category: (search.category as string) || 'all',
      search: (search.search as string) || '',
      sortBy: (search.sortBy as string) || 'newest',
    }
  },
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

function QuestionsPage() {
  const navigate = useNavigate({ from: '/questions' })
  const searchParams = Route.useSearch()
  const {
    page = 1,
    category = 'all',
    search = '',
    sortBy = 'newest',
  } = searchParams

  const [searchInput, setSearchInput] = useState(search)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentUser = useConvexQuery(api.users.current, {})

  // Always use the public list query - no admin mode from this page
  const questionsData = useConvexQuery(api.questions.list, {
    page,
    category: category === 'all' ? undefined : category,
    search: search || undefined,
    sortBy,
    limit: 12,
  })

  const categoriesData = useConvexQuery(api.questions.getCategories, {})
  const submitQuestion = useConvexMutation(api.questions.submitQuestion)

  const form = useForm<QuestionForm>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question: '',
      category: '',
    },
  })

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const onSubmit = async (data: QuestionForm) => {
    // Check if user is logged in
    if (!currentUser) {
      toast.error('লগইন করুন', {
        description: 'প্রশ্ন জিজ্ঞাসা করতে আপনাকে লগইন করতে হবে',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await submitQuestion({
        question: data.question,
        category: data.category,
        tags: tags.length > 0 ? tags : [data.category],
      })

      toast.success('প্রশ্ন সফলভাবে জমা দেওয়া হয়েছে', {
        description: 'আমরা শীঘ্রই আপনার প্রশ্নের উত্তর প্রদান করব।',
      })
      setIsQuestionDialogOpen(false)
      form.reset()
      setTags([])
      // Redirect to profile
      navigate({ to: '/profile' })
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('প্রশ্ন জমা দিতে ব্যর্থ', {
        description:
          error instanceof Error
            ? error.message
            : 'অনুগ্রহ করে আবার চেষ্টা করুন',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate({
      search: { ...searchParams, search: searchInput, page: 1 },
    })
  }

  const handleCategoryChange = (newCategory: string) => {
    navigate({
      search: { ...searchParams, category: newCategory, page: 1 },
    })
    setIsMobileFilterOpen(false)
  }

  const handleSortChange = (newSort: string) => {
    navigate({
      search: { ...searchParams, sortBy: newSort, page: 1 },
    })
  }

  const handlePageChange = (newPage: number) => {
    navigate({
      search: { ...searchParams, page: newPage },
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const questions = questionsData?.questions || []
  const pagination = questionsData?.pagination
  const categories = categoriesData || []

  const filterSidebarClass = `lg:block space-y-6 ${isMobileFilterOpen ? 'block' : 'hidden'}`

  const isLoading = questionsData === undefined

  return (
    <div className="py-8 space-y-8">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              সকল প্রশ্নোত্তর
            </h1>
            <p className="text-muted-foreground mt-2">
              {pagination?.total || 0} টি প্রশ্নের মধ্য থেকে খুঁজুন
            </p>
          </div>

          <Dialog
            open={isQuestionDialogOpen}
            onOpenChange={setIsQuestionDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="lg" className="w-full md:w-auto">
                <MessageCircle className="mr-2 h-5 w-5" />
                প্রশ্ন জিজ্ঞাসা করুন
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageCircle className="h-6 w-6" />
                  নতুন প্রশ্ন জিজ্ঞাসা করুন
                </DialogTitle>
                <DialogDescription>
                  {!currentUser ? (
                    <span className="text-yellow-600 font-medium">
                      ⚠️ প্রশ্ন জমা দিতে আপনাকে লগইন করতে হবে
                    </span>
                  ) : (
                    'ইসলাম সম্পর্কে আপনার প্রশ্ন লিখুন। আমাদের যোগ্য আলেমগণ আপনাকে সঠিক উত্তর প্রদান করবেন।'
                  )}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="question"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>প্রশ্ন *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="আপনার প্রশ্ন লিখুন..."
                            className="min-h-24 resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          স্পষ্ট এবং বিস্তারিতভাবে লিখুন (১০-৫০০ অক্ষর)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>বিভাগ *</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-3 gap-2">
                            {categoryOptions.map((cat) => (
                              <Button
                                key={cat}
                                type="button"
                                variant={
                                  field.value === cat ? 'default' : 'outline'
                                }
                                onClick={() => field.onChange(cat)}
                                className="w-full"
                              >
                                {cat}
                              </Button>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>ট্যাগ (ঐচ্ছিক)</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="ট্যাগ লিখুন"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addTag()
                          }
                        }}
                        disabled={tags.length >= 5}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addTag}
                        disabled={!tagInput.trim() || tags.length >= 5}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="ml-2 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isSubmitting || !currentUser}
                    >
                      {isSubmitting
                        ? 'জমা দেওয়া হচ্ছে...'
                        : !currentUser
                          ? 'লগইন করুন'
                          : 'প্রশ্ন জমা দিন'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsQuestionDialogOpen(false)}
                    >
                      বাতিল
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="প্রশ্ন বা বিষয় অনুসন্ধান করুন..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" size="icon" className="shrink-0">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:hidden">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          >
            <Filter className="h-4 w-4 mr-2" />
            ফিল্টার {isMobileFilterOpen ? 'লুকান' : 'দেখান'}
          </Button>
        </div>

        <aside className={filterSidebarClass}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">সাজান</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { value: 'newest', label: 'নতুন প্রথমে' },
                { value: 'oldest', label: 'পুরাতন প্রথমে' },
                { value: 'views', label: 'সবচেয়ে বেশি পঠিত' },
                { value: 'helpful', label: 'সবচেয়ে উপকারী' },
              ].map((sort) => {
                const sortBtnClass = `w-full text-left px-3 py-2 rounded-md transition-colors ${
                  sortBy === sort.value
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
                return (
                  <button
                    key={sort.value}
                    onClick={() => handleSortChange(sort.value)}
                    className={sortBtnClass}
                  >
                    {sort.label}
                  </button>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">বিষয়সমূহ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => handleCategoryChange('all')}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${
                  category === 'all'
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span>সকল বিষয়</span>
                <Badge variant="secondary">{pagination?.total || 0}</Badge>
              </button>
              {categories.map((cat) => {
                const catBtnClass = `w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between ${
                  category === cat.name
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
                return (
                  <button
                    key={cat.name}
                    onClick={() => handleCategoryChange(cat.name)}
                    className={catBtnClass}
                  >
                    <span className="flex items-center gap-2">
                      <span>{categoryIcons[cat.name] || '📌'}</span>
                      {cat.name}
                    </span>
                    <Badge variant="secondary">{cat.count}</Badge>
                  </button>
                )
              })}
            </CardContent>
          </Card>
        </aside>

        <div className="lg:col-span-3 space-y-6">
          {(category !== 'all' || search) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-muted-foreground">
                সক্রিয় ফিল্টার:
              </span>
              {category !== 'all' && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleCategoryChange('all')}
                >
                  {category} ×
                </Badge>
              )}
              {search && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => {
                    setSearchInput('')
                    navigate({
                      search: { ...searchParams, search: '', page: 1 },
                    })
                  }}
                >
                  "{search}" ×
                </Badge>
              )}
            </div>
          )}

          {isLoading && (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
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

          {!isLoading && questions.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              {questions.map((question) => (
                <Link
                  key={question._id}
                  to="/answer/$id"
                  params={{ id: question._id }}
                  className="block"
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-gray-900 dark:hover:border-white group h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">
                              <span className="mr-1">
                                {categoryIcons[question.category] || '📌'}
                              </span>
                              {question.category}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300">
                            {question.question}
                          </CardTitle>
                        </div>
                        <BookOpen className="h-5 w-5 text-muted-foreground shrink-0" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed line-clamp-3">
                        {question.answer}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{question.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-gray-900 text-gray-900 dark:fill-white dark:text-white" />
                          <span>{question.helpful}</span>
                        </div>
                      </div>
                      {question.tags && question.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {question.tags.slice(0, 3).map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <Button variant="link" className="p-0 h-auto">
                        সম্পূর্ণ উত্তর পড়ুন →
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {!isLoading && questions.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <CardTitle className="mb-2">
                  কোনো প্রশ্ন পাওয়া যায়নি
                </CardTitle>
                <CardDescription className="mb-4">
                  আপনার অনুসন্ধান বা ফিল্টারের সাথে মিলে এমন কোনো প্রশ্ন খুঁজে
                  পাওয়া যায়নি। অন্য শব্দ বা ফিল্টার ব্যবহার করে দেখুন।
                </CardDescription>
                <Button
                  onClick={() => {
                    setSearchInput('')
                    navigate({
                      search: {
                        page: 1,
                        category: 'all',
                        search: '',
                        sortBy: 'newest',
                      },
                    })
                  }}
                >
                  সব প্রশ্ন দেখুন
                </Button>
              </CardContent>
            </Card>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <p className="text-sm text-muted-foreground">
                পৃষ্ঠা {pagination.page} / {pagination.totalPages} (মোট{' '}
                {pagination.total} টি প্রশ্ন)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!pagination.hasPrev}
                >
                  পূর্ববর্তী
                </Button>

                <div className="hidden sm:flex gap-1">
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1,
                  )
                    .filter((pageNum) => {
                      const current = pagination.page
                      return (
                        pageNum === 1 ||
                        pageNum === pagination.totalPages ||
                        (pageNum >= current - 1 && pageNum <= current + 1)
                      )
                    })
                    .map((pageNum, idx, arr) => (
                      <span key={pageNum} className="flex items-center gap-1">
                        {idx > 0 && arr[idx - 1] !== pageNum - 1 && (
                          <span className="px-2 text-muted-foreground">
                            ...
                          </span>
                        )}
                        <Button
                          variant={
                            pageNum === pagination.page ? 'default' : 'outline'
                          }
                          size="icon"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-10 h-10"
                        >
                          {pageNum}
                        </Button>
                      </span>
                    ))}
                </div>

                <Button
                  variant="outline"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!pagination.hasNext}
                >
                  পরবর্তী
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

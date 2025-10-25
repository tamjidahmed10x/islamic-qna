import { createFileRoute } from '@tanstack/react-router'
import { BookOpen, MessageCircle, Star, Users } from 'lucide-react'
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

interface Question {
  id: number
  question: string
  answer: string
  category: string
  views: number
  helpful: number
}

const featuredQuestions: Array<Question> = [
  {
    id: 1,
    question: 'নামাজের ওয়াক্ত সময় কীভাবে নির্ধারণ করা হয়?',
    answer:
      'নামাজের ওয়াক্ত সূর্যের অবস্থান অনুযায়ী নির্ধারিত হয়। ফজর সূর্যোদয়ের আগে, জোহর দুপুরের পরে, আসর বিকেলে, মাগরিব সূর্যাস্তের পরে এবং এশা রাতে আদায় করা হয়।',
    category: 'নামাজ',
    views: 1250,
    helpful: 890,
  },
  {
    id: 2,
    question: 'রমজান মাসে রোজা রাখা কি সকলের জন্য বাধ্যতামূলক?',
    answer:
      'সুস্থ, প্রাপ্তবয়স্ক মুসলিমদের জন্য রমজানে রোজা রাখা ফরজ। তবে অসুস্থ, ভ্রমণরত, গর্ভবতী বা স্তন্যদায়ী মায়েদের জন্য ছাড় রয়েছে এবং পরে তা কাজা করতে হয়।',
    category: 'রোজা',
    views: 980,
    helpful: 756,
  },
  {
    id: 3,
    question: 'যাকাত দেওয়ার নিয়ম কী?',
    answer:
      'নেসাব পরিমাণ সম্পদের মালিক হলে বছরে একবার ২.৫% হারে যাকাত দিতে হয়। এটি গরিব, মিসকিন এবং অভাবগ্রস্তদের মধ্যে বিতরণ করা হয়।',
    category: 'যাকাত',
    views: 1120,
    helpful: 834,
  },
  {
    id: 4,
    question: 'কুরআন তেলাওয়াতের সঠিক নিয়ম কী?',
    answer:
      'কুরআন তেলাওয়াতের জন্য পবিত্র থাকতে হবে, তাজভিদের নিয়ম মেনে তিলাওয়াত করতে হবে এবং অর্থ বুঝে পড়ার চেষ্টা করতে হবে।',
    category: 'কুরআন',
    views: 1450,
    helpful: 1123,
  },
  {
    id: 5,
    question: 'হজ্জ কখন এবং কীভাবে করতে হয়?',
    answer:
      'জিলহজ মাসের ৮ থেকে ১২ তারিখে হজ্জ পালন করা হয়। এটি শারীরিক ও আর্থিকভাবে সক্ষম প্রত্যেক মুসলিমের জন্য জীবনে একবার ফরজ।',
    category: 'হজ্জ',
    views: 890,
    helpful: 673,
  },
  {
    id: 6,
    question: 'ইসলামে দান-সদকার গুরুত্ব কী?',
    answer:
      'দান-সদকা আল্লাহর সন্তুষ্টি অর্জনের মাধ্যম। এটি সম্পদ বৃদ্ধি করে এবং পাপ মোচন করে। নবী (সা.) বলেছেন, সদকা দাতার সম্পদ কমায় না।',
    category: 'আমল',
    views: 1340,
    helpful: 967,
  },
]

const categories = [
  { name: 'নামাজ', count: 245, icon: '🕌' },
  { name: 'রোজা', count: 189, icon: '🌙' },
  { name: 'যাকাত', count: 134, icon: '💰' },
  { name: 'হজ্জ', count: 98, icon: '🕋' },
  { name: 'কুরআন', count: 312, icon: '📖' },
  { name: 'হাদিস', count: 267, icon: '📚' },
]

function App() {
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
          <Button variant="outline">সব দেখুন</Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {featuredQuestions.map((item) => (
            <Card
              key={item.id}
              className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-gray-900 dark:hover:border-white"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <Badge variant="secondary" className="mb-2">
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
          ))}
        </div>
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
            <Card
              key={category.name}
              className="hover:shadow-lg transition-shadow cursor-pointer hover:border-gray-900 dark:hover:border-white border-2"
            >
              <CardHeader className="text-center">
                <div className="text-4xl mb-2">{category.icon}</div>
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <CardDescription>{category.count} প্রশ্ন</CardDescription>
              </CardHeader>
            </Card>
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
          <Button size="lg" variant="secondary">
            <MessageCircle className="mr-2 h-5 w-5" />
            প্রশ্ন জিজ্ঞাসা করুন
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-transparent hover:bg-white/10 dark:hover:bg-gray-900/10"
          >
            আরও জানুন
          </Button>
        </div>
      </section>
    </div>
  )
}

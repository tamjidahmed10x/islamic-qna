import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getCurrentUser, requireAdmin, requireAuth } from './rbac'

export const list = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    sortBy: v.optional(v.string()),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 12
    const page = args.page || 1
    const skip = (page - 1) * limit

    // Get all questions
    let questions = await ctx.db.query('questions').collect()

    // Filter to show only approved questions
    questions = questions.filter((q) => {
      const status =
        q.status ?? (q.answer && q.answer.length > 0 ? 'approved' : 'pending')
      return status === 'approved'
    })

    // Filter by category
    if (args.category && args.category !== 'all') {
      questions = questions.filter((q) => q.category === args.category)
    }

    // Filter by search
    if (args.search) {
      const searchLower = args.search.toLowerCase()
      questions = questions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchLower) ||
          q.answer.toLowerCase().includes(searchLower) ||
          q.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
      )
    }

    // Sort
    if (args.sortBy === 'views') {
      questions.sort((a, b) => b.views - a.views)
    } else if (args.sortBy === 'helpful') {
      questions.sort((a, b) => b.helpful - a.helpful)
    } else if (args.sortBy === 'newest') {
      questions.sort((a, b) => b.createdAt - a.createdAt)
    } else {
      // Default: oldest first
      questions.sort((a, b) => a.createdAt - b.createdAt)
    }

    const total = questions.length
    const totalPages = Math.ceil(total / limit)
    const paginatedQuestions = questions.slice(skip, skip + limit)

    return {
      questions: paginatedQuestions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  },
})

export const getById = query({
  args: { id: v.id('questions') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const incrementViews = mutation({
  args: { id: v.id('questions') },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.id)
    if (!question) return

    await ctx.db.patch(args.id, {
      views: question.views + 1,
    })
  },
})

export const incrementHelpful = mutation({
  args: { id: v.id('questions') },
  handler: async (ctx, args) => {
    const question = await ctx.db.get(args.id)
    if (!question) return

    await ctx.db.patch(args.id, {
      helpful: question.helpful + 1,
    })
  },
})

export const getCategories = query({
  handler: async (ctx) => {
    const questions = await ctx.db.query('questions').collect()

    const categoryCount: Record<string, number> = {}

    questions.forEach((q) => {
      categoryCount[q.category] = (categoryCount[q.category] || 0) + 1
    })

    return Object.entries(categoryCount).map(([name, count]) => ({
      name,
      count,
    }))
  },
})

export const seed = mutation({
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query('questions').first()
    if (existing) {
      return { message: 'Data already exists' }
    }

    const questions = [
      {
        question: 'নামাজের ওয়াক্ত সময় কীভাবে নির্ধারণ করা হয়?',
        answer:
          'নামাজের ওয়াক্ত সূর্যের অবস্থান অনুযায়ী নির্ধারিত হয়। ফজর সূর্যোদয়ের আগে, জোহর দুপুরের পরে, আসর বিকেলে, মাগরিব সূর্যাস্তের পরে এবং এশা রাতে আদায় করা হয়। প্রতিটি ওয়াক্তের নির্দিষ্ট সময় রয়েছে যা কুরআন ও হাদিস দ্বারা নির্ধারিত।',
        category: 'নামাজ',
        views: 1250,
        helpful: 890,
        tags: ['নামাজ', 'ওয়াক্ত', 'সময়'],
        createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
        status: 'approved' as const,
        source: 'admin' as const,
      },
      {
        question: 'রমজান মাসে রোজা রাখা কি সকলের জন্য বাধ্যতামূলক?',
        answer:
          'সুস্থ, প্রাপ্তবয়স্ক মুসলিমদের জন্য রমজানে রোজা রাখা ফরজ। তবে অসুস্থ, ভ্রমণরত, গর্ভবতী বা স্তন্যদায়ী মায়েদের জন্য ছাড় রয়েছে এবং পরে তা কাজা করতে হয়। শিশু, বৃদ্ধ এবং দীর্ঘমেয়াদী অসুস্থদের জন্যও বিশেষ বিধান রয়েছে।',
        category: 'রোজা',
        views: 980,
        helpful: 756,
        tags: ['রোজা', 'রমজান', 'ফরজ'],
        createdAt: Date.now() - 25 * 24 * 60 * 60 * 1000,
        status: 'approved' as const,
        source: 'admin' as const,
      },
      {
        question: 'যাকাত দেওয়ার নিয়ম কী?',
        answer:
          'নেসাব পরিমাণ সম্পদের মালিক হলে বছরে একবার ২.৫% হারে যাকাত দিতে হয়। এটি গরিব, মিসকিন এবং অভাবগ্রস্তদের মধ্যে বিতরণ করা হয়। সোনা, রূপা, নগদ অর্থ এবং ব্যবসায়িক পণ্যের উপর যাকাত প্রযোজ্য।',
        category: 'যাকাত',
        views: 1120,
        helpful: 834,
        tags: ['যাকাত', 'দান', 'নেসাব'],
        createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
        status: 'approved' as const,
        source: 'admin' as const,
      },
      {
        question: 'কুরআন তেলাওয়াতের সঠিক নিয়ম কী?',
        answer:
          'কুরআন তেলাওয়াতের জন্য পবিত্র থাকতে হবে, তাজভিদের নিয়ম মেনে তিলাওয়াত করতে হবে এবং অর্থ বুঝে পড়ার চেষ্টা করতে হবে। ওজু করে, কিবলামুখী হয়ে এবং আউজুবিল্লাহ ও বিসমিল্লাহ পড়ে শুরু করা উত্তম।',
        category: 'কুরআন',
        views: 1450,
        helpful: 1123,
        tags: ['কুরআন', 'তেলাওয়াত', 'তাজভিদ'],
        createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
        status: 'approved' as const,
        source: 'admin' as const,
      },
      {
        question: 'হজ্জ কখন এবং কীভাবে করতে হয়?',
        answer:
          'জিলহজ মাসের ৮ থেকে ১২ তারিখে হজ্জ পালন করা হয়। এটি শারীরিক ও আর্থিকভাবে সক্ষম প্রত্যেক মুসলিমের জন্য জীবনে একবার ফরজ। হজ্জের মধ্যে মিনা, আরাফাত ও মুযদালিফায় অবস্থান এবং কাবা তওয়াফ অন্তর্ভুক্ত।',
        category: 'হজ্জ',
        views: 890,
        helpful: 673,
        tags: ['হজ্জ', 'মক্কা', 'ইবাদত'],
        createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
        status: 'approved' as const,
        source: 'admin' as const,
      },
      {
        question: 'ইসলামে দান-সদকার গুরুত্ব কী?',
        answer:
          'দান-সদকা আল্লাহর সন্তুষ্টি অর্জনের মাধ্যম। এটি সম্পদ বৃদ্ধি করে এবং পাপ মোচন করে। নবী (সা.) বলেছেন, সদকা দাতার সম্পদ কমায় না। নিয়মিত দান করা সামাজিক ভারসাম্য রক্ষা করে এবং আল্লাহর রহমত লাভের উপায়।',
        category: 'আমল',
        views: 1340,
        helpful: 967,
        tags: ['সদকা', 'দান', 'আমল'],
        createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
        status: 'approved' as const,
        source: 'admin' as const,
      },
      {
        question: 'উমরাহ এবং হজ্জের মধ্যে পার্থক্য কী?',
        answer:
          'হজ্জ ফরজ এবং নির্দিষ্ট সময়ে পালন করতে হয়, কিন্তু উমরাহ সুন্নত এবং যেকোনো সময় করা যায়। হজ্জের আরকান বেশি এবং এতে আরাফাতে অবস্থান বাধ্যতামূলক, কিন্তু উমরাহতে শুধু তওয়াফ ও সাঈ করতে হয়।',
        category: 'হজ্জ',
        views: 756,
        helpful: 543,
        tags: ['হজ্জ', 'উমরাহ', 'তফাৎ'],
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
        status: 'approved' as const,
        source: 'admin' as const,
      },
      {
        question: 'তাহাজ্জুদ নামাজের নিয়ম কী?',
        answer:
          'তাহাজ্জুদ রাতের শেষ তৃতীয়াংশে পড়া হয়। এটি অত্যন্ত ফজিলতপূর্ণ নফল নামাজ। সাধারণত ২ রাকাত করে ৮-১২ রাকাত পড়া হয়। এশার পর ঘুমিয়ে উঠে পড়লে তাহাজ্জুদ হয়, নাহলে তা কিয়ামুল লাইল বলে গণ্য হয়।',
        category: 'নামাজ',
        views: 1890,
        helpful: 1456,
        tags: ['তাহাজ্জুদ', 'নফল', 'রাত্রি'],
        createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
        status: 'approved' as const,
        source: 'admin' as const,
      },
      {
        question: 'জুমার নামাজের গুরুত্ব কী?',
        answer:
          'জুমার নামাজ প্রাপ্তবয়স্ক মুসলিম পুরুষদের জন্য ফরজ। এটি শুক্রবার জোহরের সময় জামাতের সাথে পড়তে হয়। খুতবা শোনা এবং দুই রাকাত জুমার নামাজ আদায় করা আবশ্যক। এটি সপ্তাহের সবচেয়ে গুরুত্বপূর্ণ ইবাদত।',
        category: 'নামাজ',
        views: 2134,
        helpful: 1678,
        tags: ['জুমা', 'শুক্রবার', 'জামাত'],
        createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
        status: 'approved' as const,
        source: 'admin' as const,
      },
      {
        question: 'ফিতরা কখন এবং কীভাবে দিতে হয়?',
        answer:
          'সদকাতুল ফিতর ঈদের নামাজের আগে দিতে হয়। প্রতিজন মুসলিমের পক্ষ থেকে নির্দিষ্ট পরিমাণ খাদ্য বা সমপরিমাণ অর্থ দরিদ্রদের দিতে হয়। এটি রোজার ত্রুটি-বিচ্যুতি দূর করে এবং দরিদ্রদের ঈদের আনন্দে শরিক করে।',
        category: 'রোজা',
        views: 1567,
        helpful: 1234,
        tags: ['ফিতরা', 'ঈদ', 'সদকা'],
        createdAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
        status: 'approved' as const,
        source: 'admin' as const,
      },
      {
        question: 'হাদিস এবং কুরআনের মধ্যে সম্পর্ক কী?',
        answer:
          'কুরআন আল্লাহর বাণী এবং ইসলামের মূল উৎস। হাদিস নবী (সা.) এর বাণী ও কর্ম যা কুরআনের ব্যাখ্যা প্রদান করে। কুরআন বুঝতে এবং প্রয়োগ করতে হাদিস অপরিহার্য। উভয়ই একসাথে শরীয়তের ভিত্তি গঠন করে।',
        category: 'হাদিস',
        views: 1890,
        helpful: 1456,
        tags: ['হাদিস', 'কুরআন', 'শরীয়ত'],
        createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        status: 'approved' as const,
        source: 'admin' as const,
      },
      {
        question: 'ইসলামে বিবাহের শর্ত কী কী?',
        answer:
          'বিবাহের জন্য পাত্র-পাত্রীর সম্মতি, অভিভাবকের উপস্থিতি, মোহরানা নির্ধারণ এবং দুইজন সাক্ষী থাকা আবশ্যক। স্বামী-স্ত্রীর পারস্পরিক অধিকার ও দায়িত্ব রয়েছে। বিবাহ একটি পবিত্র চুক্তি যা সমাজের ভিত্তি।',
        category: 'বিবাহ',
        views: 2345,
        helpful: 1890,
        tags: ['বিবাহ', 'নিকাহ', 'শর্ত'],
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        status: 'approved' as const,
        source: 'admin' as const,
      },
      {
        question: 'ইসলামে তালাকের বিধান কী?',
        answer:
          'তালাক হালাল কিন্তু আল্লাহর কাছে অপছন্দনীয়। এটি তিনবার দেওয়া যায় এবং প্রতিবার পরে ইদ্দত পালন করতে হয়। দুইবার তালাকের পর রুজু করা যায়। তিনবার তালাকের পর পুনর্বিবাহ করতে হলে স্ত্রীকে অন্যত্র বিবাহিত হয়ে তালাক হতে হবে।',
        category: 'বিবাহ',
        views: 1678,
        helpful: 1234,
        tags: ['তালাক', 'বিবাহ', 'বিধান'],
        createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
        status: 'approved' as const,
        source: 'admin' as const,
      },
      {
        question: 'কোরবানির নিয়ম ও শর্ত কী?',
        answer:
          'ঈদুল আযহার দিনে সামর্থ্যবান মুসলিমদের কোরবানি দেওয়া ওয়াজিব। নির্দিষ্ট বয়স ও গুণমানের পশু কোরবানি করতে হয়। মাংস তিন ভাগ করে নিজের, আত্মীয় ও গরিবদের মধ্যে বণ্টন করা সুন্নত। এটি ইবরাহিম (আ.) এর ত্যাগের স্মরণে পালিত হয়।',
        category: 'কোরবানি',
        views: 1456,
        helpful: 1123,
        tags: ['কোরবানি', 'ঈদ', 'পশু'],
        createdAt: Date.now() - 12 * 60 * 60 * 1000,
        status: 'approved' as const,
        source: 'admin' as const,
      },
      {
        question: 'ইসলামে শিক্ষার গুরুত্ব কী?',
        answer:
          'ইসলামে জ্ঞান অর্জন করা ফরজ। নবী (সা.) বলেছেন, "প্রতিটি মুসলিম নর-নারীর জন্য জ্ঞান অর্জন করা ফরজ।" ইসলামী শিক্ষার পাশাপাশি দুনিয়াবী শিক্ষাও গুরুত্বপূর্ণ। জ্ঞানী ব্যক্তিকে আল্লাহ সম্মানিত করেন।',
        category: 'আমল',
        views: 2456,
        helpful: 1987,
        tags: ['শিক্ষা', 'জ্ঞান', 'ফরজ'],
        createdAt: Date.now() - 11 * 60 * 60 * 1000,
        status: 'approved' as const,
        source: 'admin' as const,
      },
      {
        question: 'মসজিদে যাওয়ার আদব কী?',
        answer:
          'মসজিদে যাওয়ার সময় পরিচ্ছন্ন কাপড় পরতে হবে, সুগন্ধি ব্যবহার করা মুস্তাহাব, ডান পা দিয়ে ঢুকতে হবে এবং দুআ পড়তে হবে। তাহিয়াতুল মসজিদ পড়া সুন্নত। মসজিদে কথা কম বলা এবং শান্ত থাকা উচিত।',
        category: 'নামাজ',
        views: 1234,
        helpful: 890,
        tags: ['মসজিদ', 'আদব', 'সুন্নত'],
        createdAt: Date.now() - 10 * 60 * 60 * 1000,
        status: 'approved' as const,
        source: 'admin' as const,
      },
      {
        question: 'ওজু করার সঠিক নিয়ম কী?',
        answer:
          'ওজু শুরু করতে বিসমিল্লাহ পড়ে হাত ধুতে হবে। তারপর কুলি, নাকে পানি দেওয়া, মুখমণ্ডল ধোয়া, উভয় হাত কনুই পর্যন্ত ধোয়া, মাথা মাসেহ করা এবং পা গোড়ালি পর্যন্ত ধোয়া। প্রতিটি অঙ্গ তিনবার ধোয়া সুন্নত।',
        category: 'নামাজ',
        views: 3456,
        helpful: 2789,
        tags: ['ওজু', 'পবিত্রতা', 'নামাজ'],
        createdAt: Date.now() - 9 * 60 * 60 * 1000,
        status: 'approved' as const,
        source: 'admin' as const,
      },
      {
        question: 'ইস্তিখারা নামাজ কীভাবে পড়তে হয়?',
        answer:
          'কোনো সিদ্ধান্ত নিতে দ্বিধাগ্রস্ত হলে ইস্তিখারা পড়া হয়। দুই রাকাত নফল নামাজ পড়ে নির্দিষ্ট দুআ পড়তে হয়। এতে আল্লাহর কাছে সঠিক পথ দেখানোর জন্য প্রার্থনা করা হয়। নামাজের পর যে কাজে মন আকৃষ্ট হয়, তাই করা ভালো।',
        category: 'নামাজ',
        views: 1890,
        helpful: 1456,
        tags: ['ইস্তিখারা', 'দুআ', 'নফল'],
        createdAt: Date.now() - 8 * 60 * 60 * 1000,
        status: 'approved' as const,
        source: 'admin' as const,
      },
      {
        question: 'যিকির এবং দুআর গুরুত্ব কী?',
        answer:
          'যিকির মানে আল্লাহকে স্মরণ করা। এটি অন্তরকে প্রশান্ত করে এবং আল্লাহর নৈকট্য লাভের উপায়। দুআ ইবাদতের মূল এবং আল্লাহর সাথে সরাসরি কথোপকথন। নিয়মিত যিকির ও দুআ মুমিনের জীবনের অংশ হওয়া উচিত।',
        category: 'আমল',
        views: 2123,
        helpful: 1678,
        tags: ['যিকির', 'দুআ', 'আল্লাহ'],
        createdAt: Date.now() - 7 * 60 * 60 * 1000,
        status: 'approved' as const,
        source: 'admin' as const,
      },
      {
        question: 'রমজানে তারাবির নামাজ কত রাকাত?',
        answer:
          'তারাবির নামাজ ২০ রাকাত পড়া সুন্নত, তবে ৮ রাকাত পড়াও জায়েজ। এটি এশার নামাজের পর জামাতের সাথে পড়া হয়। প্রতি চার রাকাত পর বিশ্রাম নেওয়া হয়। তারাবিতে পুরো কুরআন শোনা অত্যন্ত সওয়াবের কাজ।',
        category: 'রোজা',
        views: 1789,
        helpful: 1345,
        tags: ['তারাবি', 'রমজান', 'নামাজ'],
        createdAt: Date.now() - 6 * 60 * 60 * 1000,
        status: 'approved' as const,
        source: 'admin' as const,
      },
      {
        question: 'লাইলাতুল কদর কখন এবং কীভাবে পালন করতে হয়?',
        answer:
          'লাইলাতুল কদর রমজানের শেষ দশকের বিজোড় রাতে খুঁজতে হয়, বিশেষত ২৭তম রাতে। এই রাতের ইবাদত হাজার মাসের চেয়ে উত্তম। বেশি বেশি নামাজ, কুরআন তেলাওয়াত, দুআ ও তওবা করা উচিত। "আল্লাহুম্মা ইন্নাকা আফুউন..." দুআ বেশি পড়া সুন্নত।',
        category: 'রোজা',
        views: 2890,
        helpful: 2345,
        tags: ['লাইলাতুল কদর', 'রমজান', 'ইবাদত'],
        createdAt: Date.now() - 5 * 60 * 60 * 1000,
        status: 'approved' as const,
        source: 'admin' as const,
      },
      {
        question: 'ইসলামে পিতামাতার অধিকার কী?',
        answer:
          'পিতামাতার সাথে সদ্ব্যবহার করা ফরজ। তাদের সেবা করা, কথা শুনা এবং সম্মান করা ইবাদত। কুরআনে আল্লাহ তাঁর ইবাদতের পরই পিতামাতার প্রতি সদাচরণের কথা বলেছেন। মৃত্যুর পরও তাদের জন্য দুআ ও সদকা করা উচিত।',
        category: 'আমল',
        views: 2678,
        helpful: 2123,
        tags: ['পিতামাতা', 'অধিকার', 'সেবা'],
        createdAt: Date.now() - 4 * 60 * 60 * 1000,
        status: 'approved' as const,
        source: 'admin' as const,
      },
      {
        question: 'হালাল রিযিক অর্জনের উপায় কী?',
        answer:
          'হালাল উপায়ে উপার্জন করা প্রতিটি মুসলিমের দায়িত্ব। সুদ, ঘুষ, জুয়া, প্রতারণা থেকে দূরে থাকতে হবে। সৎভাবে ব্যবসা বা চাকরি করে রিযিক অর্জন করা ইবাদত। হালাল রিযিক আল্লাহর রহমত ও বরকত নিয়ে আসে।',
        category: 'আমল',
        views: 2345,
        helpful: 1890,
        tags: ['হালাল', 'রিযিক', 'উপার্জন'],
        createdAt: Date.now() - 3 * 60 * 60 * 1000,
        status: 'approved' as const,
        source: 'admin' as const,
      },
      {
        question: 'সহীহ হাদিসের গ্রন্থগুলো কী কী?',
        answer:
          'সবচেয়ে বিশুদ্ধ হাদিস গ্রন্থ হলো সহীহ বুখারী ও সহীহ মুসলিম। এছাড়া আবু দাউদ, তিরমিযী, নাসাঈ ও ইবনে মাজাহ মিলে ছয়টি প্রধান হাদিস গ্রন্থ। মুসনাদে আহমাদ, মুয়াত্তা মালিক ও অন্যান্য সংকলনও গুরুত্বপূর্ণ।',
        category: 'হাদিস',
        views: 1567,
        helpful: 1234,
        tags: ['হাদিস', 'বুখারী', 'মুসলিম'],
        createdAt: Date.now() - 2 * 60 * 60 * 1000,
        status: 'approved' as const,
        source: 'admin' as const,
      },
      {
        question: 'ইসলামে প্রতিবেশীর অধিকার কী?',
        answer:
          'প্রতিবেশীর সাথে ভালো ব্যবহার করা ইসলামের গুরুত্বপূর্ণ শিক্ষা। তাদের বিপদে সাহায্য করা, উপহার দেওয়া, কষ্ট না দেওয়া এবং তাদের অধিকার রক্ষা করা মুমিনের দায়িত্ব। নবী (সা.) বলেছেন, যে প্রতিবেশীকে কষ্ট দেয় সে মুমিন নয়।',
        category: 'আমল',
        views: 1890,
        helpful: 1456,
        tags: ['প্রতিবেশী', 'অধিকার', 'সদাচরণ'],
        createdAt: Date.now() - 1 * 60 * 60 * 1000,
        status: 'approved' as const,
        source: 'admin' as const,
      },
    ]

    for (const q of questions) {
      await ctx.db.insert('questions', q)
    }

    return { message: 'Questions seeded successfully', count: questions.length }
  },
})

// ============================================
// USER FUNCTIONS - Question Submission
// ============================================

export const submitQuestion = mutation({
  args: {
    question: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx)

    const questionId = await ctx.db.insert('questions', {
      question: args.question,
      answer: '', // Empty until admin answers
      category: args.category,
      tags: args.tags,
      views: 0,
      helpful: 0,
      createdAt: Date.now(),
      userId: user._id,
      status: 'pending',
      source: 'user',
    })

    return { questionId, success: true }
  },
})

export const getMyQuestions = query({
  args: {
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user) {
      return {
        questions: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      }
    }

    const limit = args.limit || 10
    const page = args.page || 1
    const skip = (page - 1) * limit

    const allQuestions = await ctx.db
      .query('questions')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect()

    const total = allQuestions.length
    const totalPages = Math.ceil(total / limit)
    const questions = allQuestions
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(skip, skip + limit)

    return {
      questions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  },
})

// ============================================
// ADMIN FUNCTIONS - Question Management
// ============================================

export const getPendingQuestions = query({
  args: {
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const limit = args.limit || 20
    const page = args.page || 1
    const skip = (page - 1) * limit

    const allQuestions = await ctx.db
      .query('questions')
      .withIndex('by_status_and_created', (q) => q.eq('status', 'pending'))
      .collect()

    const total = allQuestions.length
    const totalPages = Math.ceil(total / limit)
    const questions = allQuestions
      .sort((a, b) => a.createdAt - b.createdAt) // Oldest first
      .slice(skip, skip + limit)

    return {
      questions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  },
})

export const answerQuestion = mutation({
  args: {
    questionId: v.id('questions'),
    answer: v.string(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx)

    const question = await ctx.db.get(args.questionId)
    if (!question) {
      throw new Error('Question not found')
    }

    await ctx.db.patch(args.questionId, {
      answer: args.answer,
      tags: args.tags || question.tags,
      answeredBy: admin._id,
      answeredAt: Date.now(),
      status: 'approved', // Auto-approve when answered
    })

    return { success: true }
  },
})

export const rejectQuestion = mutation({
  args: {
    questionId: v.id('questions'),
    rejectionReason: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const question = await ctx.db.get(args.questionId)
    if (!question) {
      throw new Error('Question not found')
    }

    await ctx.db.patch(args.questionId, {
      status: 'rejected',
      rejectionReason: args.rejectionReason,
    })

    return { success: true }
  },
})

export const createAdminQuestion = mutation({
  args: {
    question: v.string(),
    answer: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const questionId = await ctx.db.insert('questions', {
      question: args.question,
      answer: args.answer,
      category: args.category,
      tags: args.tags,
      views: 0,
      helpful: 0,
      createdAt: Date.now(),
      status: 'approved', // Admin questions are pre-approved
      source: 'admin',
    })

    return { questionId, success: true }
  },
})

export const getAllQuestions = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('approved'),
        v.literal('rejected'),
        v.literal('all'),
      ),
    ),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    const limit = args.limit || 20
    const page = args.page || 1
    const skip = (page - 1) * limit

    let allQuestions
    if (args.status && args.status !== 'all') {
      allQuestions = await ctx.db
        .query('questions')
        .withIndex('by_status', (q) =>
          q.eq('status', args.status as 'pending' | 'approved' | 'rejected'),
        )
        .collect()
    } else {
      allQuestions = await ctx.db.query('questions').collect()
    }

    const total = allQuestions.length
    const totalPages = Math.ceil(total / limit)
    const questions = allQuestions
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(skip, skip + limit)

    return {
      questions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }
  },
})

export const deleteQuestion = mutation({
  args: {
    questionId: v.id('questions'),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx)

    await ctx.db.delete(args.questionId)

    return { success: true }
  },
})

export const getAdminStats = query({
  handler: async (ctx) => {
    await requireAdmin(ctx)

    const allQuestions = await ctx.db.query('questions').collect()

    const stats = {
      total: allQuestions.length,
      pending: allQuestions.filter((q) => q.status === 'pending').length,
      approved: allQuestions.filter((q) => q.status === 'approved').length,
      rejected: allQuestions.filter((q) => q.status === 'rejected').length,
      userQuestions: allQuestions.filter((q) => q.source === 'user').length,
      adminQuestions: allQuestions.filter((q) => q.source === 'admin').length,
      totalViews: allQuestions.reduce((sum, q) => sum + q.views, 0),
      totalHelpful: allQuestions.reduce((sum, q) => sum + q.helpful, 0),
    }

    return stats
  },
})

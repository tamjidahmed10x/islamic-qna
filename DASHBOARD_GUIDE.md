# Islamic Q&A - Dashboard & Question Management System

## Overview

এই গাইডে আপনার Islamic Q&A অ্যাপ্লিকেশনে যুক্ত করা নতুন Admin ও User Dashboard সিস্টেম সম্পর্কে বর্ণনা করা হয়েছে।

## Features Implemented

### ১. User Dashboard (Profile Page)

**Location:** `/profile`

#### Features:

- ✅ ব্যবহারকারীর প্রোফাইল তথ্য প্রদর্শন
- ✅ ব্যবহারকারীর জমা দেওয়া প্রশ্নের তালিকা
- ✅ প্রশ্নের স্ট্যাটাস ট্র্যাকিং (অপেক্ষমাণ, অনুমোদিত, প্রত্যাখ্যাত)
- ✅ পরিসংখ্যান কার্ড (মোট প্রশ্ন, অপেক্ষমাণ, উত্তরপ্রাপ্ত, প্রত্যাখ্যাত)
- ✅ Admin Panel Quick Access (শুধুমাত্র অ্যাডমিনদের জন্য)
- ✅ প্রশ্নের উত্তর প্রদর্শন
- ✅ প্রত্যাখ্যানের কারণ প্রদর্শন

#### Components Used:

- `UserProfile.tsx` - Updated with full dashboard functionality
- Uses `api.questions.getMyQuestions` to fetch user's questions
- Uses `api.users.getCurrentUser` to check admin status

### ২. Question Submission System

**Location:** `/questions` page এ Dialog/Modal হিসেবে

#### Features:

- ✅ সুন্দর Modal Dialog ব্যবহার করে প্রশ্ন জমা দেওয়া
- ✅ Category Selection (10টি বিভাগ)
- ✅ Tag Management (সর্বোচ্চ 5টি)
- ✅ Form Validation using Zod
- ✅ Real-time form feedback
- ✅ Success/Error toast notifications

#### Form Fields:

1. **প্রশ্ন (Required):** 10-500 অক্ষর
2. **বিভাগ (Required):** নামাজ, রোজা, যাকাত, হজ্জ, কুরআন, হাদিস, বিবাহ, আমল, কোরবানি, অন্যান্য
3. **ট্যাগ (Optional):** সর্বোচ্চ 5টি

### ৩. Admin Panel Integration

#### Admin Features in Questions Page:

- ✅ Admin filter options (`?admin=true` or `?admin=pending`)
- ✅ View all questions with status badges
- ✅ Filter by status (pending/approved/rejected/all)
- ✅ Quick access to admin panel from header
- ✅ Status badges on each question card

#### Admin Functions Available (in Convex):

```typescript
// Get all questions with filtering
api.questions.getAllQuestions({ status, page, limit })

// Get pending questions
api.questions.getPendingQuestions({ page, limit })

// Answer a question
api.questions.answerQuestion({ questionId, answer, tags })

// Reject a question
api.questions.rejectQuestion({ questionId, rejectionReason })

// Create admin question
api.questions.createAdminQuestion({ question, answer, category, tags })

// Delete question
api.questions.deleteQuestion({ questionId })

// Get admin stats
api.questions.getAdminStats()
```

## How to Use

### For Users:

1. **প্রশ্ন জমা দেওয়া:**
   - `/questions` পেজে যান
   - "প্রশ্ন জিজ্ঞাসা করুন" বাটনে ক্লিক করুন
   - Modal-এ আপনার প্রশ্ন লিখুন
   - Category নির্বাচন করুন
   - (Optional) Tags যোগ করুন
   - "প্রশ্ন জমা দিন" ক্লিক করুন

2. **আপনার প্রশ্ন দেখা:**
   - উপরের নেভিগেশনে "প্রোফাইল" লিংকে ক্লিক করুন
   - আপনার সব প্রশ্ন এবং তাদের স্ট্যাটাস দেখুন
   - অনুমোদিত প্রশ্নের উত্তর পড়ুন

### For Admins:

1. **Admin Panel Access:**
   - প্রোফাইল পেজে যান
   - "Admin Panel" কার্ডে "সব প্রশ্ন পরিচালনা করুন" বা "অপেক্ষমাণ প্রশ্ন" ক্লিক করুন

2. **Pending Questions Review:**
   - `/questions?admin=pending` URL ব্যবহার করুন
   - অপেক্ষমাণ প্রশ্নগুলি দেখুন
   - প্রতিটি প্রশ্নে status badge দেখুন

3. **Question Management:**
   - Profile page থেকে admin functions access করুন
   - Questions page এ admin filter ব্যবহার করুন

## Database Schema Updates

### Questions Table:

```typescript
{
  question: string,
  answer: string,
  category: string,
  views: number,
  helpful: number,
  tags: string[],
  createdAt: number,
  userId?: Id<'users'>,           // User who asked
  status?: 'pending' | 'approved' | 'rejected',
  answeredBy?: Id<'users'>,       // Admin who answered
  answeredAt?: number,
  rejectionReason?: string,
  source?: 'admin' | 'user',
}
```

### Users Table:

```typescript
{
  clerkId: string,
  email: string,
  name?: string,
  imageUrl?: string,
  role?: 'user' | 'admin',
  isActive?: boolean,
}
```

## API Endpoints

### User Functions:

- `api.questions.submitQuestion({ question, category, tags })`
- `api.questions.getMyQuestions({ page, limit })`

### Admin Functions:

- `api.questions.getPendingQuestions({ page, limit })`
- `api.questions.getAllQuestions({ status, page, limit })`
- `api.questions.answerQuestion({ questionId, answer, tags })`
- `api.questions.rejectQuestion({ questionId, rejectionReason })`
- `api.questions.deleteQuestion({ questionId })`
- `api.questions.createAdminQuestion({ question, answer, category, tags })`
- `api.questions.getAdminStats()`

### Public Functions:

- `api.questions.list({ page, category, search, sortBy, limit })`
- `api.questions.getById({ id })`
- `api.questions.getCategories()`
- `api.questions.incrementViews({ id })`
- `api.questions.incrementHelpful({ id })`

## UI Components Used

### shadcn/ui Components:

- ✅ Card, CardHeader, CardTitle, CardDescription, CardContent
- ✅ Badge
- ✅ Button
- ✅ Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger
- ✅ Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage
- ✅ Input
- ✅ Textarea
- ✅ Tabs, TabsList, TabsTrigger, TabsContent

### Icons (lucide-react):

- MessageCircle, Shield, Clock, CheckCircle, XCircle, FileQuestion, Users, Star, BookOpen, Plus, X

## Status Flow

```
User submits question
        ↓
Status: 'pending'
        ↓
    ┌────────────┐
    │   Admin    │
    │  Reviews   │
    └────────────┘
         ↓
    ┌────┴────┐
    ↓         ↓
Approve    Reject
    ↓         ↓
'approved' 'rejected'
(with      (with
answer)    reason)
```

## File Structure

```
src/
├── components/
│   ├── UserProfile.tsx          # Updated with dashboard
│   └── Header.tsx                # Updated navigation
├── routes/
│   ├── index.tsx                 # Updated CTA links
│   ├── profile.tsx               # User dashboard
│   └── questions.tsx             # Question list + submission modal
convex/
├── questions.ts                  # All question CRUD operations
├── users.ts                      # User management + getCurrentUser
├── rbac.ts                       # Role-based access control
└── schema.ts                     # Database schema
```

## Testing Checklist

### User Flow:

- [ ] User can submit a question
- [ ] User can view their questions
- [ ] User can see question status
- [ ] User receives toast notifications
- [ ] User can see approved answers
- [ ] User can see rejection reasons

### Admin Flow:

- [ ] Admin sees admin panel in profile
- [ ] Admin can view all questions
- [ ] Admin can filter by status
- [ ] Admin can answer questions (implement answer page)
- [ ] Admin can reject questions (implement reject feature)
- [ ] Admin can view statistics

## Next Steps

### Recommended Implementations:

1. **Answer Question Page:** `/admin/answer/$id`
   - Form to provide detailed answer
   - Edit tags
   - Submit or reject

2. **Admin Dashboard:** `/admin/dashboard`
   - Statistics overview
   - Recent pending questions
   - Quick actions

3. **Notifications:**
   - Email notifications when question answered
   - In-app notifications

4. **Search & Filtering:**
   - Advanced search
   - Multiple category filtering

5. **Question Details:**
   - Dedicated question view page
   - Comments/discussions
   - Related questions

## Environment Variables

Make sure these are set in your Convex deployment:

```
CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

## Security Notes

- ✅ RBAC implemented using `requireAuth()` and `requireAdmin()`
- ✅ User authentication required for submitting questions
- ✅ Admin role check for all admin operations
- ✅ Input validation using Zod schemas
- ✅ XSS protection through React's built-in escaping

## Support & Maintenance

For questions or issues:

1. Check Convex dashboard for errors
2. Review browser console for client-side errors
3. Check the Convex logs using the MCP tools

---

**Created:** October 28, 2025
**Version:** 1.0
**Status:** ✅ Implemented & Ready for Testing

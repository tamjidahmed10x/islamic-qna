# Islamic Q&A Platform 🕌

একটি আধুনিক ইসলামিক প্রশ্ন-উত্তর প্ল্যাটফর্ম যেখানে ইসলাম সম্পর্কে প্রশ্ন জিজ্ঞাসা এবং উত্তর পাওয়া যায়।

## Features ✨

- 🔐 Clerk Authentication (Email, Google, etc.)
- 📝 User Question Submission
- 👨‍💼 Admin Question Management
- 🔍 Category-wise Question Browsing
- 🏷️ Tag-based Filtering
- 📊 View & Helpful Counting
- 🎯 Role-Based Access Control (RBAC)

## Tech Stack 🛠️

- **Frontend:** React + TanStack Router + Vite
- **Backend:** Convex (Real-time Database)
- **Auth:** Clerk
- **Styling:** Tailwind CSS + Shadcn UI
- **Language:** TypeScript

## Getting Started 🚀

### Installation

```bash
npm install
```

### Setup Environment Variables

Create a `.env.local` file:

```bash
# Convex
CONVEX_DEPLOYMENT=dev:your-deployment
VITE_CONVEX_URL=https://your-deployment.convex.cloud

# Clerk
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### Setup Convex Environment

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN "https://your-clerk-domain.clerk.accounts.dev"
npx convex env set CLERK_SECRET_KEY "your_clerk_secret_key"
```

### Run Development Server

```bash
# Terminal 1: Start Convex
npx convex dev

# Terminal 2: Start Vite
npm run dev
```

## Building For Production 📦

```bash
npm run build
```

## Admin Setup 👨‍💼

First user can promote themselves to admin:

```javascript
// Browser console (when logged in)
const user = await convexClient.query(api.users.current)
const result = await convexClient.mutation(api.admin.promoteToAdmin, {
  userId: user._id,
})
```

## Data Migration 🔄

If you have existing data without proper fields:

```javascript
// Browser console (as admin)
const result = await convexClient.mutation(api.admin.fixExistingData)
console.log('Migration result:', result)
```

## Project Structure 📁

```
islamic-qna/
├── convex/              # Backend (Convex functions)
│   ├── schema.ts        # Database schema
│   ├── users.ts         # User management
│   ├── questions.ts     # Question CRUD
│   ├── rbac.ts          # Role-based access control
│   ├── admin.ts         # Admin functions
│   └── auth.config.ts   # Clerk auth config
├── src/
│   ├── components/      # React components
│   ├── routes/          # TanStack Router routes
│   └── integrations/    # Third-party integrations
└── public/              # Static assets
```

## Available Scripts 📜

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## Key Features Explained 🔑

### User Roles

- **User:** Can submit questions, view all approved questions
- **Admin:** Can answer questions, approve/reject submissions, manage users

### Question Workflow

1. User submits a question → Status: `pending`
2. Admin reviews and answers → Status: `approved`
3. Question appears in public listing
4. Users can mark questions as helpful

### Database Schema

**Users Table:**

```typescript
{
  clerkId: string
  email: string
  name?: string
  imageUrl?: string
  role?: 'user' | 'admin'
  isActive?: boolean
}
```

**Questions Table:**

```typescript
{
  question: string
  answer: string
  category: string
  tags: string[]
  views: number
  helpful: number
  status?: 'pending' | 'approved' | 'rejected'
  source?: 'user' | 'admin'
  userId?: Id<'users'>
  answeredBy?: Id<'users'>
  answeredAt?: number
  rejectionReason?: string
  createdAt: number
}
```

## Troubleshooting 🔧

### User not syncing to database?

1. Check Clerk JWT template is named "convex"
2. Verify environment variables
3. Check browser console for errors

### Schema validation errors?

Run the data migration:

```javascript
await convexClient.mutation(api.admin.fixExistingData)
```

### Questions not showing?

- Check question status (only `approved` are visible)
- Verify you're logged in for user-specific queries

## Contributing 🤝

Feel free to submit issues and pull requests!

## License 📄

MIT

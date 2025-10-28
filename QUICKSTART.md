# 🚀 Quick Start - Authentication এর জন্য

## এক্ষুনি শুরু করুন (3 টি ধাপ)

### ধাপ ১: Convex Dev Server চালান

নতুন terminal এ:

```bash
npx convex dev
```

এটি চালু রাখুন।

### ধাপ ২: Development Server চালান

আরেকটি terminal এ:

```bash
npm run dev
```

### ধাপ ৩: ব্রাউজারে টেস্ট করুন

1. http://localhost:3000 খুলুন
2. Header এ "লগইন" বা "সাইন আপ" ক্লিক করুন
3. আপনার email দিয়ে sign up করুন
4. Sign in এর পর আপনার profile picture দেখবেন
5. http://localhost:3000/profile এ গিয়ে আপনার profile দেখুন

## ✅ কি কি কাজ করবে

- ✅ লগইন/সাইন আপ modal
- ✅ Email verification (Clerk এর development mode এ auto-verified)
- ✅ User profile picture
- ✅ Sign out button
- ✅ Protected profile page
- ✅ User information display

## 🔧 যদি কোনো সমস্যা হয়

### Problem: Clerk modal আসছে না

**Solution:** `.env.local` file এ `VITE_CLERK_PUBLISHABLE_KEY` আছে কিনা check করুন এবং development server restart করুন।

### Problem: "Unauthorized" error

**Solution:** Convex dashboard এ গিয়ে environment variables check করুন:

- `CLERK_SECRET_KEY`
- `CLERK_JWT_ISSUER_DOMAIN`

### Problem: Database schema error

**Solution:**

```bash
npx convex dev
# Wait for it to push the schema
```

## 📖 আরো জানতে

- সম্পূর্ণ documentation: `AUTH_SETUP.md`
- Implementation details: `AUTHENTICATION_COMPLETE.md`

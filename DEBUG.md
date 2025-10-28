# User Sync Debugging Guide

## সমস্যা

User signup/signin করার পর user table-এ data যাচ্ছে না।

## পরিবর্তন করা হয়েছে

### 1. UserSync Component-এ Logging যোগ করা হয়েছে

- `src/components/UserSync.tsx`-এ console logs যোগ করা হয়েছে
- এখন browser console-এ দেখতে পারবেন:
  - 🔄 User sync attempt
  - ✅ Success message
  - ❌ Error message

### 2. Convex users.store Function-এ Logging যোগ করা হয়েছে

- `convex/users.ts`-এ detailed logging যোগ করা হয়েছে
- Convex dashboard logs-এ দেখতে পারবেন:
  - 🔐 Authentication status
  - 📊 Existing user check
  - ✅ User creation/update confirmation

### 3. users.list Query যোগ করা হয়েছে

- Database-এ কতজন user আছে check করার জন্য

## Debugging Steps

### Step 1: Browser Console চেক করুন

1. Application চালু করুন: `npm run dev`
2. Browser-এ F12 press করে Console tab open করুন
3. Login/Signup করুন
4. Console-এ দেখুন:
   - `🔄 UserSync: Attempting to sync user` - এটি দেখা যাচ্ছে কিনা
   - কোনো error message আছে কিনা

### Step 2: Convex Dashboard Logs চেক করুন

1. Convex dashboard-এ যান: https://dashboard.convex.dev
2. আপনার project select করুন
3. "Logs" tab-এ যান
4. Login করার সময় দেখুন:
   - `🔐 users.store called` log আসছে কিনা
   - `hasIdentity: true` হচ্ছে কিনা
   - কোনো error আছে কিনা

### Step 3: Database Check করুন

Convex dashboard-এ:

1. "Data" tab-এ যান
2. `users` table select করুন
3. কোনো entry আছে কিনা দেখুন

অথবা Browser Console-এ run করুন:

```javascript
// Convex client থেকে users list get করুন
const users = await convexClient.query(api.users.list)
console.log('Total users:', users.length)
console.log('Users:', users)
```

## সম্ভাব্য সমস্যা ও সমাধান

### সমস্যা 1: "Not authenticated" Error

**কারণ:** Clerk token Convex-এ properly configure হয়নি

**সমাধান:**

```bash
# Convex environment variables check করুন
npx convex env list

# নিচের variables থাকতে হবে:
# - CLERK_JWT_ISSUER_DOMAIN
# - CLERK_SECRET_KEY
```

যদি না থাকে, set করুন:

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN "https://quiet-ox-46.clerk.accounts.dev"
npx convex env set CLERK_SECRET_KEY "sk_test_..."
```

### সমস্যা 2: UserSync Component Load হচ্ছে না

**চেক করুন:** `src/routes/__root.tsx`-এ `<UserSync />` আছে কিনা

### সমস্যা 3: ConvexProviderWithClerk Setup Issue

**চেক করুন:** `src/integrations/convex/provider.tsx`-এ:

- `VITE_CONVEX_URL` properly set আছে কিনা
- `VITE_CLERK_PUBLISHABLE_KEY` properly set আছে কিনা

`.env.local` file check করুন:

```
VITE_CONVEX_URL=https://...
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### সমস্যা 4: Email Field Missing

যদি Clerk user-এর email না থাকে, schema error হবে।

**সমাধান:** Clerk dashboard-এ ensure করুন যে email required field হিসেবে set আছে।

## Testing Script

Browser console-এ এই code run করে test করুন:

```javascript
// 1. Check Clerk user
const clerkUser = clerk.user
console.log('Clerk User:', {
  id: clerkUser?.id,
  email: clerkUser?.primaryEmailAddress?.emailAddress,
  name: clerkUser?.fullName,
})

// 2. Check Convex connection
console.log('Convex URL:', import.meta.env.VITE_CONVEX_URL)

// 3. Manually trigger user sync
// (এটি শুধু তখনই কাজ করবে যদি আপনি logged in থাকেন)
```

## Next Steps

যদি এখনও কাজ না করে:

1. **Browser Console** এবং **Convex Logs** উভয় জায়গার error messages share করুন
2. `npx convex env list` এর output share করুন
3. `.env.local` file-এর content (secret values ছাড়া) share করুন

## Convex Auth Configuration Check

Convex-এ Clerk authentication properly configure করার জন্য verify করুন:

```bash
# 1. Check auth configuration
npx convex env list

# 2. Verify Clerk settings match
# CLERK_JWT_ISSUER_DOMAIN should match Clerk dashboard's issuer
# CLERK_SECRET_KEY should be from Clerk dashboard

# 3. Test authentication
npx convex dev --once
# Then check logs for any auth-related errors
```

# 🔴 সমস্যার সমাধান: User Data User Table-এ যাচ্ছে না

## 🎯 সমস্যা চিহ্নিত

Convex logs থেকে পরিষ্কার:

```
[CONVEX M(users:store)] [LOG] '🔐 users.store called' {
  hasIdentity: false,  ← এটাই মূল সমস্যা
  identitySubject: undefined,
  identityEmail: undefined
}
[CONVEX M(users:store)] Uncaught Error: Not authenticated
```

**কারণ:** Clerk JWT token Convex backend verify করতে পারছে না।

## ✅ সমাধান (Step by Step)

### 🔧 Step 1: Clerk Dashboard-এ JWT Template Setup

এটাই **সবচেয়ে গুরুত্বপূর্ণ** step!

1. **Clerk Dashboard খুলুন:** https://dashboard.clerk.com/
2. আপনার application select করুন
3. Left sidebar → **"JWT Templates"** click করুন
4. **"+ New template"** অথবা **"Convex"** preset select করুন
5. Template configuration:
   - **Name:** `convex` (lowercase, এটি অবশ্যই "convex" হতে হবে!)
   - **Token Lifetime:** 60 seconds
   - **Claims:**
     ```json
     {
       "aud": "convex"
     }
     ```
6. **Save/Apply changes** করুন

### ✅ Step 2: Convex Environment Variables Verify

Terminal-এ check করুন:

```bash
npx convex env list
```

নিশ্চিত করুন এই দুটি variable আছে:

- `CLERK_JWT_ISSUER_DOMAIN` = `https://quiet-ox-46.clerk.accounts.dev`
- `CLERK_SECRET_KEY` = `sk_test_...`

যদি না থাকে, set করুন:

```bash
npx convex env set CLERK_JWT_ISSUER_DOMAIN "https://quiet-ox-46.clerk.accounts.dev"
npx convex env set CLERK_SECRET_KEY "sk_test_NOJbZVqGtwn4NSLZMdnUyqYskN0qbKf662iuL6Qm2T"
```

### 📄 Step 3: Files Already Updated

আমি ইতিমধ্যে এই files update করেছি:

✅ `convex/auth.config.ts` - Convex auth configuration
✅ `src/components/UserSync.tsx` - Debugging logs added
✅ `convex/users.ts` - Detailed logging added
✅ `src/integrations/convex/provider.tsx` - Enhanced logging

### 🔄 Step 4: Test করুন

1. **Application চালান:**

   ```bash
   npm run dev
   ```

2. **Browser খুলুন:** http://localhost:3001 (বা যে port show করছে)

3. **Browser Console খুলুন** (F12 press করুন)

4. **Login/Signup করুন**

5. **Console দেখুন:**

   ```
   ✅ Convex URL configured: https://strong-ermine-210.convex.cloud
   ✅ Clerk Publishable Key configured
   🔄 UserSync: Attempting to sync user { userId: '...', email: '...', name: '...' }
   ✅ User synced successfully: <userId>
   ```

6. **Terminal-এ Convex logs দেখুন:**

   ```bash
   npx convex dev
   ```

   দেখবেন:

   ```
   🔐 users.store called { hasIdentity: true, ... }  ← true হতে হবে!
   ✅ Created new user: <userId>
   ```

### 🔍 Step 5: Database Verify করুন

**Option 1: Convex Dashboard**

1. https://dashboard.convex.dev/ open করুন
2. আপনার project select করুন
3. **Data** tab → **users** table
4. নতুন user entry দেখতে পাবেন

**Option 2: Browser Console**

```javascript
// এটি copy করে browser console-এ paste করুন
console.log('Checking users in database...')
// আপনি Convex dashboard থেকে users table check করতে পারবেন
```

## 🐛 যদি এখনও কাজ না করে

### Troubleshooting Checklist:

1. **Clerk JWT Template name check করুন:**
   - Clerk Dashboard → JWT Templates
   - Name অবশ্যই **"convex"** (lowercase) হতে হবে
   - Audience field-এ **"convex"** থাকতে হবে

2. **Browser cache clear করুন:**

   ```
   1. Logout করুন
   2. Browser cache clear করুন (Ctrl+Shift+Delete)
   3. Page refresh করুন
   4. আবার login করুন
   ```

3. **JWT Token manually verify করুন:**

   Browser console-এ:

   ```javascript
   // Login করার পর এটি run করুন
   const session = await window.Clerk.session
   const token = await session?.getToken({ template: 'convex' })
   console.log('JWT Token:', token)

   // এই token copy করে https://jwt.io তে paste করুন
   // Decoded payload-এ check করুন:
   // - "aud": "convex" আছে কিনা
   // - "iss": "https://quiet-ox-46.clerk.accounts.dev" match করছে কিনা
   ```

4. **Convex logs monitor করুন:**

   ```bash
   # Terminal-এ continuously logs দেখুন
   npx convex dev

   # এরপর browser-এ login করুন এবং logs observe করুন
   ```

5. **Environment variables re-check:**

   ```bash
   # Frontend (.env.local)
   cat .env.local

   # Backend (Convex)
   npx convex env list
   ```

## 📊 Success Indicators

যখন সবকিছু ঠিক থাকবে:

### ✅ Browser Console:

```
✅ Convex URL configured
✅ Clerk Publishable Key configured
🔄 UserSync: Attempting to sync user
✅ User synced successfully: j123abc...
```

### ✅ Convex Terminal Logs:

```
🔐 users.store called { hasIdentity: true, identitySubject: 'user_2abc...', identityEmail: 'user@example.com' }
📊 Existing user check: { found: false }
✅ Created new user: j123abc...
```

### ✅ Convex Dashboard → Data → users:

```
_id          | clerkId      | email            | name
j123abc...   | user_2abc... | user@example.com | John Doe
```

## 🎯 Quick Fix Summary

মূল সমস্যা এবং সমাধান:

| সমস্যা                  | সমাধান                                                     |
| ----------------------- | ---------------------------------------------------------- |
| `hasIdentity: false`    | Clerk Dashboard → JWT Templates → Create "convex" template |
| Token verify হচ্ছে না   | CLERK_JWT_ISSUER_DOMAIN environment variable check করুন    |
| User data save হচ্ছে না | JWT template name অবশ্যই "convex" (lowercase)              |

## 📞 Additional Help

যদি এখনও সমস্যা থাকে, এই information শেয়ার করুন:

1. **Browser Console logs** (login করার পর)
2. **Convex Terminal logs** (`npx convex dev`)
3. **Clerk JWT Template screenshot** (Clerk Dashboard থেকে)
4. **JWT Token decoded payload** (https://jwt.io থেকে)

---

**Most Important:** Clerk Dashboard-এ গিয়ে JWT Template name "convex" করুন। এটাই main fix! 🎉

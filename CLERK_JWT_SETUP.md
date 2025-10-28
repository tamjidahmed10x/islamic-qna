# 🔧 Clerk JWT Template Setup for Convex

## সমস্যা

Convex logs দেখাচ্ছে: `hasIdentity: false` - এর মানে Clerk JWT token Convex verify করতে পারছে না।

## ✅ সমাধান: Clerk Dashboard-এ Convex JWT Template Configure করুন

### Step 1: Clerk Dashboard-এ যান

1. [Clerk Dashboard](https://dashboard.clerk.com/) open করুন
2. আপনার application select করুন (যেখানে `VITE_CLERK_PUBLISHABLE_KEY` এর publisable key আছে)

### Step 2: JWT Templates তৈরি করুন

1. Left sidebar থেকে **"JWT Templates"** click করুন
2. **"+ New template"** button click করুন
3. Template name দিন: **"convex"** (lowercase, এটি important!)
4. অথবা template list থেকে **"Convex"** preset select করুন

### Step 3: Template Configure করুন

যদি manually configure করতে হয়:

**Token Lifetime:**

- Set করুন: 60 seconds (বা আপনার preference অনুযায়ী)

**Claims:**

```json
{
  "aud": "convex",
  "iss": "{{org.slug}}",
  "sub": "{{user.id}}"
}
```

**অথবা Convex Preset থাকলে:**

- শুধু "Convex" preset select করুন, এটি automatically configure হবে

### Step 4: Template Save করুন

1. **"Apply changes"** বা **"Save"** click করুন
2. Template name note করুন (হতে হবে: **"convex"**)

### Step 5: Verify Configuration

Clerk Dashboard-এ verify করুন:

- Template name: `convex` (lowercase)
- Issuer (iss): আপনার Clerk domain (e.g., `https://quiet-ox-46.clerk.accounts.dev`)
- Audience (aud): `convex`

## 🔍 Verification Steps

### 1. Check Clerk Configuration

Browser console-এ (F12):

```javascript
// Check if Clerk is loaded
console.log('Clerk loaded:', !!window.Clerk)

// Check user
window.Clerk.user
```

### 2. Check JWT Token

Browser console-এ login করার পর:

```javascript
// Get session token
const session = await window.Clerk.session
const token = await session.getToken({ template: 'convex' })
console.log('JWT Token:', token)

// Decode token (at jwt.io)
// Verify that it has 'convex' in the audience field
```

### 3. Test User Sync

Application চালান এবং login করুন:

```bash
npm run dev
```

Browser console-এ দেখুন:

- ✅ `UserSync: Attempting to sync user`
- ✅ `User synced successfully`

Convex logs-এ দেখুন:

- ✅ `hasIdentity: true`
- ✅ `Created new user` বা `Updated existing user`

## 📝 Important Notes

### Template Name অবশ্যই "convex" হতে হবে

`ConvexProviderWithClerk` automatically `convex` template name খোঁজে। যদি আপনি different name দেন, তাহলে manually specify করতে হবে:

```tsx
<ConvexProviderWithClerk
  client={convexClient}
  useAuth={useAuth}
  jwtTemplateName="your-template-name" // if not "convex"
>
  {children}
</ConvexProviderWithClerk>
```

### Issuer Domain Match করতে হবে

Clerk JWT issuer domain এবং Convex environment variable-এ set করা domain same হতে হবে:

```bash
# Convex env check করুন
npx convex env get CLERK_JWT_ISSUER_DOMAIN
# Output: https://quiet-ox-46.clerk.accounts.dev

# এটি Clerk dashboard-এর issuer সাথে match করতে হবে
```

## 🐛 Troubleshooting

### যদি এখনও "Not authenticated" error আসে:

1. **Browser cache clear করুন:**
   - Logout করুন
   - Browser cache clear করুন
   - আবার login করুন

2. **Clerk session refresh করুন:**

   ```javascript
   // Browser console-এ
   await window.Clerk.session?.reload()
   ```

3. **JWT token verify করুন:**
   - Browser console থেকে token copy করুন
   - [jwt.io](https://jwt.io) তে paste করুন
   - Check করুন:
     - `aud` field-এ "convex" আছে কিনা
     - `iss` field match করছে কিনা
     - Token expire হয়নি

4. **Convex logs check করুন:**
   ```bash
   npx convex dev
   # Login করুন এবং logs observe করুন
   ```

## ✅ Success Indicators

যখন সব ঠিক থাকবে, আপনি দেখবেন:

**Browser Console:**

```
✅ Convex URL configured: https://strong-ermine-210.convex.cloud
✅ Clerk Publishable Key configured
🔄 UserSync: Attempting to sync user { userId: 'user_...', email: '...', name: '...' }
✅ User synced successfully: <userId>
```

**Convex Logs:**

```
🔐 users.store called { hasIdentity: true, identitySubject: 'user_...', identityEmail: '...' }
✅ Created new user: <userId>
```

**Convex Dashboard → Data → users table:**

- নতুন user entry দেখা যাবে

## 🚀 Next Steps

JWT template configure করার পর:

1. Application restart করুন
2. Logout করে আবার login করুন
3. Browser console এবং Convex logs check করুন
4. Convex dashboard-এ Data tab-এ users table check করুন

যদি সব কিছু ঠিক থাকে, আপনার user data এখন properly sync হবে! 🎉

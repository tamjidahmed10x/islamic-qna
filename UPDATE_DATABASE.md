# Database Update করুন 🔄

আপনার database এ অনেক questions আছে কিন্তু `status` field নেই। এটি fix করার দুটি উপায়:

## Option 1: Admin Panel থেকে Migration চালান (Recommended)

1. Application চালান:

```bash
npm run dev
```

2. Browser এ login করুন as Admin

3. Browser Console (F12) এ এই command চালান:

```javascript
const result = await convexClient.mutation(api.admin.fixExistingData)
console.log('Migration result:', result)
```

এটি automatically সব questions এ `status` এবং `source` field add করবে।

## Option 2: Manual Query দিয়ে Fix করুন

যদি admin access না থাকে, তাহলে আপনি Convex Dashboard থেকে এই script চালাতে পারেন:

### Convex Dashboard → Functions → Run Function

**Function:** `admin.fixExistingData`

**Args:** `{}`

## Expected Result:

```javascript
{
  success: true,
  usersTotal: X,
  usersUpdated: Y,
  questionsTotal: 25,  // আপনার ক্ষেত্রে এটি দেখা যাচ্ছে
  questionsUpdated: 25  // সব questions update হবে
}
```

## Verification:

Migration এর পর browser console এ check করুন:

```javascript
const questions = await convexClient.query(api.questions.list, {})
console.log('Total questions:', questions.pagination.total)
console.log('Questions:', questions.questions)
```

আপনার সব 25টি questions এখন দেখা যাবে! ✅

---

**Note:** আমি ইতিমধ্যে code fix করেছি যাতে `status` field ছাড়া questions ও show হয়। কিন্তু proper data consistency এর জন্য migration চালানো ভালো।

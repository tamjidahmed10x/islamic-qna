import { httpRouter } from 'convex/server'
import { httpAction } from './_generated/server'

const http = httpRouter()

http.route({
  path: '/clerk-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const payloadString = await request.text()
    const headerPayload = request.headers

    try {
      // Clerk webhook থেকে user data process করুন
      // এখানে আপনি Clerk webhook data handle করতে পারেন
      console.log('Clerk webhook received:', payloadString)
      return new Response(null, { status: 200 })
    } catch (error) {
      console.error('Error processing Clerk webhook:', error)
      return new Response('Webhook processing failed', { status: 500 })
    }
  }),
})

export default http

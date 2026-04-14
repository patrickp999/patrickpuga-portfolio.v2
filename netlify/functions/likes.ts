import { Handler } from '@netlify/functions'
import { Client } from 'pg'

const getClient = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })
  await client.connect()
  return client
}

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' }
  }

  const client = await getClient()

  try {
    if (event.httpMethod === 'GET') {
      const slug = event.queryStringParameters?.slug
      if (!slug) return { statusCode: 400, headers, body: JSON.stringify({ error: 'slug required' }) }

      const result = await client.query(
        'SELECT like_count FROM post_likes WHERE slug = $1',
        [slug]
      )
      const count = result.rows[0]?.like_count ?? 0
      return { statusCode: 200, headers, body: JSON.stringify({ slug, likes: count }) }
    }

    if (event.httpMethod === 'POST') {
      const body = JSON.parse(event.body ?? '{}')
      const slug = body.slug
      if (!slug) return { statusCode: 400, headers, body: JSON.stringify({ error: 'slug required' }) }

      const result = await client.query(
        `INSERT INTO post_likes (slug, like_count)
         VALUES ($1, 1)
         ON CONFLICT (slug)
         DO UPDATE SET like_count = post_likes.like_count + 1
         RETURNING like_count`,
        [slug]
      )
      const count = result.rows[0].like_count
      return { statusCode: 200, headers, body: JSON.stringify({ slug, likes: count }) }
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }

  } catch (err) {
    console.error(err)
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error' }) }
  } finally {
    await client.end()
  }
}

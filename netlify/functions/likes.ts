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
      const slugs = event.queryStringParameters?.slugs
      const slug = event.queryStringParameters?.slug

      // Batch: GET ?slugs=a,b,c → { likes: { a: 3, b: 0, c: 12 } }
      if (slugs) {
        const slugList = slugs.split(',').map(s => s.trim()).filter(Boolean)
        if (slugList.length === 0) return { statusCode: 400, headers, body: JSON.stringify({ error: 'slugs required' }) }

        const result = await client.query(
          'SELECT slug, like_count FROM post_likes WHERE slug = ANY($1)',
          [slugList]
        )
        const likesMap: Record<string, number> = {}
        for (const s of slugList) likesMap[s] = 0
        for (const row of result.rows) likesMap[row.slug] = row.like_count
        return { statusCode: 200, headers, body: JSON.stringify({ likes: likesMap }) }
      }

      // Single: GET ?slug=a → { slug: "a", likes: 3 }
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

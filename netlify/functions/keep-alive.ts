import { Handler } from "@netlify/functions";
import { Client } from "pg";

export const handler: Handler = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query("SELECT 1 FROM post_likes LIMIT 1;");
    console.log("keep-alive: ok");
    return { statusCode: 200, body: JSON.stringify({ message: "keep-alive: ok" }) };
  } catch (err) {
    console.error("keep-alive: failed", err);
    return { statusCode: 500, body: JSON.stringify({ error: "keep-alive: failed" }) };
  } finally {
    await client.end();
  }
};

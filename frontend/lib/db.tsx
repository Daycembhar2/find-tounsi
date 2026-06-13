import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function query<T>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const result = await pool.query(text, params)
  return result.rows
}
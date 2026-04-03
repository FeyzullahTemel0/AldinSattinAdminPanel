import pg from 'pg';

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const sql = `
  select
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
  from information_schema.columns
  where table_schema = 'public'
  order by table_name, ordinal_position
`;

try {
  const result = await pool.query(sql);
  console.log(JSON.stringify(result.rows, null, 2));
} catch (error) {
  console.error('DB_ERROR', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}

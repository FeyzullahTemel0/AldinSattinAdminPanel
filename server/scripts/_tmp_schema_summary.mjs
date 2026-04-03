import pg from "pg";
const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});
const sql = `
  select table_name, string_agg(column_name, ', ' order by ordinal_position) as columns
  from information_schema.columns
  where table_schema='public'
  group by table_name
  order by table_name;
`;
const countSql = `
  select count(*)::int as table_count
  from information_schema.tables
  where table_schema='public' and table_type='BASE TABLE';
`;
try {
  const [countRes, rowsRes] = await Promise.all([pool.query(countSql), pool.query(sql)]);
  console.log('TABLE_COUNT=' + countRes.rows[0].table_count);
  for (const r of rowsRes.rows) {
    console.log(r.table_name + ' => ' + r.columns);
  }
} finally {
  await pool.end();
}

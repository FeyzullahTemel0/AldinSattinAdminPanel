import fs from 'fs';
import pg from 'pg';

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const tableSql = `
  select table_name
  from information_schema.tables
  where table_schema = 'public' and table_type = 'BASE TABLE'
  order by table_name
`;

const columnSql = `
  select table_name, column_name, data_type, is_nullable, column_default
  from information_schema.columns
  where table_schema = 'public'
  order by table_name, ordinal_position
`;

try {
  const [tablesResult, columnsResult] = await Promise.all([
    pool.query(tableSql),
    pool.query(columnSql),
  ]);

  const columnsByTable = {};
  for (const col of columnsResult.rows) {
    if (!columnsByTable[col.table_name]) {
      columnsByTable[col.table_name] = [];
    }
    columnsByTable[col.table_name].push({
      column_name: col.column_name,
      data_type: col.data_type,
      is_nullable: col.is_nullable,
      column_default: col.column_default,
    });
  }

  const payload = {
    generated_at: new Date().toISOString(),
    tables: tablesResult.rows.map((r) => r.table_name),
    columns_by_table: columnsByTable,
  };

  fs.writeFileSync('./live-schema.json', JSON.stringify(payload, null, 2));
  console.log(`Wrote live-schema.json with ${payload.tables.length} tables`);
} catch (error) {
  console.error('DB_EXPORT_ERROR', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}

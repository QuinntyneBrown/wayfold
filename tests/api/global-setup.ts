import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

/** Creates the test database if needed and applies every migration once per run. */
export default async function setup() {
  const url = new URL(process.env.TEST_DATABASE_URL!);
  const name = url.pathname.slice(1);

  const admin = postgres({ ...connection(url), database: "postgres", onnotice: () => {} });
  const [exists] = await admin`select 1 from pg_database where datname = ${name}`;
  if (!exists) await admin.unsafe(`create database "${name}"`);
  await admin.end();

  const sql = postgres(url.href, { max: 1, onnotice: () => {} });
  await migrate(drizzle(sql), { migrationsFolder: "src/lib/db/migrations" });
  await sql.end();
}

function connection(url: URL) {
  return {
    host: url.hostname,
    port: Number(url.port),
    username: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
  };
}

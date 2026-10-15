import { sql as rawSql } from "drizzle-orm";
import { afterAll, beforeEach } from "vitest";
import { client, db } from "@/lib/db/client";

beforeEach(async () => {
  await db.execute(rawSql`truncate table users cascade`);
});

afterAll(async () => {
  await client.end();
});

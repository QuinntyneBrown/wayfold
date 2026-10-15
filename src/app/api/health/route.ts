import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { healthResponse } from "@/lib/health";

export async function GET(_request: Request) {
  return healthResponse(() => db.execute(sql`select 1`));
}

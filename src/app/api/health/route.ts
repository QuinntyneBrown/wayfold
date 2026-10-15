import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { healthResponse } from "@/lib/health";
import { withErrorHandling } from "@/lib/with-error-handling";

export const GET = withErrorHandling("/api/health", () => healthResponse(() => db.execute(sql`select 1`)));

import { boolean, index, integer, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  gtaArea: text("gta_area"),
  homeChurch: text("home_church"),
  bio: text("bio"),
  showHomeChurch: boolean("show_home_church").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** One signed-in browser. The id is the SHA-256 of the cookie token, so the table never holds a usable token. */
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  invalidatedAt: timestamp("invalidated_at", { withTimezone: true }),
});

export const failedSignIns = pgTable(
  "failed_sign_ins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    attemptedAt: timestamp("attempted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("failed_sign_ins_user_attempted_idx").on(table.userId, table.attemptedAt)],
);

const owner = (column: string) =>
  uuid(column)
    .notNull()
    .references(() => users.id, { onDelete: "cascade" });

export const garageCars = pgTable("garage_cars", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: owner("owner_id"),
  year: integer("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  nickname: text("nickname"),
  photoRef: text("photo_ref"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const follows = pgTable(
  "follows",
  {
    followerId: owner("follower_id"),
    followeeId: owner("followee_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.followerId, table.followeeId] })],
);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: owner("author_id"),
    topic: text("topic").notNull(),
    text: text("text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("posts_author_created_idx").on(table.authorId, table.createdAt)],
);

export const likes = pgTable(
  "likes",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: owner("user_id"),
  },
  (table) => [primaryKey({ columns: [table.postId, table.userId] })],
);

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  authorId: owner("author_id"),
  text: text("text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const providers = pgTable("providers", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: owner("owner_id"),
  name: text("name").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const vehicles = pgTable(
  "vehicles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sellerType: text("seller_type").notNull(),
    ownerId: owner("owner_id"),
    providerId: uuid("provider_id").references(() => providers.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    year: integer("year").notNull(),
    make: text("make").notNull(),
    model: text("model").notNull(),
    price: integer("price").notNull(),
    mileage: integer("mileage").notNull(),
    condition: text("condition"),
    description: text("description").notNull().default(""),
    features: text("features").array().notNull().default([]),
    municipality: text("municipality").notNull(),
    status: text("status").notNull().default("published"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("vehicles_status_created_idx").on(table.status, table.createdAt)],
);

export const vehiclePhotos = pgTable("vehicle_photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  photoRef: text("photo_ref").notNull(),
  position: integer("position").notNull().default(0),
});

export const inquiries = pgTable("inquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "cascade" }),
  senderId: owner("sender_id"),
  recipientId: owner("recipient_id"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

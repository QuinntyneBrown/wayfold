import { and, asc, count, desc, eq, inArray, or, type SQL } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { comments, follows, likes, posts, users } from "@/lib/db/schema";
import { projectMember } from "@/lib/member-view-policy";
import { isUuid } from "@/lib/validation";

export const TOPICS = ["My car", "Question", "Recommendation", "For sale"] as const;

type Author = { id: string; displayName: string; gtaArea: string | null; homeChurch?: string };
export type PostComment = { id: string; text: string; createdAt: Date; author: { id: string; displayName: string } };
export type PostItem = {
  id: string;
  topic: string;
  text: string;
  createdAt: Date;
  author: Author;
  likes: number;
  liked: boolean;
  comments: PostComment[];
  mine: boolean;
};

const FEED_LIMIT = 50;

function authorOf(user: typeof users.$inferSelect): Author {
  const { id, displayName, gtaArea, homeChurch } = projectMember(user, true);
  return homeChurch ? { id, displayName, gtaArea, homeChurch } : { id, displayName, gtaArea };
}

/** Posts matching the condition, newest first, each with its author, like count, whether the viewer liked it, and its comments. */
async function loadPosts(where: SQL | undefined, viewerId: string): Promise<PostItem[]> {
  const rows = await db
    .select({ post: posts, author: users })
    .from(posts)
    .innerJoin(users, eq(users.id, posts.authorId))
    .where(where)
    .orderBy(desc(posts.createdAt))
    .limit(FEED_LIMIT);
  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.post.id);
  const likeRows = await db.select().from(likes).where(inArray(likes.postId, ids));
  const commentRows = await db
    .select({ comment: comments, author: users })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.authorId))
    .where(inArray(comments.postId, ids))
    .orderBy(asc(comments.createdAt));

  return rows.map(({ post, author }) => ({
    id: post.id,
    topic: post.topic,
    text: post.text,
    createdAt: post.createdAt,
    author: authorOf(author),
    likes: likeRows.filter((like) => like.postId === post.id).length,
    liked: likeRows.some((like) => like.postId === post.id && like.userId === viewerId),
    comments: commentRows
      .filter((row) => row.comment.postId === post.id)
      .map(({ comment, author: commenter }) => ({
        id: comment.id,
        text: comment.text,
        createdAt: comment.createdAt,
        author: { id: commenter.id, displayName: commenter.displayName },
      })),
    mine: author.id === viewerId,
  }));
}

export async function createPost(authorId: string, topic: string, text: string) {
  const [created] = await db.insert(posts).values({ authorId, topic, text }).returning({ id: posts.id });
  return (await loadPosts(eq(posts.id, created.id), authorId))[0];
}

/** The member's own posts and the posts of everyone they follow. */
export async function feedFor(viewerId: string) {
  const followed = db.select({ id: follows.followeeId }).from(follows).where(eq(follows.followerId, viewerId));
  return loadPosts(or(eq(posts.authorId, viewerId), inArray(posts.authorId, followed)), viewerId);
}

export async function postsBy(authorId: string, viewerId: string) {
  return loadPosts(eq(posts.authorId, authorId), viewerId);
}

export async function findPost(id: string) {
  if (!isUuid(id)) return null;
  const [post] = await db.select({ id: posts.id, authorId: posts.authorId }).from(posts).where(eq(posts.id, id));
  return post ?? null;
}

export async function deletePost(id: string) {
  await db.delete(posts).where(eq(posts.id, id));
}

/** Likes the post, or removes the member's like when it is already there. */
export async function toggleLike(postId: string, userId: string) {
  const mine = and(eq(likes.postId, postId), eq(likes.userId, userId));
  const [existing] = await db.select({ postId: likes.postId }).from(likes).where(mine);
  if (existing) await db.delete(likes).where(mine);
  else await db.insert(likes).values({ postId, userId }).onConflictDoNothing();
  const [{ total }] = await db.select({ total: count() }).from(likes).where(eq(likes.postId, postId));
  return { liked: !existing, likes: total };
}

export async function addComment(postId: string, authorId: string, text: string): Promise<PostComment> {
  const [created] = await db.insert(comments).values({ postId, authorId, text }).returning();
  const [author] = await db.select({ id: users.id, displayName: users.displayName }).from(users).where(eq(users.id, authorId));
  return { id: created.id, text: created.text, createdAt: created.createdAt, author };
}

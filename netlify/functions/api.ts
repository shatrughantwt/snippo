import type { Config } from "@netlify/functions";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { snippets, users } from "../../db/schema.js";

const json = (data: unknown, status = 200) => Response.json(data, { status });

const getSecret = () => {
  const secret = Netlify.env.get("JWT_SECRET");
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return secret;
};

const signToken = (userId: number) =>
  jwt.sign({ userId }, getSecret(), { expiresIn: "7d" });

const getUserId = (req: Request): number | null => {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, getSecret()) as { userId: number };
    return decoded.userId;
  } catch {
    return null;
  }
};

// Keep the `_id` field the client already expects
const toClientSnippet = ({ id, userId, ...rest }: typeof snippets.$inferSelect) => ({
  _id: id,
  user: userId,
  ...rest,
});

const readBody = async (req: Request) => {
  try {
    return await req.json();
  } catch {
    return {};
  }
};

export default async (req: Request) => {
  const path = new URL(req.url).pathname.replace(/^\/api/, "").replace(/\/$/, "");
  const method = req.method;

  try {
    if (method === "POST" && path === "/auth/register") {
      const { username, password } = await readBody(req);
      const normalizedUsername = typeof username === "string" ? username.trim() : "";

      if (!normalizedUsername || !password) {
        return json({ message: "Username and password are required" }, 400);
      }

      const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, normalizedUsername));
      if (existing) {
        return json({ message: "Username already exists" }, 400);
      }

      const hashed = await bcrypt.hash(String(password), 10);
      const [user] = await db
        .insert(users)
        .values({ username: normalizedUsername, password: hashed })
        .returning();

      return json(
        { token: signToken(user.id), userId: user.id, username: user.username },
        201,
      );
    }

    if (method === "POST" && path === "/auth/login") {
      const { username, password } = await readBody(req);
      const normalizedUsername = typeof username === "string" ? username.trim() : "";

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, normalizedUsername));
      if (!user || !(await bcrypt.compare(String(password ?? ""), user.password))) {
        return json({ message: "Invalid credentials" }, 400);
      }

      return json({ token: signToken(user.id), userId: user.id, username: user.username });
    }

    // Everything below requires authentication
    const userId = getUserId(req);
    if (userId === null) {
      return json({ message: "Token is not valid" }, 401);
    }

    if (method === "GET" && path === "/auth/me") {
      const [user] = await db
        .select({ _id: users.id, username: users.username, createdAt: users.createdAt })
        .from(users)
        .where(eq(users.id, userId));
      return json(user ?? null);
    }

    if (method === "GET" && path === "/snippets") {
      const rows = await db
        .select()
        .from(snippets)
        .where(eq(snippets.userId, userId))
        .orderBy(desc(snippets.createdAt))
        .limit(20);
      return json(rows.map(toClientSnippet));
    }

    if (method === "POST" && path === "/snippets") {
      const { title, code, lang, ext, color, lines, preview } = await readBody(req);
      const [snippet] = await db
        .insert(snippets)
        .values({ title, code, lang, ext, color, lines: Number(lines), preview, userId })
        .returning();
      return json(toClientSnippet(snippet), 201);
    }

    const deleteMatch = path.match(/^\/snippets\/(\d+)$/);
    if (method === "DELETE" && deleteMatch) {
      const id = Number(deleteMatch[1]);
      const deleted = await db
        .delete(snippets)
        .where(and(eq(snippets.id, id), eq(snippets.userId, userId)))
        .returning({ id: snippets.id });
      if (deleted.length === 0) {
        return json({ message: "Snippet not found" }, 404);
      }
      return json({ message: "Snippet deleted" });
    }

    return json({ message: "Not found" }, 404);
  } catch (error) {
    console.error("API error:", error);
    return json({ message: "Server error" }, 500);
  }
};

export const config: Config = {
  path: "/api/*",
};

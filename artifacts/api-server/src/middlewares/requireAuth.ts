import { type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const auth = getAuth(req);
  const clerkId = auth?.userId;
  if (!clerkId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const email = (auth?.sessionClaims?.email as string ?? "").trim();
  const shouldBeAdmin = isAdminEmail(email);

  let user = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);

  if (!user.length) {
    const [created] = await db.insert(usersTable).values({
      clerkId,
      email,
      role: shouldBeAdmin ? "admin" : "user",
    }).returning();
    user = [created];
  } else if (shouldBeAdmin && user[0].role !== "admin") {
    const [updated] = await db
      .update(usersTable)
      .set({ role: "admin" })
      .where(eq(usersTable.clerkId, clerkId))
      .returning();
    user = [updated];
  }

  (req as any).currentUser = user[0];
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  await requireAuth(req, res, async () => {
    const user = (req as any).currentUser;
    if (user?.role !== "admin") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  });
}

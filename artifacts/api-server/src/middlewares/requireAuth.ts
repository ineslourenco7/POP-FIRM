import { type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const auth = getAuth(req);
  const clerkId = auth?.userId;
  if (!clerkId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  let user = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId)).limit(1);

  if (!user.length) {
    const email = auth?.sessionClaims?.email as string ?? "";
    const [created] = await db.insert(usersTable).values({
      clerkId,
      email,
      role: "user",
    }).returning();
    user = [created];
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

import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma/client";

const CreateContactSchema = z.object({
  userId: z.string().optional(),
  name: z.string().min(1).max(120),
  phone: z.string().min(5).max(30),
  email: z.string().email().optional().or(z.literal("")),
  relation: z.enum(["family", "friend", "colleague"]),
});

const ContactIdSchema = z.object({
  id: z.string().min(1),
});

async function ensureDemoUser(userId: string): Promise<void> {
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      name: "Guardian Demo User",
    },
  });
}

/** Contacts CRUD endpoints. */
export function contactsRouter(): Router {
  const r = Router();

  r.get("/", async (req, res, next) => {
    try {
      const userId = typeof req.query.userId === "string" ? req.query.userId : "demo-user";
      await ensureDemoUser(userId);
      const contacts = await prisma.contact.findMany({
        where: { userId, isActive: true },
        orderBy: { id: "asc" },
      });
      res.json(contacts);
    } catch (error) {
      next(error);
    }
  });

  r.post("/", async (req, res, next) => {
    try {
      const input = CreateContactSchema.parse(req.body);
      const userId = input.userId ?? "demo-user";
      await ensureDemoUser(userId);

      const existingCount = await prisma.contact.count({
        where: { userId, isActive: true },
      });
      if (existingCount >= 5) {
        res.status(400).json({
          error: {
            code: "LIMIT_REACHED",
            message: "Maximum 5 trusted contacts allowed.",
          },
        });
        return;
      }

      const contact = await prisma.contact.create({
        data: {
          userId,
          name: input.name,
          phone: input.phone,
          email: input.email || undefined,
          relation: input.relation,
        },
      });
      res.status(201).json(contact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: { code: "BAD_REQUEST", message: error.message } });
        return;
      }
      next(error);
    }
  });

  r.delete("/:id", async (req, res, next) => {
    try {
      const parsed = ContactIdSchema.parse(req.params);
      await prisma.contact.update({
        where: { id: parsed.id },
        data: { isActive: false },
      });
      res.status(204).send();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: { code: "BAD_REQUEST", message: error.message } });
        return;
      }
      next(error);
    }
  });

  r.post("/:id/test-alert", async (req, res, next) => {
    try {
      const parsed = ContactIdSchema.parse(req.params);
      const contact = await prisma.contact.findUnique({
        where: { id: parsed.id },
      });
      if (!contact || !contact.isActive) {
        res.status(404).json({ error: { code: "NOT_FOUND", message: "Contact not found." } });
        return;
      }
      res.json({
        ok: true,
        message: `Test alert queued for ${contact.name}.`,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: { code: "BAD_REQUEST", message: error.message } });
        return;
      }
      next(error);
    }
  });

  return r;
}


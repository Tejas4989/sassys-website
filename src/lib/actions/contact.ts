"use server";

import { z } from "zod";
import { sendContactMessage } from "@/lib/email";

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(120),
  email: z.string().trim().email("Please enter a valid email."),
  message: z.string().trim().min(1, "Please enter a message.").max(4000),
});

export type ContactState = { ok: boolean; error?: string };

export async function submitContact(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  try {
    await sendContactMessage(parsed.data);
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: "Sorry — we couldn't send your message. Please call (519) 000-0000.",
    };
  }
}

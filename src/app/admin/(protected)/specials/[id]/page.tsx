import { db } from "@/db/client";
import { weeklySpecials } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateSpecial, deleteSpecial } from "@/lib/actions/specials";
import { SpecialForm } from "@/components/admin/special-form";

export default async function EditSpecialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [special] = await db.select().from(weeklySpecials).where(eq(weeklySpecials.id, id));
  if (!special) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-bold mb-6">Edit Special</h1>
      <SpecialForm special={special} action={(fd) => updateSpecial(id, fd)} deleteAction={() => deleteSpecial(id)} />
    </div>
  );
}

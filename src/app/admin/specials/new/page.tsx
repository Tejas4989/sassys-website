import { createSpecial } from "@/lib/actions/specials";
import { SpecialForm } from "@/components/admin/special-form";

export default function NewSpecialPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl font-bold mb-6">New Weekly Special</h1>
      <SpecialForm action={createSpecial} />
    </div>
  );
}

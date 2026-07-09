import { createWholesaleAccount } from "@/lib/actions/wholesale-accounts";
import { WholesaleAccountForm } from "@/components/admin/wholesale-account-form";

export default function NewWholesaleAccountPage() {
  return (
    <div className="max-w-xl">
      <h1 className="font-heading text-2xl font-bold mb-6">New Wholesale Account</h1>
      <WholesaleAccountForm action={createWholesaleAccount} />
    </div>
  );
}

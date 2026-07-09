import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for ordering from Sassy's Bakery.",
  robots: { index: false },
};

const UPDATED = "July 9, 2026";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: {UPDATED}</p>

      <div className="prose prose-sm max-w-none space-y-8 text-foreground">

        <section>
          <h2 className="font-heading text-xl font-semibold mb-3">1. About Us</h2>
          <p>
            Sassy&apos;s Bakery (&quot;Sassy&apos;s,&quot; &quot;we,&quot; &quot;us&quot;) operates at 225 King St,
            Thorndale, Ontario N0M 2P0. By using our website or placing an order, you agree to these Terms of Service.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-3">2. Ordering</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Retail orders:</strong> Orders placed online are subject to availability. We
              reserve the right to refuse or cancel any order at our discretion, with a full refund.
            </li>
            <li>
              <strong>Order confirmation:</strong> An order is confirmed once you receive a
              confirmation email. Online payment (via Clover Hosted Checkout) is charged at the
              time of order placement.
            </li>
            <li>
              <strong>Pickup times:</strong> Selecting a pickup time is an estimate, not a
              guarantee. We will notify you if your order is running significantly late.
            </li>
            <li>
              <strong>Pay at store:</strong> Orders placed with &quot;pay at store&quot; are
              reserved but not guaranteed until payment is received at pickup.
            </li>
            <li>
              <strong>Catering orders:</strong> Orders flagged as catering (total ≥ $200, pickup
              more than 48 hours away, or explicitly marked as catering) are subject to employee
              review before confirmation. We will contact you to confirm details or adjust the
              order.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-3">3. Pricing and Payment</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>All prices are in Canadian dollars and exclude Ontario HST (13%) unless stated otherwise.</li>
            <li>HST is added at checkout and shown before you confirm your order.</li>
            <li>
              We reserve the right to correct pricing errors. If an error affects your placed order,
              we will contact you before proceeding.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-3">4. Refunds and Cancellations</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Cancellation before preparation:</strong> Contact us immediately at (519) 461-1234.
              We will cancel and fully refund orders that have not yet been prepared.
            </li>
            <li>
              <strong>Quality issues:</strong> If you receive an item that does not meet a
              reasonable quality standard, contact us within 24 hours of pickup and we will make
              it right with a replacement or refund.
            </li>
            <li>
              <strong>No-show:</strong> If you do not pick up a pre-paid order within 2 hours of
              your scheduled pickup time without contacting us, the order is forfeited and no
              refund is issued.
            </li>
            <li>
              <strong>Catering cancellations:</strong> Catering orders cancelled within 48 hours of
              the scheduled pickup/delivery time may be subject to a cancellation fee up to 50% of
              the order total, at our discretion.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-3">5. Wholesale Accounts</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Wholesale accounts are by invitation only. Approval is at our sole discretion.</li>
            <li>Wholesale prices are net-30 unless otherwise agreed in writing.</li>
            <li>
              We reserve the right to suspend a wholesale account for non-payment, misuse of the
              portal, or any other reason, with reasonable notice.
            </li>
            <li>
              Minimum order quantities (MOQ) apply per item as listed in the wholesale catalog.
              Orders below MOQ may be refused or adjusted.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-3">6. Allergens and Dietary Requirements</h2>
          <p>
            Our kitchen handles common allergens including gluten, dairy, eggs, nuts, and
            sesame. While we take reasonable precautions, we cannot guarantee a fully
            allergen-free environment. Customers with severe allergies should contact us directly
            before ordering. We are not responsible for adverse reactions arising from undisclosed
            allergen sensitivities.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-3">7. Intellectual Property</h2>
          <p>
            All content on this website — including text, photographs, logos, and menu items —
            is the property of Sassy&apos;s Bakery or used with permission. You may not reproduce,
            distribute, or use our content for commercial purposes without written consent.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-3">8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by Ontario and Canadian law, Sassy&apos;s Bakery&apos;s
            liability for any claim arising from an order or use of this website is limited to the
            amount paid for the order in question. We are not liable for indirect, consequential,
            or punitive damages.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-3">9. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the Province of Ontario and the federal laws
            of Canada applicable therein. Disputes shall be resolved in the courts of Ontario.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-3">10. Changes</h2>
          <p>
            We may update these Terms from time to time. The &quot;Last updated&quot; date reflects
            the most recent revision. Continued use of the website after changes constitutes
            acceptance.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-3">11. Contact</h2>
          <address className="not-italic text-sm">
            Sassy&apos;s Bakery<br />
            225 King St, Thorndale, Ontario N0M 2P0<br />
            <a href="mailto:inquiry@mysassys.com" className="text-primary hover:underline">inquiry@mysassys.com</a><br />
            (519) 461-1234
          </address>
        </section>
      </div>
    </div>
  );
}

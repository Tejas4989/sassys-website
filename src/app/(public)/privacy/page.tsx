import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Sassy's Bakery collects, uses, and protects your personal information.",
  robots: { index: false },
};

const UPDATED = "July 9, 2026";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: {UPDATED}</p>

      <div className="prose prose-sm max-w-none space-y-8 text-foreground">

        <section>
          <h2 className="font-heading text-xl font-semibold mb-3">1. Who We Are</h2>
          <p>
            Sassy&apos;s Bakery (&quot;Sassy&apos;s,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is a family-owned bakery, deli, and
            pizzeria located at 225 King St, Thorndale, Ontario N0M 2P0. We operate this website
            at mysassys.com to allow customers to browse our menu, place pickup orders, and — for
            wholesale accounts — manage standing orders.
          </p>
          <p className="mt-2">
            For privacy inquiries, contact us at{" "}
            <a href="mailto:inquiry@mysassys.com" className="text-primary hover:underline">
              inquiry@mysassys.com
            </a>{" "}
            or call (519) 461-1234.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-3">
            2. What Personal Information We Collect
          </h2>
          <p>When you use our website or place an order, we may collect:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Contact information:</strong> name, email address, phone number.</li>
            <li><strong>Order information:</strong> items ordered, pickup/delivery date and time, order notes, order total.</li>
            <li>
              <strong>Payment information:</strong> We do not store any payment card details. Online
              payments are processed directly by Clover (a third-party payment processor). We
              receive only a transaction confirmation reference.
            </li>
            <li>
              <strong>Wholesale account information:</strong> business name, delivery address,
              order history.
            </li>
            <li>
              <strong>Push notification tokens:</strong> If you opt in to browser push
              notifications, we store your browser&apos;s push subscription endpoint to send you
              order-ready alerts. You can withdraw consent at any time.
            </li>
            <li>
              <strong>Technical information:</strong> standard server logs (IP address, browser
              type, pages visited). We use Cloudflare Web Analytics, which is cookie-free and
              does not track individuals across sites.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-3">
            3. Why We Collect It (Purposes)
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To fulfill your order and communicate its status (order confirmation, ready-for-pickup notification).</li>
            <li>To manage wholesale accounts and invoicing (net-30 billing).</li>
            <li>To respond to inquiries and catering requests.</li>
            <li>To improve our website and understand how it is used (aggregate analytics only).</li>
            <li>To meet our legal and regulatory obligations.</li>
          </ul>
          <p className="mt-2">
            We collect only the minimum information necessary for these purposes. We do not sell,
            rent, or trade your personal information to any third party for their marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-3">4. Legal Basis (PIPEDA)</h2>
          <p>
            We collect and use your personal information with your consent (express or implied) or
            as otherwise permitted under Canada&apos;s <em>Personal Information Protection and
            Electronic Documents Act</em> (PIPEDA). When you place an order, you consent to the
            collection and use of your information for the purposes described above.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-3">
            5. Electronic Communications (CASL)
          </h2>
          <p>
            Emails we send you regarding your orders (confirmation, ready-for-pickup, catering
            inquiry responses) are <em>transactional messages</em> and do not require separate
            consent under Canada&apos;s <em>Anti-Spam Legislation</em> (CASL). We do not send
            promotional or marketing emails without your explicit opt-in consent. If we ever
            introduce a newsletter or promotional emails, we will collect your consent separately.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-3">6. Third-Party Services</h2>
          <p>We use the following third-party services that may process your information:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>
              <strong>Clover</strong> (payment processing) — your card details are entered directly
              on Clover&apos;s secure hosted checkout page and never touch our servers.
            </li>
            <li>
              <strong>Resend</strong> — transactional email delivery (order confirmations). Resend
              processes your email address to deliver messages on our behalf.
            </li>
            <li>
              <strong>Cloudflare</strong> — our website infrastructure, including cookie-free
              analytics and DDoS protection. Cloudflare processes network traffic including IP
              addresses.
            </li>
            <li>
              <strong>Neon</strong> — database hosting. Your order and account data is stored in a
              Neon Postgres database hosted in Canada or the United States.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-3">7. Data Retention</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Order records:</strong> retained for 7 years for accounting and tax purposes, then deleted.</li>
            <li><strong>Push notification subscriptions:</strong> deleted immediately when you unsubscribe, or within 30 days of an expired subscription.</li>
            <li><strong>Wholesale account data:</strong> retained while the account is active and for 7 years after closure.</li>
            <li><strong>Server logs:</strong> automatically purged by Cloudflare within 30 days.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-3">8. Your Rights</h2>
          <p>Under PIPEDA, you have the right to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Know what personal information we hold about you.</li>
            <li>Request corrections to inaccurate information.</li>
            <li>Withdraw consent (where consent is the legal basis), subject to legal or contractual restrictions.</li>
            <li>Request deletion of your information, subject to legal retention obligations.</li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, email{" "}
            <a href="mailto:inquiry@mysassys.com" className="text-primary hover:underline">
              inquiry@mysassys.com
            </a>{" "}
            with your name and the nature of your request. We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-3">9. Cookies</h2>
          <p>
            Our website uses only <strong>essential cookies</strong> required for authentication
            (login sessions). We do not use advertising or third-party tracking cookies. Our
            analytics provider (Cloudflare Web Analytics) is cookie-free. You can disable cookies
            in your browser settings, but doing so will prevent you from logging into the wholesale
            portal or admin panel.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-3">10. Security</h2>
          <p>
            We use industry-standard safeguards including TLS encryption in transit, hashed
            password storage (argon2), rate-limited login endpoints, and audit logging for
            administrative actions. No system is perfectly secure; we will notify affected
            individuals in the event of a privacy breach as required by law.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-3">11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date at the
            top of this page reflects when it was last revised. Continued use of our website after
            changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-3">12. Contact</h2>
          <p>
            Questions or complaints about our privacy practices? Contact us at:
          </p>
          <address className="not-italic mt-2 text-sm">
            Sassy&apos;s Bakery<br />
            225 King St, Thorndale, Ontario N0M 2P0<br />
            <a href="mailto:inquiry@mysassys.com" className="text-primary hover:underline">inquiry@mysassys.com</a><br />
            (519) 461-1234
          </address>
          <p className="mt-2 text-sm text-muted-foreground">
            If you are not satisfied with our response, you may contact the{" "}
            <a
              href="https://www.priv.gc.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Office of the Privacy Commissioner of Canada
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
}

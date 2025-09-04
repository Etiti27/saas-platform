// PrivacyPolicyIkenga.jsx
import React from "react";
import { Printer, ChevronDown } from "lucide-react";

function Section({ id, title, children, defaultOpen = false }) {
  return (
    <details
      id={id}
      className="group rounded-2xl border border-[#224765]/10 bg-white/80 p-4 shadow-sm open:shadow-md"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-[#224765]">{title}</h2>
        <ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180 text-[#224765]" />
      </summary>
      <div className="mt-3 space-y-3 text-sm leading-6 text-[#224765]/90">
        {children}
      </div>
    </details>
  );
}

export function PrivacyPolicyIkenga({
  companyName = "IKENGA",
  legalEntity = "IKENGA SRL",
  address = "Avenue Example 1, 1000 Brussels, Belgium",
  email = "privacy@ikenga.app",
  phone = "+32 2 123 45 67",
  dpo = "Jane Doe — dpo@ikenga.app",
  subProcessorsLink = "/legal/subprocessors",
  dpaLink = "/legal/dpa",
  webFormLink = "/privacy-request",
  cookiePolicyLink = "/legal/cookies",
  effectiveDate = "04 September 2025",
}) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#EAF2FF] via-white to-[#D3E2FD]">
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#224765]">
              Privacy Policy — {companyName}
            </h1>
            <p className="text-xs text-[#224765]/70">
              Effective date: {effectiveDate} • Jurisdiction: Belgium (GDPR)
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border border-[#224765]/20 bg-white px-3 py-2 text-sm text-[#224765] shadow-sm hover:bg-[#D3E2FD]/40"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-5 p-4">
        <section className="rounded-2xl border border-[#224765]/10 bg-white/80 p-5 shadow-sm">
          <p className="text-sm leading-6 text-[#224765]/90">
            {companyName} provides SaaS tools for SME onboarding, inventory, sales,
            invoicing, and dashboards visualising sales performance (“Services”).
            This Policy explains how we process personal data under GDPR and Belgian law.
          </p>
          <p className="mt-3 text-sm leading-6 text-[#224765]/90">
            If you use {companyName} under an organisation account (the “Customer”), that
            organisation is the <strong>controller</strong> for Customer Content; we act
            as <strong>processor</strong>. For our websites, billing, and support,
            {` `}<strong>{companyName}</strong> is the controller.
          </p>
        </section>

        <Section id="who" title="1) Who we are & contact" defaultOpen>
          <p><strong>Controller:</strong> {legalEntity}, Belgium</p>
          <p><strong>Address:</strong> {address}</p>
          <p><strong>Email:</strong> <a className="underline" href={`mailto:${email}`}>{email}</a></p>
          <p><strong>Phone:</strong> {phone}</p>
          {dpo && <p><strong>Data Protection Officer:</strong> {dpo}</p>}
          <p className="pt-2">
            Supervisory authority: GBA/APD — Rue de la Presse 35, 1000 Brussels • +32 2 274 48 00 • contact@apd-gba.be
          </p>
        </Section>

        <Section id="collect" title="2) What we collect">
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Account & profile:</strong> name, work email, hashed password, roles, tenant/company, locale/time zone.</li>
            <li><strong>Onboarding data:</strong> employee identifiers, role, team, start date, optional docs.</li>
            <li><strong>Inventory & sales:</strong> SKUs, stock levels, locations, orders, pricing, taxes.</li>
            <li><strong>Invoicing & billing:</strong> invoices/quotes, buyer/supplier, VAT, payment status.</li>
            <li><strong>Payments (meta only):</strong> last 4 digits/expiry via processor; we don’t store full card data.</li>
            <li><strong>Usage/device logs:</strong> events, IP, browser/OS, error logs.</li>
            <li><strong>Cookies:</strong> necessary/functional; analytics with consent. See <a className="underline" href={cookiePolicyLink}>Cookie Policy</a>.</li>
            <li><strong>Third parties:</strong> SSO basics; data exchanged via integrations you enable.</li>
          </ul>
        </Section>

        <Section id="purposes" title="3) Purposes & legal bases (GDPR)">
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Service delivery & admin:</strong> Contract; Legitimate interests.</li>
            <li><strong>Security & fraud prevention:</strong> Legitimate interests; Legal obligation.</li>
            <li><strong>Billing & VAT:</strong> Contract; Legal obligation.</li>
            <li><strong>Product improvement/analytics:</strong> Legitimate interests; Consent for non-essential cookies.</li>
            <li><strong>Support & comms:</strong> Contract; Legitimate interests.</li>
            <li><strong>Marketing (web):</strong> Consent or Legitimate interests (opt-out).</li>
          </ul>
          <p>We do not sell personal data or use Customer Content for third-party ads.</p>
        </Section>

        <Section id="cookies" title="4) Cookies">
          <p>Necessary, functional, and (with consent) analytics cookies. Manage choices via our banner or your browser.</p>
        </Section>

        <Section id="sharing" title="5) Sharing & recipients">
          <p>Sub-processors (hosting, email, payments, analytics, support) under contract. See <a className="underline" href={subProcessorsLink}>current list</a>. Integrations you enable. Legal requests. No sale or cross-context ad “sharing”.</p>
        </Section>

        <Section id="transfers" title="6) International transfers">
          <p>EEA hosting preferred. If transfers occur, we use SCCs and safeguards with TIAs as required.</p>
        </Section>

        <Section id="retention" title="7) Retention">
          <ul className="list-disc space-y-2 pl-5">
            <li>Customer Content: term + up to 30 days for export; backups roll off ~30–45 days.</li>
            <li>Audit logs: ~12 months (configurable).</li>
            <li>Support: ~24 months after closure.</li>
            <li>Accounting/VAT: 7 years (Belgium).</li>
          </ul>
        </Section>

        <Section id="security" title="8) Security">
          <p>TLS at transit, encryption at rest, RBAC, SSO/MFA, monitoring, secure SDLC, least-privilege, audits. Breach notices per GDPR/Belgian law.</p>
        </Section>

        <Section id="rights" title="9) Your rights">
          <p>End-users under a Customer: contact your admin. Where we are controller (web/billing/support), email <a className="underline" href={`mailto:${email}`}>{email}</a> or use <a className="underline" href={webFormLink}>this form</a> to exercise access/rectification/erasure/restriction/portability/object/withdraw consent.</p>
        </Section>

        <Section id="misc" title="10) Other">
          <p>Children: not directed to under-16s. Customer responsibilities: lawful basis, notices, configuration, DSARs; see <a className="underline" href={dpaLink}>DPA</a>. Third-party links apply their own policies. We may update this Policy; material changes will be notified.</p>
        </Section>

        <p className="py-6 text-center text-xs text-[#224765]/60">
          This template is informational and not legal advice. Tailor to your setup.
        </p>
      </main>
    </div>
  );
}

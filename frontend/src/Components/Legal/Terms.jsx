// TermsIkenga.jsx
import React from "react";
import { Printer } from "lucide-react";

export function TermsIkenga({
  companyName = "IKENGA",
  legalEntity = "IKENGA SRL",
  address = "Avenue Example 1, 1000 Brussels, Belgium",
  legalEmail = "legal@ikenga.app",
  supportEmail = "support@ikenga.app",
  effectiveDate = "04 September 2025",
  lastUpdated = "04 September 2025",
  dpaLink = "/legal/dpa",
  privacyLink = "/privacy",
  auplink = "/legal/aup",
  slaLink = "/legal/sla",
  subprocessorsLink = "/legal/subprocessors",
}) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#EAF2FF] via-white to-[#D3E2FD]">
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#224765]">
              Terms & Conditions — {companyName}
            </h1>
            <p className="text-xs text-[#224765]/70">
              Effective: {effectiveDate} • Last updated: {lastUpdated}
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
            These Terms govern access to and use of {companyName}’s SaaS platform for SME onboarding,
            inventory, sales, invoicing, and performance dashboards (“Services”).
            By using the Services, you agree to these Terms.
          </p>
        </section>

        <Section title="1) Definitions">
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>{companyName}</strong> / “we”: {legalEntity}, Belgium.</li>
            <li><strong>Customer</strong> / “you”: the organisation using the Services.</li>
            <li><strong>Authorised Users</strong>: individuals you permit to access.</li>
            <li><strong>Customer Data</strong>: data you upload (onboarding, inventory, sales, invoices).</li>
            <li><strong>Service Data</strong>: operational data (logs, diagnostics, usage).</li>
            <li><strong>Order</strong>: plan/fees/term document referencing these Terms.</li>
          </ul>
        </Section>

        <Section title="2) Account; Eligibility; Admins">
          <p>Maintain accurate information; keep credentials confidential; ensure Users comply with the AUP (<a className="underline" href={auplink}>link</a>).</p>
        </Section>

        <Section title="3) Subscription; Licence">
          <p>Non-exclusive, non-transferable licence to use the Services for internal business during the subscription term, subject to fees and compliance.</p>
        </Section>

        <Section title="4) Acceptable Use">
          <p>No unlawful content, malware, spam, interference, or prohibited data; we may suspend for urgent risk, abuse, or non-payment.</p>
        </Section>

        <Section title="5) Customer Data; Privacy; DPA">
          <ul className="list-disc space-y-2 pl-5">
            <li>For Customer Data, you are controller; we are processor under the <a className="underline" href={dpaLink}>DPA</a>.</li>
            <li>Privacy Policy: <a className="underline" href={privacyLink}>{privacyLink}</a>.</li>
            <li>Sub-processors: <a className="underline" href={subprocessorsLink}>list</a>.</li>
            <li>Security: encryption in transit/at rest, RBAC, monitoring, MFA/SSO options.</li>
          </ul>
        </Section>

        <Section title="6) Third-Party Services & Integrations">
          <p>Your use of third-party tools is governed by their terms; enable only what you need.</p>
        </Section>

        <Section title="7) Fees, Billing, Taxes">
          <p>Fees per Order; renew unless cancelled per §12; invoices net 30; prices exclude taxes; VAT applies per law; late amounts may accrue legal interest.</p>
        </Section>

        <Section title="8) SLA; Support; Maintenance">
          <p>Business-hours support via <a className="underline" href={`mailto:${supportEmail}`}>{supportEmail}</a>. SLA if agreed: <a className="underline" href={slaLink}>link</a>.</p>
        </Section>

        <Section title="9) Beta Features">
          <p>Beta is “as is,” may change or be withdrawn; excluded from SLA/support.</p>
        </Section>

        <Section title="10) IP & Feedback">
          <p>We own the Services and Service Data. You own Customer Data. Feedback may be used without restriction.</p>
        </Section>

        <Section title="11) Confidentiality">
          <p>Each party protects the other’s confidential information; limited exceptions apply.</p>
        </Section>

        <Section title="12) Suspension; Term; Termination">
          <p>Immediate suspension for security/abuse/non-payment; term and auto-renew per Order; 30-day cure for material breach; 30-day export window after termination.</p>
        </Section>

        <Section title="13) Warranties; Disclaimers">
          <p>Services provided professionally; otherwise “as is/available,” no implied warranties beyond mandatory law.</p>
        </Section>

        <Section title="14) Indemnities">
          <p>Our IP indemnity for authorised use; your indemnity for Customer Data/breach/illegal use.</p>
        </Section>

        <Section title="15) Liability">
          <p>No indirect/special/consequential damages; cap = fees paid in prior 12 months, subject to mandatory exclusions.</p>
        </Section>

        <Section title="16) Publicity">
          <p>We may use name/logo factually unless you opt out in writing.</p>
        </Section>

        <Section title="17) Compliance; Export; Anti-corruption">
          <p>Each party complies with applicable laws, sanctions, and export controls.</p>
        </Section>

        <Section title="18) Changes">
          <p>Material changes notified at least 30 days before effect unless security/legal urgency.</p>
        </Section>

        <Section title="19) Notices">
          <p>To {companyName}: {legalEmail}, {address}. To Customer: account owner’s email/billing address.</p>
        </Section>

        <Section title="20) Governing Law; Venue; Language">
          <p>Belgian law; courts of Brussels; English version controls unless mandatory law requires otherwise.</p>
        </Section>

        <Section title="21) Order of Precedence; Miscellaneous">
          <p>Order → DPA/SLA → Terms → Docs. Assignment allowed to affiliates/ M&A with notice. Severability, no waiver unless written.</p>
        </Section>

        <footer className="rounded-2xl border border-[#224765]/10 bg-white/60 p-4 text-xs text-[#224765]/70">
          Contact: <a className="underline" href={`mailto:${legalEmail}`}>{legalEmail}</a> • Support: <a className="underline" href={`mailto:${supportEmail}`}>{supportEmail}</a>
        </footer>
      </main>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-2xl border border-[#224765]/10 bg-white/80 p-5 shadow-sm">
      <h2 className="mb-2 text-base font-semibold text-[#224765]">{title}</h2>
      <div className="text-sm leading-6 text-[#224765]/90">{children}</div>
    </section>
  );
}

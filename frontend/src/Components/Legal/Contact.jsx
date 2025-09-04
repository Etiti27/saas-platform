// ContactIkenga.jsx
import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from "lucide-react";

export function ContactIkenga({
  companyName = "IKENGA",
  legalEntity = "IKENGA SRL",
  address = "Avenue Example 1, 1000 Brussels, Belgium",
  email = "hello@ikenga.app",
  supportEmail = "support@ikenga.app",
  privacyEmail = "privacy@ikenga.app",
  phone = "+32 2 123 45 67",
}) {
  const [status, setStatus] = useState("idle"); // idle | sending | ok | err

  const onSubmit = (e) => {
    e.preventDefault();
    // If you have a backend endpoint, POST here. For now, open a mailto with form values.
    const fd = new FormData(e.currentTarget);
    const subject = encodeURIComponent(`[${companyName}] ${fd.get("subject") || "Contact"}`);
    const body = encodeURIComponent(
      `Name: ${fd.get("name")}\nEmail: ${fd.get("email")}\n\n${fd.get("message")}`
    );
    setStatus("sending");
    // Simulate quick success; replace with actual fetch
    setTimeout(() => {
      window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
      setStatus("ok");
      e.currentTarget.reset();
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#EAF2FF] via-white to-[#D3E2FD]">
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between p-4">
          <h1 className="text-2xl font-bold tracking-tight text-[#224765]">
            Contact — {companyName}
          </h1>
        </div>
      </header>

      <main className="mx-auto grid max-w-4xl grid-cols-1 gap-6 p-4 md:grid-cols-5">
        {/* Info */}
        <section className="md:col-span-2 rounded-2xl border border-[#224765]/10 bg-white/80 p-5 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-[#224765]">Company</h2>
          <div className="space-y-2 text-sm text-[#224765]/90">
            <p><strong>{legalEntity}</strong></p>
            <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4" /> {address}</p>
            <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {phone}</p>
            <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> <a className="underline" href={`mailto:${email}`}>{email}</a></p>
          </div>

          <h3 className="pt-4 text-sm font-semibold text-[#224765]">Departments</h3>
          <ul className="space-y-2 text-sm text-[#224765]/90">
            <li>Support: <a className="underline" href={`mailto:${supportEmail}`}>{supportEmail}</a></li>
            <li>Privacy: <a className="underline" href={`mailto:${privacyEmail}`}>{privacyEmail}</a></li>
          </ul>
        </section>

        {/* Form */}
        <section className="md:col-span-3 rounded-2xl border border-[#224765]/10 bg-white/80 p-5 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-[#224765]">Send us a message</h2>
          <form onSubmit={onSubmit} className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-[#224765]/70">Your name</label>
                <input name="name" required className="w-full rounded-lg border border-[#224765]/20 px-3 py-2 text-sm outline-none focus:border-[#224765]" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-[#224765]/70">Email</label>
                <input name="email" type="email" required className="w-full rounded-lg border border-[#224765]/20 px-3 py-2 text-sm outline-none focus:border-[#224765]" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#224765]/70">Subject</label>
              <input name="subject" className="w-full rounded-lg border border-[#224765]/20 px-3 py-2 text-sm outline-none focus:border-[#224765]" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#224765]/70">Message</label>
              <textarea name="message" rows={6} required className="w-full rounded-lg border border-[#224765]/20 px-3 py-2 text-sm outline-none focus:border-[#224765]"></textarea>
            </div>
            <button
              type="submit"
              disabled={status === "sending"}
              className="inline-flex items-center gap-2 rounded-lg border border-[#224765]/20 bg-[#224765] px-4 py-2 text-sm text-white shadow-sm hover:opacity-95 disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {status === "sending" ? "Sending…" : "Send message"}
            </button>

            {status === "ok" && (
              <p className="mt-2 flex items-center gap-2 text-sm text-green-700">
                <CheckCircle2 className="h-4 w-4" /> Thanks! Your mail client should open—if not, email us at {supportEmail}.
              </p>
            )}
            {status === "err" && (
              <p className="mt-2 flex items-center gap-2 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" /> Something went wrong. Please email us directly at {supportEmail}.
              </p>
            )}
          </form>
        </section>
      </main>
    </div>
  );
}

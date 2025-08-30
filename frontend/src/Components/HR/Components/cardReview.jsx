import React from 'react';
import {
  User2,
  Briefcase,
  Banknote,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

// Small helper: label/value row
const Row = ({ label, value }) => (
  <div className="flex items-start gap-3 py-2">
    <div className="w-36 shrink-0 text-sm font-medium text-[#224765]">{label}</div>
    <div className="min-w-0 text-sm text-gray-800 break-words">{value || '—'}</div>
  </div>
);

// Section wrapper with icon + title
const Section = ({ icon: Icon, title, children }) => (
  <section className="rounded-xl border border-[#D3E2FD] bg-white p-4 shadow-sm">
    <div className="mb-3 flex items-center gap-2">
      <div className="grid h-8 w-8 place-content-center rounded-lg bg-[#D3E2FD] text-[#224765]">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="text-base font-semibold text-[#224765]">{title}</h3>
    </div>
    {children}
  </section>
);

// Tiny chip for file status
const FileChip = ({ name, ok }) => (
  <span
    className={[
      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1',
      ok
        ? 'bg-[#D3E2FD] text-[#224765] ring-[#C3D4FA]'
        : 'bg-red-50 text-red-700 ring-red-200',
    ].join(' ')}
    title={name || 'Missing'}
  >
    {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
    {ok ? name : 'Missing'}
  </span>
);

/**
 * Pass in the object returned by your buildReview(data).
 * Example:
 *   <ReviewCard review={buildReview(data)} />
 */
export const ReviewCard = ({ review }) => {
  const p = review?.personal ?? {};
  const j = review?.job ?? {};
  const t = review?.tax ?? {};
  const d = review?.documents ?? {};

  return (
    <div className="overflow-hidden rounded-2xl border border-[#D3E2FD] bg-white shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#224765] to-[#4B6EA6] px-6 py-5 text-white">
        <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Review &amp; Confirm</h2>
        <p className="text-white/80 text-xs sm:text-sm mt-1">
          Please review the information below before submitting.
        </p>
      </div>

      {/* Body */}
      <div className="p-6 grid grid-cols-1 gap-4">
        {/* Personal */}
        <Section icon={User2} title="Personal Details">
          <Row label="First name" value={p.firstName} />
          <Row label="Last name" value={p.lastName} />
          <Row label="Date of birth" value={p.dob} />
          <Row label="Email" value={p.email} />
          <Row label="Phone" value={p.phone} />
        </Section>

        {/* Job */}
        <Section icon={Briefcase} title="Job Information">
          <Row label="Position" value={j.position} />
          <Row label="Department" value={j.department} />
          <Row label="Start date" value={j.startDate} />
        </Section>

        {/* Tax & Payroll */}
        <Section icon={Banknote} title="Tax & Payroll">
          <Row label="SSN / Tax No." value={t.ssn} />
          <Row label="Bank name" value={t.bankName} />
          <Row label="Account name" value={t.accountName} />
          <Row label="Account number" value={t.bankAccount} />
        </Section>

        {/* Documents */}
        <Section icon={FileText} title="Uploaded Documents">
          <div className="flex flex-wrap gap-2">
            <FileChip name={d.idFile} ok={!!d.idFile} />
            <FileChip name={d.contractFile} ok={!!d.contractFile} />
            <FileChip name={d.taxFormFile} ok={!!d.taxFormFile} />
          </div>
        </Section>
      </div>

      {/* Footer note */}
      <div className="border-t border-[#D3E2FD] bg-[#F6F9FF] px-6 py-4 text-xs text-[#224765]">
        By clicking <span className="font-semibold">Submit</span>, you confirm that the above
        information is accurate and complete to the best of your knowledge.
      </div>
    </div>
  );
};

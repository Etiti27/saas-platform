import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { InputField, FileInputField } from './Components/InputForm';
import { RadioGroup } from './Components/InputForm';
import { ReviewCard } from './Components/cardReview';



const buildReview = (d) => ({
  personal: d.personal,
  job: {
    position: d.job.position,
    department: d.job.department,
    startDate: d.job.startDate,
  },
  tax: d.tax,
  documents: {
    idFile: d.documents.idFile?.name || null,
    contractFile: d.documents.contractFile?.name || null,
    taxFormFile: d.documents.taxFormFile?.name || null,
  },
});

const steps = [
  'Personal Details',
  'Job Information',
  'Tax & Payroll Info',
  'Upload Documents',
  'Review & Submit',
];

const initialData = {
  personal: { firstName: '', lastName: '', dob: '', email: '', phone: '' },
  job: { position: '', department: '', startDate: '' },
  tax: { ssn: '', bankName: '', bankAccount: '', accountName: '' },
  documents: { idFile: null, contractFile: null, taxFormFile: null },
};

const MultiStepOnboarding = ({user}) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]= useState(false);
  const [err, setErr] = useState(null)
  const sucessGif = "../../../public/icons8-success.gif"
  
  

  // const { user } = bootstrapAuth();
  const schema = user?.schema;
  const tenant_id = user?.tenant_id;
  const name = user?.name;

  // ---------- Validation ----------
  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!data.personal.firstName) e.firstName = 'First name is required';
      if (!data.personal.lastName) e.lastName = 'Last name is required';
      if (!data.personal.email) e.email = 'Email is required';
    }
    if (step === 1) {
      if (!data.job.position) e.position = 'Position is required';
      if (!data.job.department) e.department = 'Department is required';
    }
    if (step === 2) {
      if (!data.tax.ssn) e.ssn = 'SSN / Tax number is required';
      if (!data.tax.bankAccount) e.bankAccount = 'Bank account number is required';
    }
    if (step === 3) {
      if (!data.documents.idFile) e.idFile = 'ID document is required';
      if (!data.documents.contractFile) e.contractFile = 'Contract document is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Used to control "Next/Submit" disabled state without spamming error UI
  const canProceed = useMemo(() => {
    if (step === 0) {
      return !!(data.personal.firstName && data.personal.lastName && data.personal.email);
    }
    if (step === 1) {
      return !!(data.job.position && data.job.department);
    }
    if (step === 2) {
      return !!(data.tax.ssn && data.tax.bankAccount);
    }
    if (step === 3) {
      return !!(data.documents.idFile && data.documents.contractFile);
    }
    return true;
  }, [step, data]);

  const handleNext = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const updateData = (section, key, value) => {
    setData((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  };
  const handleFileChange = (e, key) => updateData('documents', key, e.target.files[0]);

  // ---------- Submit ----------
  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    setErr(null)
    try {
      const fd = new FormData();
      fd.append('firstName', data.personal.firstName);
      fd.append('lastName', data.personal.lastName);
      fd.append('email', data.personal.email);
      fd.append('phone', data.personal.phone);
      fd.append('dateOfBirth', data.personal.dob || '');
      fd.append('position', data.job.position);
      fd.append('department', data.job.department);
      fd.append('startDate', data.job.startDate || '');
      fd.append('ssn', data.tax.ssn ?? '');
      fd.append('bankName', data.tax.bankName || '');
      fd.append('bankAccount', data.tax.bankAccount);
      fd.append('accountName', data.tax.accountName || '');
      fd.append('schema', schema || '');
      fd.append('tenant_id', tenant_id || '');
      fd.append('name', name || '');

      if (data.documents.idFile) fd.append('idFile', data.documents.idFile);
      if (data.documents.contractFile) fd.append('contractFile', data.documents.contractFile);
      if (data.documents.taxFormFile) fd.append('taxFormFile', data.documents.taxFormFile);

      const res=await axios.post('http://localhost:3001/route/addstaff', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if(res.status===200){
        setStep(0);
      setData(initialData);
      setErrors({});
      setErr(null)
      
      setTimeout(() => {
        setSuccess(true)
      }, 2000);
      }

      // Optional: success state / reset
      
    } catch (e) {
      setErr(e.response.data.message)
      console.log(e);
      
    } finally {
      setSubmitting(false);
      setSuccess(false)
    }
  };

  // ---------- UI ----------
  const progress = Math.round((step / (steps.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#D3E2FD_0%,#ffffff_40%)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-4xl">
        {/* Header Card */}
        <div className="rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden bg-white">
          {/* Decorative top with progress */}
          <div className="bg-[#224765] text-white px-6 py-5">
            <div className="flex items-center justify-between">
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight">
                New Employee Onboarding
              </h1>
              <span className="text-xs opacity-90">{progress}%</span>
            </div>
            {/* Progress bar */}
            <div className="mt-3 h-2 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-[#D3E2FD] transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Stepper pills */}
            <div className="mt-4 flex flex-wrap gap-2">
              {steps.map((label, i) => {
                const active = i === step;
                const done = i < step;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => i <= step && setStep(i)}
                    className={[
                      'px-3 py-1.5 rounded-full text-xs font-medium transition',
                      i <= step ? 'cursor-pointer' : 'cursor-not-allowed',
                      active
                        ? 'bg-white text-[#224765]'
                        : done
                        ? 'bg-white/30 text-white'
                        : 'bg-white/10 text-white/80',
                    ].join(' ')}
                    title={label}
                  >
                    {i + 1}. {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Body */}
          <div className="px-6 py-6 grid gap-6">
            <h2 className="text-2xl font-bold text-[#224765]">{steps[step]}</h2>

            {/* Step 0: Personal */}
            {step === 0 && (
              <form className="grid gap-4 sm:grid-cols-2">
                <InputField
                  label="First Name"
                  type="text"
                  value={data.personal.firstName}
                  onChange={(e) => updateData('personal', 'firstName', e.target.value)}
                  error={errors.firstName}
                />
                <InputField
                  label="Last Name"
                  type="text"
                  value={data.personal.lastName}
                  onChange={(e) => updateData('personal', 'lastName', e.target.value)}
                  error={errors.lastName}
                />
                <InputField
                  label="Email"
                  type="email"
                  value={data.personal.email}
                  onChange={(e) => updateData('personal', 'email', e.target.value)}
                  error={errors.email}
                />
                <InputField
                  label="Phone Number"
                  type="tel"
                  value={data.personal.phone}
                  onChange={(e) => updateData('personal', 'phone', e.target.value)}
                />
                <InputField
                  label="Date of Birth"
                  type="date"
                  value={data.personal.dob}
                  onChange={(e) => updateData('personal', 'dob', e.target.value)}
                />
              </form>
            )}

            {/* Step 1: Job */}
            {step === 1 && (
              <form className="grid gap-4 sm:grid-cols-2">
              <RadioGroup
  label="Position"
  name="position"
  value={data.job.position}
  onChange={(val) => updateData('job', 'position', val)}
  error={errors.position}
  columns={3}
  options={[
    'Inventory Manager',
    'Sales Manager',
    'HR Manager',
  ]}
/>

<RadioGroup
  label="Department"
  name="department"
  value={data.job.department}
  onChange={(val) => updateData('job', 'department', val)}
  error={errors.department}
  columns={3}
  options={[
    'Sales',
    'Inventory',
    'Human Resource',
   
  ]}
/>

                <InputField
                  label="Start Date"
                  type="date"
                  value={data.job.startDate}
                  onChange={(e) => updateData('job', 'startDate', e.target.value)}
                />
              </form>
            )}

            {/* Step 2: Tax */}
            {step === 2 && (
              <form className="grid gap-4 sm:grid-cols-2">
                <InputField
                  label="SSN / Tax Number"
                  type="text"
                  value={data.tax.ssn}
                  onChange={(e) => updateData('tax', 'ssn', e.target.value)}
                  error={errors.ssn}
                />
                <InputField
                  label="Bank Name"
                  type="text"
                  value={data.tax.bankName}
                  onChange={(e) => updateData('tax', 'bankName', e.target.value)}
                />
                <InputField
                  label="Account Number"
                  type="number"
                  value={data.tax.bankAccount}
                  onChange={(e) => updateData('tax', 'bankAccount', e.target.value)}
                  error={errors.bankAccount}
                />
                <InputField
                  label="Account Name"
                  type="text"
                  value={data.tax.accountName}
                  onChange={(e) => updateData('tax', 'accountName', e.target.value)}
                />
              </form>
            )}

            {/* Step 3: Uploads */}
            {step === 3 && (
              <div className="grid gap-4">
                <div className="rounded-xl border border-dashed bg-[#D3E2FD]/20 p-4">
                  <FileInputField
                    label="Upload ID Document"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'idFile')}
                    error={errors.idFile}
                    fileName={data.documents.idFile?.name}
                  />
                </div>
                <div className="rounded-xl border border-dashed bg-[#D3E2FD]/20 p-4">
                  <FileInputField
                    label="Upload Contract Document"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, 'contractFile')}
                    error={errors.contractFile}
                    fileName={data.documents.contractFile?.name}
                  />
                </div>
                <div className="rounded-xl border border-dashed bg-[#D3E2FD]/20 p-4">
                  <FileInputField
                    label="Upload Tax Form"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, 'taxFormFile')}
                    error={errors.taxForm}
                    fileName={data.documents.taxFormFile?.name}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
  <div className="mt-2">
    <ReviewCard review={buildReview(data)} />
  </div>
)}
{err && ( <p className="mt-3 text-center text-red-600">{err?.response?.data?.message ||err?.message ||
     String(err)}
  </p>
)}
            {/* Navigation */}
            <div className="mt-2 flex items-center justify-between pt-4 border-t">
              <button
                onClick={handleBack}
                disabled={step === 0}
                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>

              {step < steps.length - 1 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className={[
                    'px-5 py-2 rounded-lg text-white shadow',
                    canProceed
                      ? 'bg-[#224765] hover:bg-[#1b3752]'
                      : 'bg-[#224765]/50 cursor-not-allowed',
                  ].join(' ')}
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={[
                    'px-5 py-2 rounded-lg text-white shadow',
                    submitting
                      ? 'bg-emerald-600/60 cursor-wait'
                      : 'bg-emerald-600 hover:bg-emerald-700',
                  ].join(' ')}
                >
                  {submitting ? 'Submitting…' :success? <img src={sucessGif}/>: 'Submit'}
                </button>
              )}
   
            </div>
          </div>

          {/* Soft footer bar */}
          <div className="bg-[#D3E2FD]/40 px-6 py-3 text-xs text-[#224765] flex items-center justify-between">
            <span>Step {step + 1} of {steps.length}</span>
            <span>All fields are securely processed.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export { MultiStepOnboarding };

import React from 'react'

export function Navigation({handleBack,step,steps,handleNext,canProceed,handleSubmit, submitting, success, sucessGif }) {
  return (
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
  )
}

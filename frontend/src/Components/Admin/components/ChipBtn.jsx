export const ChipBtn = ({ active, children, onClick, tone='light' }) => (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs ring-1 transition ${
        active
          ? (tone==='dark' ? 'bg-slate-200 text-slate-900 ring-slate-200' : 'bg-[#224765] text-white ring-[#224765]')
          : (tone==='dark' ? 'bg-slate-800 text-slate-200 ring-slate-600 hover:bg-slate-700' : 'bg-white text-[#224765] ring-[#224765]/30 hover:bg-[#D3E2FD]/40')
      }`}
    >
      {children}
    </button>
  );
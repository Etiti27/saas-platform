export const StatCard = ({ icon: Icon, label, value, sub }) => (
    <div className="flex items-center gap-4 rounded-2xl border border-[#224765]/10 bg-white p-4 shadow-sm">
      <div className="grid h-12 w-12 place-content-center rounded-xl ring-1 ring-[#224765]/20 bg-[#D3E2FD]/50">
        <Icon className="h-6 w-6 text-[#224765]" />
      </div>
      <div className="min-w-0">
        <div className="text-sm text-[#224765]/70">{label}</div>
        <div className="text-lg font-semibold truncate text-[#224765]">{value}</div>
        {sub && <div className="text-xs text-[#224765]/60">{sub}</div>}
      </div>
    </div>
  );
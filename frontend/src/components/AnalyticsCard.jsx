const accentStyles = {
  slate: {
    card: "from-white to-slate-50/90 border-slate-200/90",
    icon: "bg-slate-100 text-slate-600",
  },
  violet: {
    card: "from-violet-50/80 to-white border-violet-200/60",
    icon: "bg-violet-100 text-violet-700",
  },
  amber: {
    card: "from-amber-50/70 to-white border-amber-200/60",
    icon: "bg-amber-100 text-amber-800",
  },
  emerald: {
    card: "from-emerald-50/80 to-white border-emerald-200/60",
    icon: "bg-emerald-100 text-emerald-700",
  },
  rose: {
    card: "from-rose-50/80 to-white border-rose-200/60",
    icon: "bg-rose-100 text-rose-700",
  },
};

const AnalyticsCard = ({ icon, label, value, accent = "slate", testId }) => {
  const s = accentStyles[accent] ?? accentStyles.slate;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-sm shadow-slate-200/40 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300/80 hover:shadow-md ${s.card}`}
      data-testid={testId}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
          <p className="mt-1.5 font-heading text-3xl font-bold tabular-nums tracking-tight text-slate-900">{value}</p>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition group-hover:scale-105 ${s.icon}`}
          aria-hidden
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCard;

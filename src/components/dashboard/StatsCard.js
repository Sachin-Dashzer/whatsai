const THEMES = {
  green:  { icon: 'bg-emerald-50  text-emerald-600', val: 'text-slate-900', trend: 'text-emerald-600', dot: 'bg-emerald-400' },
  blue:   { icon: 'bg-blue-50     text-blue-600',    val: 'text-slate-900', trend: 'text-blue-600',    dot: 'bg-blue-400'    },
  purple: { icon: 'bg-violet-50   text-violet-600',  val: 'text-slate-900', trend: 'text-violet-600',  dot: 'bg-violet-400'  },
  orange: { icon: 'bg-orange-50   text-orange-600',  val: 'text-slate-900', trend: 'text-orange-600',  dot: 'bg-orange-400'  },
  rose:   { icon: 'bg-rose-50     text-rose-600',    val: 'text-slate-900', trend: 'text-rose-600',    dot: 'bg-rose-400'    },
};

export default function StatsCard({ title, value, change, icon, color = 'green', description }) {
  const t = THEMES[color] || THEMES.green;
  const isPos = change >= 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
          {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
          {change !== undefined && (
            <p className={`text-xs mt-2 font-medium flex items-center gap-1 ${isPos ? 'text-emerald-600' : 'text-red-500'}`}>
              <span>{isPos ? '↑' : '↓'}</span>
              {Math.abs(change)}% vs last period
            </p>
          )}
        </div>
        {icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${t.icon} group-hover:scale-110 transition-transform duration-200`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

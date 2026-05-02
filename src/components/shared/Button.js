export default function Button({ children, variant = 'primary', size = 'md', disabled, onClick, type = 'button', className = '' }) {
  const variants = {
    primary: 'bg-[#25D366] hover:bg-[#128C7E] text-white shadow-sm',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-sm',
    danger: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
    ghost: 'hover:bg-slate-100 text-slate-600 hover:text-slate-900',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center font-medium rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

import React from 'react';

const Button = ({ children, variant = 'primary', size = 'md', className = '', loading = false, ...props }) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-[10px] transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050B18]';

  const variants = {
    // Solid electric-blue primary
    primary:
      'bg-[#4F8EF7] text-white hover:bg-[#6BA3FF] shadow-[0_4px_16px_rgba(79,142,247,0.2)] hover:shadow-[0_0_20px_rgba(79,142,247,0.35)] hover:scale-[1.02] focus-visible:ring-[#4F8EF7]',

    // Ghost — barely there
    secondary:
      'bg-transparent text-text-secondary border border-[rgba(255,255,255,0.12)] hover:border-[rgba(79,142,247,0.4)] hover:text-text-primary hover:bg-white/[0.03] focus-visible:ring-white/20',

    // CTA — still uses gradient but cleaner
    cta:
      'bg-[#4F8EF7] text-white font-bold hover:bg-[#6BA3FF] shadow-[0_4px_20px_rgba(79,142,247,0.25)] hover:shadow-[0_0_24px_rgba(79,142,247,0.4)] hover:scale-[1.02] focus-visible:ring-[#4F8EF7]',

    // Ghost text
    ghost:
      'bg-transparent text-text-muted hover:text-text-primary hover:bg-white/[0.04] focus-visible:ring-white/10',

    // Destructive — rose-red
    danger:
      'bg-[#F05674]/10 text-[#F05674] hover:bg-[#F05674] hover:text-white border border-[#F05674]/25 hover:border-[#F05674] focus-visible:ring-[#F05674] transition-colors',

    // Outline
    outline:
      'bg-transparent text-text-primary border border-[rgba(255,255,255,0.12)] hover:border-[rgba(79,142,247,0.4)] hover:bg-white/[0.03] focus-visible:ring-white/20',
  };

  const sizes = {
    sm:   'px-4 py-2 text-sm',
    md:   'px-5 py-2.5 text-[14px]',
    lg:   'px-6 py-3 text-[15px] w-full',
    icon: 'p-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Processing...</span>
        </div>
      ) : children}
    </button>
  );
};

export default Button;

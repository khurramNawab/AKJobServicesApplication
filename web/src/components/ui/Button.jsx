import React from 'react';

const Button = ({ children, variant = 'primary', size = 'md', className = '', loading = false, ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#020617]';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.6)] focus:ring-primary',
    secondary: 'bg-white/5 text-white hover:bg-white/10 border border-white/10 backdrop-blur-md focus:ring-white/20',
    cta: 'bg-gradient-to-r from-primary to-indigo-500 text-white hover:opacity-90 shadow-lg shadow-primary/20 focus:ring-primary',
    ghost: 'bg-transparent text-slate-400 hover:text-white hover:bg-white/5 focus:ring-white/10',
    danger: 'bg-secondary/10 text-secondary hover:bg-secondary hover:text-white border border-secondary/20 focus:ring-secondary',
    outline: 'bg-transparent text-white border border-white/20 hover:border-white/40 hover:bg-white/5 focus:ring-white/20',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-[15px]',
    lg: 'px-8 py-4 text-base w-full',
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

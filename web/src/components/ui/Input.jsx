import React from 'react';

const Input = ({ label, id, error, icon: Icon, className = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-[13px] font-semibold text-slate-400 uppercase tracking-wider ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors duration-300">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          id={id}
          className={`w-full bg-white/[0.03] border ${
            error ? 'border-secondary/50 focus:border-secondary shadow-[0_0_15px_-3px_rgba(244,63,94,0.2)]' : 'border-white/10 focus:border-primary/50 focus:shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]'
          } rounded-xl px-5 py-3.5 outline-none text-slate-200 placeholder:text-slate-600 transition-all duration-300 focus:bg-white/[0.06] ${
            Icon ? 'pl-12' : ''
          }`}
          {...props}
        />
      </div>
      {error && <span className="text-[12px] text-secondary font-medium mt-1 ml-1">{error}</span>}
    </div>
  );
};

export default Input;

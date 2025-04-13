import React, { SelectHTMLAttributes } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  id: string;
  label: string;
  options: Option[] | string[];
  error?: string;
  helperText?: string;
}

export function SelectField({
  id,
  label,
  options,
  error,
  helperText,
  required,
  ...props
}: SelectFieldProps) {
  return (
    <div>
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {required && '*'}
      </label>
      <select
        id={id}
        {...props}
        className={`block w-full px-3 py-2 rounded-md focus:ring-2 border ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        {options.map((option, index) => {
          if (typeof option === 'string') {
            return (
              <option key={index} value={option}>
                {option}
              </option>
            );
          } else {
            return (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            );
          }
        })}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {helperText && !error && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
    </div>
  );
} 
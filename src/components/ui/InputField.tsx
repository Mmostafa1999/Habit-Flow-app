import React, { InputHTMLAttributes } from 'react';

interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
    id: string;
    label: string;
    error?: string;
    helperText?: string;
}

export function InputField({
    id,
    label,
    error,
    helperText,
    required,
    ...props
}: InputFieldProps) {
    return (
        <div>
            <label
                htmlFor={id}
                className="block text-sm font-medium text-gray-700 mb-1"
            >
                {label} {required && '*'}
            </label>
            <input
                id={id}
                {...props}
                className={`block w-full px-3 py-2 rounded-md focus:ring-2 border ${error ? 'border-red-500' : 'border-gray-300'
                    }`}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            {helperText && !error && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
        </div>
    );
} 
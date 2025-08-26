import React, { useState, useEffect } from 'react';

export function Input({ 
    value, 
    onChange, 
    placeholder = '', 
    disabled = false,
    className = '',
    type = 'text',
    error = null,
    success = false,
    defaultValue = '',
    focusColor = '#5750E3',
    ...props 
}) {
    // Initialize internal state with defaultValue
    const [internalValue, setInternalValue] = useState(defaultValue);

    // Update internal value when defaultValue changes
    useEffect(() => {
        setInternalValue(defaultValue);
    }, [defaultValue]);

    // Use controlled value if provided, otherwise use internal state
    const currentValue = value !== undefined ? value : internalValue;

    const handleChange = (e) => {
        const newValue = e.target.value;
        
        // Update internal state if not controlled
        if (value === undefined) {
            setInternalValue(newValue);
        }
        
        // Call parent onChange if provided
        if (onChange) {
            onChange(e);
        }
    };

    const baseClasses = `
        w-full p-2 border rounded-md 
        focus:outline-none focus:ring-1
        transition-all duration-200
        ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-text'}
    `;

    // Determine border color based on state
    let borderClasses = 'border-gray-300';
    if (error) {
        borderClasses = 'border-red-500 focus:ring-red-500';
    } else if (success) {
        borderClasses = 'border-green-500 focus:ring-green-500';
    } else {
        borderClasses = `border-gray-300`;
    }

    const inputClasses = `
        ${baseClasses}
        ${borderClasses}
        ${className}
    `;

    // Create inline styles for custom focus color
    const inputStyle = {
        '--focus-color': focusColor,
        '--tw-ring-color': focusColor,
    };

    return (
        <div className="relative">
            <style>{`
                input:focus {
                    --tw-ring-color: ${focusColor} !important;
                    box-shadow: 0 0 0 1px ${focusColor} !important;
                }
            `}</style>
            <input
                type={type}
                value={currentValue}
                onChange={handleChange}
                placeholder={placeholder}
                disabled={disabled}
                className={inputClasses}
                style={{
                    ...inputStyle,
                    '--tw-ring-color': focusColor,
                }}
                {...props}
            />
            {error && (
                <p className="text-sm text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
}

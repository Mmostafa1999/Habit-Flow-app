import React, { useState, useRef, useEffect } from 'react';
import Picker from 'emoji-picker-react';

interface EmojiPickerProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    helperText?: string;
}

export function EmojiPicker({
    id,
    label,
    value,
    onChange,
    error,
    helperText
}: EmojiPickerProps) {
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setShowPicker(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleEmojiClick = (emojiObject: { emoji: string }) => {
        onChange(emojiObject.emoji);
        setShowPicker(false);
    };

    return (
        <div className="relative">
            <label
                htmlFor={id}
                className="block text-sm font-medium text-gray-700 mb-1"
            >
                {label}
            </label>

            <div className="flex items-center">
                <button
                    ref={buttonRef}
                    type="button"
                    className={`flex items-center justify-center w-16 h-16 text-2xl border rounded-md ${error ? 'border-red-500' : 'border-gray-300'
                        }`}
                    onClick={() => setShowPicker(!showPicker)}
                >
                    {value || '😀'}
                </button>

                <div className="ml-3">
                    <button
                        type="button"
                        className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                        onClick={() => setShowPicker(!showPicker)}
                    >
                        {showPicker ? 'Close' : 'Choose'}
                    </button>
                </div>
            </div>

            {showPicker && (
                <div
                    ref={pickerRef}
                    className="absolute z-10 mt-1"
                >
                    <Picker onEmojiClick={handleEmojiClick} />
                </div>
            )}

            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            {helperText && !error && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
        </div>
    );
} 
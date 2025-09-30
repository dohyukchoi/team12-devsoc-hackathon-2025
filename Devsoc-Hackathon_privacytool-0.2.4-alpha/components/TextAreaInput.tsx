
import React from 'react';

interface TextAreaInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled: boolean;
}

export const TextAreaInput: React.FC<TextAreaInputProps> = ({ value, onChange, disabled }) => {
  return (
    <div>
      <label htmlFor="policy-text" className="block text-sm font-medium text-slate-300 mb-2">
        Document Text
      </label>
      <textarea
        id="policy-text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder="Paste the full text of the Privacy Policy or Terms of Service here..."
        className="w-full h-64 p-4 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
};

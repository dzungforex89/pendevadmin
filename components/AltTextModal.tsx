"use client";

import React, { useState, useEffect, useRef } from 'react';

type AltTextModalProps = {
  currentAlt: string;
  onClose: () => void;
  onApply: (altText: string) => void;
};

export default function AltTextModal({ currentAlt, onClose, onApply }: AltTextModalProps) {
  const [altText, setAltText] = useState(currentAlt);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleApply = () => {
    onApply(altText);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleApply();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-4"
        style={{ backgroundColor: 'oklch(0.98 0.01 260)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'oklch(0.22 0.04 260)' }}>
            Alt Text
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            style={{ color: 'oklch(0.22 0.04 260)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" style={{ color: 'oklch(0.22 0.04 260)' }}>
            Image Alt Text
          </label>
          <input
            ref={inputRef}
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 border-2 rounded"
            style={{
              backgroundColor: 'oklch(0.98 0.01 260)',
              borderColor: 'oklch(0.85 0.01 260)',
              color: 'oklch(0.22 0.04 260)',
            }}
            placeholder="Enter alt text for accessibility..."
          />
          <p className="text-xs mt-1" style={{ color: 'oklch(0.5 0.04 260)' }}>
          Alt text là một đoạn văn bản mô tả nội dung của bức ảnh.
          </p>
        </div>

        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded transition-colors text-sm"
            style={{
              backgroundColor: 'oklch(0.9 0.01 260)',
              color: 'oklch(0.22 0.04 260)',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-4 py-2 rounded transition-colors text-sm text-white"
            style={{
              backgroundColor: 'oklch(0.5638 0.2255 24.24)',
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}


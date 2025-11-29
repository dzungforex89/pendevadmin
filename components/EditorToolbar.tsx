"use client";

import React, { useRef } from 'react';

type EditorToolbarProps = {
  editorRef: React.RefObject<HTMLDivElement>;
};

export default function EditorToolbar({ editorRef }: EditorToolbarProps) {
  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];
  const fonts = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Helvetica'];
  const lineSpacings = ['1', '1.5', '2', '2.5', '3'];
  const highlightColors = ['#FFFF00', '#00FF00', '#00FFFF', '#FF00FF', '#FF0000', '#0000FF'];

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleFontSize = (size: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        // Có text được chọn
        const selectedText = range.toString();
        const span = document.createElement('span');
        span.style.fontSize = size;
        span.textContent = selectedText;
        range.deleteContents();
        range.insertNode(span);
      } else {
        // Không có text được chọn, áp dụng cho phần tử hiện tại
        const element = range.commonAncestorContainer.parentElement || range.commonAncestorContainer as Element;
        if (element) {
          (element as HTMLElement).style.fontSize = size;
        }
      }
      editorRef.current?.focus();
    }
  };

  const handleFontFamily = (font: string) => {
    execCommand('fontName', font);
  };

  const handleHighlight = (color: string) => {
    execCommand('backColor', color);
  };

  const handleLineSpacing = (spacing: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const element = range.commonAncestorContainer.parentElement || range.commonAncestorContainer as Element;
      if (element) {
        (element as HTMLElement).style.lineHeight = spacing;
      }
    }
  };

  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const handleUnlink = () => {
    execCommand('unlink');
  };

  return (
    <div className="border-b border-gray-300 bg-gray-50 p-2 flex flex-wrap gap-2 items-center">
      {/* Font Size */}
      <div className="flex items-center gap-1">
        <label className="text-xs text-gray-600">Size:</label>
        <select
          onChange={(e) => handleFontSize(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
          defaultValue="16px"
        >
          {fontSizes.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      {/* Font Family */}
      <div className="flex items-center gap-1">
        <label className="text-xs text-gray-600">Font:</label>
        <select
          onChange={(e) => handleFontFamily(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
          defaultValue="Arial"
        >
          {fonts.map((font) => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
      </div>

      <div className="w-px h-6 bg-gray-300"></div>

      {/* Text Formatting */}
      <button
        type="button"
        onClick={() => execCommand('bold')}
        className="px-2 py-1 border rounded hover:bg-gray-200 text-sm font-bold"
        title="Bold (Ctrl+B)"
      >
        B
      </button>
      <button
        type="button"
        onClick={() => execCommand('italic')}
        className="px-2 py-1 border rounded hover:bg-gray-200 text-sm italic"
        title="Italic (Ctrl+I)"
      >
        I
      </button>
      <button
        type="button"
        onClick={() => execCommand('underline')}
        className="px-2 py-1 border rounded hover:bg-gray-200 text-sm underline"
        title="Underline (Ctrl+U)"
      >
        U
      </button>

      <div className="w-px h-6 bg-gray-300"></div>

      {/* Highlight */}
      <div className="flex items-center gap-1">
        <label className="text-xs text-gray-600">Highlight:</label>
        <div className="flex gap-1">
          {highlightColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleHighlight(color)}
              className="w-6 h-6 border rounded hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              title={`Highlight ${color}`}
            />
          ))}
        </div>
      </div>

      <div className="w-px h-6 bg-gray-300"></div>

      {/* Line Spacing */}
      <div className="flex items-center gap-1">
        <label className="text-xs text-gray-600">Line:</label>
        <select
          onChange={(e) => handleLineSpacing(e.target.value)}
          className="border rounded px-2 py-1 text-sm"
          defaultValue="1.5"
        >
          {lineSpacings.map((spacing) => (
            <option key={spacing} value={spacing}>{spacing}</option>
          ))}
        </select>
      </div>

      <div className="w-px h-6 bg-gray-300"></div>

      {/* Link */}
      <button
        type="button"
        onClick={handleLink}
        className="px-2 py-1 border rounded hover:bg-gray-200 text-sm"
        title="Insert Link"
      >
        🔗 Link
      </button>
      <button
        type="button"
        onClick={handleUnlink}
        className="px-2 py-1 border rounded hover:bg-gray-200 text-sm"
        title="Remove Link"
      >
        Unlink
      </button>
    </div>
  );
}


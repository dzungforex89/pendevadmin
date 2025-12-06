"use client";

import React, { useEffect, useState, useRef } from 'react';

type StickyEditorToolbarProps = {
  activeEditorRef: React.RefObject<HTMLDivElement | null>;
  titleRef: React.RefObject<HTMLDivElement | null>;
  excerptRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
};

export default function StickyEditorToolbar({ 
  activeEditorRef, 
  titleRef, 
  excerptRef, 
  contentRef 
}: StickyEditorToolbarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [toolbarStyle, setToolbarStyle] = useState<React.CSSProperties>({});
  const toolbarRef = useRef<HTMLDivElement>(null);

  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];
  const fonts = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Helvetica'];
  const lineSpacings = ['1', '1.5', '2', '2.5', '3'];
  const highlightColors = ['#FFFF00', '#00FF00', '#00FFFF', '#FF00FF', '#FF0000', '#0000FF'];
  const textColors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB'];

  useEffect(() => {
    const updateToolbarPosition = () => {
      // Get position and width of input fields to match toolbar
      if (titleRef.current) {
        const rect = titleRef.current.getBoundingClientRect();
        setToolbarStyle({
          left: `${rect.left}px`,
          width: `${rect.width}px`,
        });
      }
    };

    const checkVisibility = () => {
      if (!titleRef.current || !contentRef.current) {
        // Nếu không có title hoặc content, luôn hiển thị khi có active editor
        setIsVisible(!!activeEditorRef.current);
        updateToolbarPosition();
        return;
      }

      const titleRect = titleRef.current.getBoundingClientRect();
      const contentRect = contentRef.current.getBoundingClientRect();
      
      // Hiển thị toolbar khi:
      // 1. Title đã scroll qua top (titleRect.top < 0)
      // 2. Content chưa scroll hết (contentRect.bottom > 0)
      const isInRange = titleRect.top <= 100 && contentRect.bottom >= -100;
      setIsVisible(isInRange);
      
      // Update toolbar position
      updateToolbarPosition();
    };

    const handleScroll = () => {
      checkVisibility();
    };

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (
        target === titleRef.current ||
        target === excerptRef.current ||
        target === contentRef.current ||
        titleRef.current?.contains(target) ||
        excerptRef.current?.contains(target) ||
        contentRef.current?.contains(target)
      )) {
        checkVisibility();
      }
    };

    // Check initially
    checkVisibility();
    updateToolbarPosition();

    // Update on resize
    window.addEventListener('resize', updateToolbarPosition);
    window.addEventListener('scroll', handleScroll, true);
    document.addEventListener('focusin', handleFocus);
    
    return () => {
      window.removeEventListener('resize', updateToolbarPosition);
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('focusin', handleFocus);
    };
  }, [activeEditorRef, titleRef, excerptRef, contentRef]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    activeEditorRef.current?.focus();
  };

  const handleFontSize = (size: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (!range.collapsed) {
        const selectedText = range.toString();
        const span = document.createElement('span');
        span.style.fontSize = size;
        span.textContent = selectedText;
        range.deleteContents();
        range.insertNode(span);
        // Giữ lại selection
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        selection.addRange(newRange);
      } else {
        const element = range.commonAncestorContainer.parentElement || range.commonAncestorContainer as Element;
        if (element) {
          (element as HTMLElement).style.fontSize = size;
        }
      }
      activeEditorRef.current?.focus();
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

  const handleTextColor = (color: string) => {
    execCommand('foreColor', color);
  };

  const handleInsertTable = () => {
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');
    if (rows && cols) {
      const table = document.createElement('table');
      table.style.borderCollapse = 'collapse';
      table.style.width = '100%';
      table.style.border = '1px solid #000';
      
      for (let i = 0; i < parseInt(rows); i++) {
        const tr = document.createElement('tr');
        for (let j = 0; j < parseInt(cols); j++) {
          const td = document.createElement('td');
          td.style.border = '1px solid #000';
          td.style.padding = '8px';
          td.innerHTML = '&nbsp;';
          tr.appendChild(td);
        }
        table.appendChild(tr);
      }
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(table);
        activeEditorRef.current?.focus();
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed top-0 z-50 border-b shadow-md"
      style={{ 
        ...toolbarStyle,
        backgroundColor: 'oklch(0.98 0.01 260)',
        borderColor: 'oklch(0.3036 0.1223 288)'
      }}
    >
      <div
        className="p-2 flex flex-wrap gap-2 items-center justify-center"
      >
      {/* Font Size */}
      <div className="flex items-center gap-1">
        <label className="text-xs" style={{ color: 'oklch(0.22 0.04 260)' }}>Size:</label>
        <select
          onChange={(e) => handleFontSize(e.target.value)}
          className="rounded px-2 py-1 text-sm"
          style={{ 
            borderColor: 'oklch(0.3036 0.1223 288)',
            borderWidth: '1px',
            color: 'oklch(0.22 0.04 260)'
          }}
          defaultValue="16px"
        >
          {fontSizes.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </div>

      {/* Font Family */}
      <div className="flex items-center gap-1">
        <label className="text-xs" style={{ color: 'oklch(0.22 0.04 260)' }}>Font:</label>
        <select
          onChange={(e) => handleFontFamily(e.target.value)}
          className="rounded px-2 py-1 text-sm"
          style={{ 
            borderColor: 'oklch(0.3036 0.1223 288)',
            borderWidth: '1px',
            color: 'oklch(0.22 0.04 260)'
          }}
          defaultValue="Arial"
        >
          {fonts.map((font) => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
      </div>

      <div className="w-px h-6" style={{ backgroundColor: 'oklch(0.3036 0.1223 288)' }}></div>

      {/* Text Formatting */}
      <button
        type="button"
        onClick={() => execCommand('bold')}
        className="px-2 py-1 rounded text-sm font-bold transition-colors"
        style={{ 
          borderColor: 'oklch(0.3036 0.1223 288)',
          borderWidth: '1px',
          color: 'oklch(0.22 0.04 260)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'oklch(0.95 0.01 260)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        title="Bold (Ctrl+B)"
      >
        B
      </button>
      <button
        type="button"
        onClick={() => execCommand('italic')}
        className="px-2 py-1 rounded text-sm italic transition-colors"
        style={{ 
          borderColor: 'oklch(0.3036 0.1223 288)',
          borderWidth: '1px',
          color: 'oklch(0.22 0.04 260)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'oklch(0.95 0.01 260)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        title="Italic (Ctrl+I)"
      >
        I
      </button>
      <button
        type="button"
        onClick={() => execCommand('underline')}
        className="px-2 py-1 rounded text-sm underline transition-colors"
        style={{ 
          borderColor: 'oklch(0.3036 0.1223 288)',
          borderWidth: '1px',
          color: 'oklch(0.22 0.04 260)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'oklch(0.95 0.01 260)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        title="Underline (Ctrl+U)"
      >
        U
      </button>

      <div className="w-px h-6" style={{ backgroundColor: 'oklch(0.3036 0.1223 288)' }}></div>

      {/* Highlight */}
      <div className="flex items-center gap-1">
        <label className="text-xs" style={{ color: 'oklch(0.22 0.04 260)' }}>Highlight:</label>
        <div className="flex gap-1">
          {highlightColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleHighlight(color)}
              className="w-6 h-6 rounded hover:scale-110 transition-transform"
              style={{ 
                backgroundColor: color,
                borderColor: 'oklch(0.3036 0.1223 288)',
                borderWidth: '1px'
              }}
              title={`Highlight ${color}`}
            />
          ))}
        </div>
      </div>

      <div className="w-px h-6" style={{ backgroundColor: 'oklch(0.3036 0.1223 288)' }}></div>

      {/* Line Spacing */}
      <div className="flex items-center gap-1">
        <label className="text-xs" style={{ color: 'oklch(0.22 0.04 260)' }}>Line:</label>
        <select
          onChange={(e) => handleLineSpacing(e.target.value)}
          className="rounded px-2 py-1 text-sm"
          style={{ 
            borderColor: 'oklch(0.3036 0.1223 288)',
            borderWidth: '1px',
            color: 'oklch(0.22 0.04 260)'
          }}
          defaultValue="1.5"
        >
          {lineSpacings.map((spacing) => (
            <option key={spacing} value={spacing}>{spacing}</option>
          ))}
        </select>
      </div>

      <div className="w-px h-6" style={{ backgroundColor: 'oklch(0.3036 0.1223 288)' }}></div>

      {/* Text Color */}
      <div className="flex items-center gap-1">
        <label className="text-xs" style={{ color: 'oklch(0.22 0.04 260)' }}>Text:</label>
        <div className="flex gap-1">
          {textColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => handleTextColor(color)}
              className="w-6 h-6 rounded hover:scale-110 transition-transform"
              style={{ 
                backgroundColor: color,
                borderColor: 'oklch(0.3036 0.1223 288)',
                borderWidth: '1px'
              }}
              title={`Text color ${color}`}
            />
          ))}
        </div>
      </div>

      <div className="w-px h-6" style={{ backgroundColor: 'oklch(0.3036 0.1223 288)' }}></div>

      {/* Link */}
      <button
        type="button"
        onClick={handleLink}
        className="px-2 py-1 rounded text-sm transition-colors"
        style={{ 
          borderColor: 'oklch(0.3036 0.1223 288)',
          borderWidth: '1px',
          color: 'oklch(0.22 0.04 260)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'oklch(0.95 0.01 260)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        title="Insert Link"
      >
        🔗 Link
      </button>
      <button
        type="button"
        onClick={handleUnlink}
        className="px-2 py-1 rounded text-sm transition-colors"
        style={{ 
          borderColor: 'oklch(0.3036 0.1223 288)',
          borderWidth: '1px',
          color: 'oklch(0.22 0.04 260)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'oklch(0.95 0.01 260)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        title="Remove Link"
      >
        Unlink
      </button>

      <div className="w-px h-6" style={{ backgroundColor: 'oklch(0.3036 0.1223 288)' }}></div>

      {/* Table */}
      <button
        type="button"
        onClick={handleInsertTable}
        className="px-2 py-1 rounded text-sm transition-colors"
        style={{ 
          borderColor: 'oklch(0.3036 0.1223 288)',
          borderWidth: '1px',
          color: 'oklch(0.22 0.04 260)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'oklch(0.95 0.01 260)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        title="Insert Table"
      >
        📊 Table
      </button>
      </div>
    </div>
  );
}


'use client';

import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const open = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsOpen(true);
  };

  // 触摸端 click 后不触发 mouseleave，用延迟关闭兜底，避免 tooltip 卡住不消失
  const close = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsOpen(false), 120);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <span className="relative inline-flex items-center ml-1 group">
      <button
type="button"
        onMouseEnter={open}
        onMouseLeave={close}
        onFocus={open}
        onBlur={close}
        onClick={(e) => {
          // 阻止冒泡与默认行为，避免触发外层 <label> 的聚焦跳转
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((v) => !v);
        }}
        aria-expanded={isOpen}
        aria-label="More information"
        className="text-slate-400 hover:text-emerald-400 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-400 rounded"
      >
      <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
 <span
          role="tooltip"
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl text-[11px] text-slate-200 leading-snug z-50 animate-in fade-in zoom-in-95 duration-150"
        >
    {content}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-700" />
        </span>
      )}
    </span>
  );
};
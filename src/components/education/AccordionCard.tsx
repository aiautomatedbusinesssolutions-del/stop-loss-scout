"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

export default function AccordionCard({ icon, title, children }: AccordionCardProps) {
  const [open, setOpen] = useState(false);
  const contentId = useId();

  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-800/40 transition-colors"
        aria-expanded={open}
        aria-controls={contentId}
      >
        {icon}
        <span className="text-sm font-medium text-slate-200 flex-1">
          {title}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div id={contentId} className="expand-content" data-open={open}>
        <div>
          <div className="px-4 pb-4 pt-1 text-sm text-slate-400 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

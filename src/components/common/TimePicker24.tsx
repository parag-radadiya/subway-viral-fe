import React, { useEffect, useRef, useState, useCallback } from "react";
import { Clock } from "lucide-react";
import { cn } from "../../utils";

interface TimePicker24Props {
  label?: string;
  value: string; // "HH:mm"
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);
const ITEM_H = 40;

const TimePicker24: React.FC<TimePicker24Props> = ({
  label,
  value,
  onChange,
  error,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const minListRef = useRef<HTMLDivElement>(null);

  const [hh, mm] = value ? value.split(":") : ["", ""];
  const selectedHour = hh || "";
  const selectedMin = mm || "";

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll selected item to top of list when opened
  const scrollTo = useCallback(
    (ref: React.RefObject<HTMLDivElement | null>, index: number) => {
      if (ref.current) {
        ref.current.scrollTop = Math.max(0, index * ITEM_H);
      }
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    const hi = HOURS.indexOf(selectedHour);
    const mi = MINUTES.indexOf(selectedMin);
    const t = setTimeout(() => {
      scrollTo(hourListRef, hi >= 0 ? hi : 0);
      scrollTo(minListRef, mi >= 0 ? mi : 0);
    }, 30);
    return () => clearTimeout(t);
  }, [open, selectedHour, selectedMin, scrollTo]);

  const pickHour = (h: string) => onChange(`${h}:${selectedMin || "00"}`);
  const pickMin = (m: string) => onChange(`${selectedHour || "00"}:${m}`);

  const display =
    selectedHour && selectedMin ? `${selectedHour}:${selectedMin}` : "";

  return (
    <div
      ref={containerRef}
      className={cn("relative flex flex-col gap-1 w-full", className)}
    >
      {label && (
        <label className="text-xs font-medium text-primary-700">{label}</label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center justify-between rounded-lg border bg-white px-4 py-2.5 text-sm transition-all duration-150 focus:outline-none",
          open
            ? "border-accent-400 ring-2 ring-accent-200"
            : "border-slate-200 hover:border-slate-300",
          error ? "border-danger-500" : "",
        )}
      >
        <span className={cn(display ? "text-primary-800" : "text-slate-400")}>
          {display || "-- : --"}
        </span>
        <Clock size={14} className="text-slate-400 shrink-0" />
      </button>

      {error && (
        <p className="text-xs text-danger-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-md shadow-xl overflow-hidden">
          {/* Columns */}
          <div
            className="grid grid-cols-2 divide-x divide-slate-100"
            style={{ height: `${ITEM_H * 6}px` }}
          >
            {/* Hours */}
            <div
              ref={hourListRef}
              className="overflow-y-auto"
              style={{ scrollbarWidth: "none" }}
            >
              {HOURS.map((h) => {
                const active = h === selectedHour;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => pickHour(h)}
                    style={{ height: ITEM_H }}
                    className={cn(
                      "w-full flex items-center justify-center font-mono text-sm font-semibold transition-colors",
                      active
                        ? "bg-accent-50 text-accent-700"
                        : "text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    {h}
                  </button>
                );
              })}
            </div>

            {/* Minutes */}
            <div
              ref={minListRef}
              className="overflow-y-auto"
              style={{ scrollbarWidth: "none" }}
            >
              {MINUTES.map((m) => {
                const active = m === selectedMin;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => pickMin(m)}
                    style={{ height: ITEM_H }}
                    className={cn(
                      "w-full flex items-center justify-center font-mono text-sm font-semibold transition-colors",
                      active
                        ? "bg-accent-50 text-accent-700"
                        : "text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker24;

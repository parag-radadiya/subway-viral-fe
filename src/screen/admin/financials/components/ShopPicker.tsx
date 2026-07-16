import { useState } from "react";
import { Store, ChevronDown, Search, CheckCircle2 } from "lucide-react";
import { Shop } from "./types";

export function ShopPicker({
  shops,
  value,
  onChange,
  disabledIds,
}: {
  shops: Shop[];
  value: string;
  onChange: (id: string) => void;
  disabledIds: string[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = shops.find((s) => s._id === value);
  const filtered = shops.filter(
    (s) =>
      s.is_active !== false &&
      !s.is_all_shops &&
      s.name.toLowerCase().includes(search.toLowerCase()) &&
      (!disabledIds.includes(s._id) || s._id === value),
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-left hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-accent-200 transition-all"
      >
        <Store size={14} className="text-slate-400 shrink-0" />
        <span
          className={
            selected
              ? "text-slate-800 font-semibold flex-1 truncate"
              : "text-slate-400 flex-1"
          }
        >
          {selected ? selected.name : "Select shop…"}
        </span>
        <ChevronDown
          size={13}
          className={`text-slate-400 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search
                size={12}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                autoFocus
                className="w-full pl-7 pr-3 py-1.5 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-accent-300"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-44 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-slate-400 px-3 py-3 text-center">
                No shops available
              </p>
            ) : (
              filtered.map((s) => (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => {
                    onChange(s._id);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 hover:bg-accent-50 transition-colors ${
                    s._id === value
                      ? "bg-accent-50 text-accent-700 font-semibold"
                      : "text-slate-700"
                  }`}
                >
                  <Store size={12} className="text-slate-400 shrink-0" />
                  {s.name}
                  {s._id === value && (
                    <CheckCircle2
                      size={12}
                      className="ml-auto text-accent-500"
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

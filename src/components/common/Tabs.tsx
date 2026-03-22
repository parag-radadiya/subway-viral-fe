import clsx from "clsx";

interface TabOption {
  label: string;
  value: string;
}

interface TabsProps {
  options: TabOption[];
  activeTab: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function Tabs({
  options,
  activeTab,
  onChange,
  className,
}: TabsProps) {
  return (
    <div className={clsx("flex bg-slate-100 p-1 rounded-lg w-fit", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          className={clsx(
            "px-4 py-2 rounded-lg text-xs font-bold transition-all",
            activeTab === option.value
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700",
          )}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
